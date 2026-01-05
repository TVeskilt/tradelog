import { Group, TradeStatus } from '@prisma/client';
import { EnrichedTradeInterface } from './enriched-trade.interface';

export interface GroupWithMetricsInterface extends Group {
  readonly trades: EnrichedTradeInterface[];
  readonly closingExpiry: Date;
  readonly daysUntilClosingExpiry: number;
  readonly status: TradeStatus;
  readonly totalCostBasis: number;
  readonly totalCurrentValue: number;
  readonly profitLoss: number;
}
