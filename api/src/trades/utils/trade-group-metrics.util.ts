import { Trade, TradeStatus } from '@prisma/client';
import { min } from 'date-fns';
import { TradeStatusUtil } from './trade-status.util';

export class TradeGroupMetricsUtil {
  static calculateClosingExpiry(trades: Trade[]): Date {
    const expiryDates = trades.map((trade) => new Date(trade.expiryDate));
    return min(expiryDates);
  }

  static calculateTotalCostBasis(trades: Trade[]): number {
    return trades.reduce((sum, trade) => sum + Number(trade.costBasis), 0);
  }

  static calculateTotalCurrentValue(trades: Trade[]): number {
    return trades.reduce((sum, trade) => sum + Number(trade.currentValue), 0);
  }

  static calculateProfitLoss(totalCurrentValue: number, totalCostBasis: number): number {
    return totalCurrentValue - totalCostBasis;
  }

  static deriveGroupStatus(closingExpiry: Date): TradeStatus {
    const daysUntilClosingExpiry = TradeStatusUtil.calculateDaysUntilExpiry(closingExpiry);
    return TradeStatusUtil.deriveStatusFromDays(daysUntilClosingExpiry);
  }
}
