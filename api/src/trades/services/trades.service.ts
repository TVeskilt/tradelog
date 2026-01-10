import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTradeDto, UpdateTradeDto } from '../dto/request';
import { TradeStatus } from '@prisma/client';
import { TradeEnrichmentUtil } from '../utils/trade-enrichment.util';
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
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`Trade with UUID '${uuid}' not found`);
      }
      throw error;
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
      await this.prisma.$transaction(async (tx) => {
        const remainingTrades = await tx.trade.count({
          where: {
            tradeGroupUuid: trade.tradeGroupUuid,
            uuid: { not: uuid },
          },
        });

        if (remainingTrades < 2 && trade.tradeGroupUuid) {
          await tx.trade.updateMany({
            where: { tradeGroupUuid: trade.tradeGroupUuid },
            data: { tradeGroupUuid: null },
          });

          await tx.tradeGroup.delete({
            where: { uuid: trade.tradeGroupUuid },
          });
        }

        await tx.trade.delete({
          where: { uuid },
        });
      });
    } else {
      await this.prisma.trade.delete({
        where: { uuid },
      });
    }
  }
}
