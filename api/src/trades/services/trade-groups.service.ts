import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTradeGroupDto, UpdateTradeGroupDto } from '../dto/request';
import { TradeGroupWithMetrics } from '../interfaces/trade-group-with-metrics.interface';
import { TradeStatus, TradeGroup, Trade } from '@prisma/client';
import { TradeEnrichmentUtil } from '../utils/trade-enrichment.util';

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
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`Trade group with UUID '${uuid}' not found`);
      }
      throw error;
    }
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

    const closingExpiry = new Date(Math.min(...trades.map((t) => new Date(t.expiryDate).getTime())));

    const daysUntilClosingExpiry = this.calculateDaysUntilExpiry(closingExpiry);

    const status = this.deriveStatus(daysUntilClosingExpiry);

    const totalCostBasis = trades.reduce((sum, t) => sum + Number(t.costBasis), 0);

    const totalCurrentValue = trades.reduce((sum, t) => sum + Number(t.currentValue), 0);

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

  private calculateDaysUntilExpiry(closingExpiry: Date): number {
    const now = new Date();
    const diffMs = closingExpiry.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private deriveStatus(daysUntilClosingExpiry: number): TradeStatus {
    if (daysUntilClosingExpiry < 0) {
      return TradeStatus.CLOSED;
    }

    if (daysUntilClosingExpiry <= 7) {
      return TradeStatus.CLOSING_SOON;
    }

    return TradeStatus.OPEN;
  }
}
