import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTradeGroupDto, UpdateTradeGroupDto, CreateStrategyDto } from '../dto/request';
import { TradeGroupWithMetrics } from '../interfaces/trade-group-with-metrics.interface';
import { TradeStatus, TradeGroup, Trade } from '@prisma/client';
import { TradeEnrichmentUtil } from '../utils/trade-enrichment.util';
import { TradeStatusUtil } from '../utils/trade-status.util';
import { PrismaErrorUtil } from '../../common/utils/prisma-error.util';
import { min } from 'date-fns';

@Injectable()
export class TradeGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeGroupDto: CreateTradeGroupDto): Promise<TradeGroupWithMetrics> {
    const { tradeUuids, ...tradeGroupData } = createTradeGroupDto;

    const trades = await this.prisma.trade.findMany({
      where: { uuid: { in: tradeUuids } },
    });

    if (trades.length !== tradeUuids.length) {
      throw new BadRequestException('One or more trade UUIDs not found');
    }

    const newTradeGroup = await this.prisma.tradeGroup.create({ data: tradeGroupData });

    await this.prisma.trade.updateMany({
      where: { uuid: { in: tradeUuids } },
      data: { tradeGroupUuid: newTradeGroup.uuid },
    });

    const tradeGroup = await this.prisma.tradeGroup.findUnique({
      where: { uuid: newTradeGroup.uuid },
      include: { trades: true },
    });

    if (!tradeGroup) {
      throw new Error('Failed to create trade group');
    }

    return this.calculateMetrics(tradeGroup);
  }

  async findMany(): Promise<TradeGroupWithMetrics[]> {
    const tradeGroups = await this.prisma.tradeGroup.findMany({
      include: { trades: true },
      orderBy: { createdAt: 'desc' },
    });

    return tradeGroups.map((tg) => this.calculateMetrics(tg));
  }

  async findByUuid(uuid: string): Promise<TradeGroupWithMetrics> {
    const tradeGroup = await this.prisma.tradeGroup.findUnique({
      where: { uuid },
      include: { trades: true },
    });

    if (!tradeGroup) {
      throw new NotFoundException(`Trade group with UUID '${uuid}' not found`);
    }

    return this.calculateMetrics(tradeGroup);
  }

  async updateByUuid(uuid: string, updateTradeGroupDto: UpdateTradeGroupDto): Promise<TradeGroupWithMetrics> {
    try {
      const tradeGroup = await this.prisma.tradeGroup.update({
        where: { uuid },
        data: updateTradeGroupDto,
        include: { trades: true },
      });

      return this.calculateMetrics(tradeGroup);
    } catch (error) {
      PrismaErrorUtil.handleNotFoundError(error, 'Trade group', uuid);
    }
  }

  async createStrategy(createStrategyDto: CreateStrategyDto): Promise<TradeGroupWithMetrics> {
    const { group, trades } = createStrategyDto;

    const result = await this.prisma.$transaction(async (prisma) => {
      const newTradeGroup = await prisma.tradeGroup.create({
        data: {
          name: group.name,
          strategyType: group.strategyType,
          notes: group.notes,
        },
      });

      const createdTrades = await Promise.all(
        trades.map((tradeData) =>
          prisma.trade.create({
            data: {
              ...tradeData,
              tradeGroupUuid: newTradeGroup.uuid,
              status: TradeStatus.OPEN,
            },
          }),
        ),
      );

      return {
        ...newTradeGroup,
        trades: createdTrades,
      };
    });

    return this.calculateMetrics(result);
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const tradeGroup = await this.prisma.tradeGroup.findUnique({
      where: { uuid },
    });

    if (!tradeGroup) {
      throw new NotFoundException(`Trade group with UUID '${uuid}' not found`);
    }

    await this.prisma.tradeGroup.delete({ where: { uuid } });
  }

  private calculateMetrics(tradeGroup: TradeGroup & { trades: Trade[] }): TradeGroupWithMetrics {
    const { trades } = tradeGroup;

    if (trades.length === 0) {
      throw new Error('Trade group must have at least one trade');
    }

    const enrichedTrades = trades.map((trade) => TradeEnrichmentUtil.enrichWithDerivedFields(trade));
    const closingExpiry = min(trades.map((trade) => new Date(trade.expiryDate)));
    const daysUntilClosingExpiry = TradeStatusUtil.calculateDaysUntilExpiry(closingExpiry);
    const status = TradeStatusUtil.deriveStatusFromDays(daysUntilClosingExpiry);
    const totalCostBasis = trades.reduce((sum, trade) => sum + Number(trade.costBasis), 0);
    const totalCurrentValue = trades.reduce((sum, trade) => sum + Number(trade.currentValue), 0);
    const profitLoss = totalCurrentValue - totalCostBasis;

    return {
      ...tradeGroup,
      trades: enrichedTrades,
      closingExpiry,
      daysUntilClosingExpiry,
      status,
      totalCostBasis,
      totalCurrentValue,
      profitLoss,
    };
  }
}
