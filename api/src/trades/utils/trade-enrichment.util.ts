import { Trade } from '@prisma/client';

interface EnrichedTrade extends Trade {
  readonly strikePrice: number;
  readonly costBasis: number;
  readonly currentValue: number;
  readonly pnl: number;
  readonly daysToExpiry: number;
}

export class TradeEnrichmentUtil {
  static enrichWithDerivedFields(trade: Trade): EnrichedTrade {
    const costBasis = Number(trade.costBasis);
    const currentValue = Number(trade.currentValue);

    return {
      ...trade,
      strikePrice: Number(trade.strikePrice),
      costBasis,
      currentValue,
      pnl: this.calculatePnL(costBasis, currentValue),
      daysToExpiry: this.calculateDaysToExpiry(trade.expiryDate),
    };
  }

  private static calculatePnL(costBasis: number, currentValue: number): number {
    return currentValue - costBasis;
  }

  private static calculateDaysToExpiry(expiryDate: Date): number {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
