import { TradeGroup, TradeStatus } from '@prisma/client';
import { EnrichedTrade } from './enriched-trade.interface';

export interface TradeGroupWithMetrics extends TradeGroup {
  readonly trades: EnrichedTrade[];
  readonly closingExpiry: Date;
  readonly daysUntilClosingExpiry: number;
  readonly status: TradeStatus;
  readonly totalCostBasis: number;
  readonly totalCurrentValue: number;
  readonly profitLoss: number;
}
