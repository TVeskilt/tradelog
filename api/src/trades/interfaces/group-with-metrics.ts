import { Group, Trade, TradeStatus } from '@prisma/client';

export interface GroupWithMetrics extends Group {
  readonly trades: Trade[];
  readonly closingExpiry: Date;
  readonly daysUntilClosingExpiry: number;
  readonly status: TradeStatus;
  readonly totalCostBasis: number;
  readonly totalCurrentValue: number;
  readonly profitLoss: number;
}