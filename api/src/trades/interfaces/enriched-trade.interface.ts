import { Trade } from '@prisma/client';

export interface EnrichedTradeInterface extends Omit<Trade, 'strikePrice' | 'costBasis' | 'currentValue'> {
  readonly strikePrice: number;
  readonly costBasis: number;
  readonly currentValue: number;
  readonly pnl: number;
  readonly daysToExpiry: number;
}
