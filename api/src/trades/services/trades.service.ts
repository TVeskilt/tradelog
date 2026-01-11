import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTradeDto, UpdateTradeDto } from '../dto/request';
import { TradeStatus } from '@prisma/client';
import { TradeEnrichmentUtil } from '../utils/trade-enrichment.util';
import { PrismaErrorUtil } from '../../common/utils/prisma-error.util';
import { EnrichedTrade } from '../interfaces';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto): Promise<EnrichedTrade> {
    const trade = await this.prisma.trade.create({
      data: {
        ...createTradeDto,
        status: TradeStatus.OPEN,
      },
    });

    return TradeEnrichmentUtil.enrichWithDerivedFields(trade);
  }

  async findMany(): Promise<EnrichedTrade[]> {
    const trades = await this.prisma.trade.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return trades.map((trade) => TradeEnrichmentUtil.enrichWithDerivedFields(trade));
  }

  async findByUuid(uuid: string): Promise<EnrichedTrade> {
    const trade = await this.prisma.trade.findUnique({
      where: { uuid },
    });

    if (!trade) {
      throw new NotFoundException(`Trade with UUID '${uuid}' not found`);
    }

    return TradeEnrichmentUtil.enrichWithDerivedFields(trade);
  }

  async updateByUuid(uuid: string, updateTradeDto: UpdateTradeDto): Promise<EnrichedTrade> {
    try {
      const trade = await this.prisma.trade.update({
        where: { uuid },
        data: updateTradeDto,
      });

      return TradeEnrichmentUtil.enrichWithDerivedFields(trade);
    } catch (error) {
      PrismaErrorUtil.handleNotFoundError(error, 'Trade', uuid);
    }
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const trade = await this.prisma.trade.findUnique({
      where: { uuid },
    });

    if (!trade) {
      throw new NotFoundException(`Trade with UUID '${uuid}' not found`);
    }

    if (trade.tradeGroupUuid) {
      await this.handleGroupedTradeDelete(uuid, trade.tradeGroupUuid);
    } else {
      await this.prisma.trade.delete({ where: { uuid } });
    }
  }

  private async handleGroupedTradeDelete(tradeUuid: string, groupUuid: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const remainingTrades = await tx.trade.count({
        where: {
          tradeGroupUuid: groupUuid,
          uuid: { not: tradeUuid },
        },
      });

      if (remainingTrades < 2) {
        await tx.trade.updateMany({
          where: { tradeGroupUuid: groupUuid },
          data: { tradeGroupUuid: null },
        });

        await tx.tradeGroup.delete({
          where: { uuid: groupUuid },
        });
      }

      await tx.trade.delete({
        where: { uuid: tradeUuid },
      });
    });
  }
}
