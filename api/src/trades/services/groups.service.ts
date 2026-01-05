import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from '../dto/request';
import { GroupWithMetricsInterface } from '../interfaces/group-with-metrics.interface';
import { TradeStatus, Group, Trade } from '@prisma/client';
import { TradeEnrichmentUtil } from '../utils/trade-enrichment.util';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto): Promise<GroupWithMetricsInterface> {
    const { tradeUuids, ...groupData } = createGroupDto;

    const trades = await this.prisma.trade.findMany({
      where: { uuid: { in: tradeUuids } },
    });

    if (trades.length !== tradeUuids.length) {
      throw new BadRequestException('One or more trade UUIDs not found');
    }

    const newGroup = await this.prisma.group.create({ data: groupData });

    await this.prisma.trade.updateMany({
      where: { uuid: { in: tradeUuids } },
      data: { groupUuid: newGroup.uuid },
    });

    const group = await this.prisma.group.findUnique({
      where: { uuid: newGroup.uuid },
      include: { trades: true },
    });

    if (!group) {
      throw new Error('Failed to create group');
    }

    return this.calculateMetrics(group);
  }

  async findMany(): Promise<GroupWithMetricsInterface[]> {
    const groups = await this.prisma.group.findMany({
      include: { trades: true },
      orderBy: { createdAt: 'desc' },
    });

    return groups.map((g) => this.calculateMetrics(g));
  }

  async findByUuid(uuid: string): Promise<GroupWithMetricsInterface> {
    const group = await this.prisma.group.findUnique({
      where: { uuid },
      include: { trades: true },
    });

    if (!group) {
      throw new NotFoundException(`Group with UUID '${uuid}' not found`);
    }

    return this.calculateMetrics(group);
  }

  async updateByUuid(uuid: string, updateGroupDto: UpdateGroupDto): Promise<GroupWithMetricsInterface> {
    try {
      const group = await this.prisma.group.update({
        where: { uuid },
        data: updateGroupDto,
        include: { trades: true },
      });

      return this.calculateMetrics(group);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`Group with UUID '${uuid}' not found`);
      }
      throw error;
    }
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { uuid },
    });

    if (!group) {
      throw new NotFoundException(`Group with UUID '${uuid}' not found`);
    }

    await this.prisma.group.delete({ where: { uuid } });
  }

  private calculateMetrics(group: Group & { trades: Trade[] }): GroupWithMetricsInterface {
    const { trades } = group;

    if (trades.length === 0) {
      throw new Error('Group must have at least one trade');
    }

    const enrichedTrades = trades.map((trade) => TradeEnrichmentUtil.enrichWithDerivedFields(trade));

    const closingExpiry = new Date(Math.min(...trades.map((t) => new Date(t.expiryDate).getTime())));

    const daysUntilClosingExpiry = this.calculateDaysUntilExpiry(closingExpiry);

    const status = this.deriveStatus(daysUntilClosingExpiry);

    const totalCostBasis = trades.reduce((sum, t) => sum + Number(t.costBasis), 0);

    const totalCurrentValue = trades.reduce((sum, t) => sum + Number(t.currentValue), 0);

    const profitLoss = totalCurrentValue - totalCostBasis;

    return {
      ...group,
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
