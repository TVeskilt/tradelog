import { Trade } from '@prisma/client';
import { differenceInDays } from 'date-fns';
import { EnrichedTrade } from '../interfaces';

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
    return differenceInDays(expiryDate, new Date());
  }
}
