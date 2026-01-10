// API Type definitions for TradeLog
// These should ideally be generated from OpenAPI spec using openapi-typescript
// For now, manually defining based on STORY-004 backend implementation

export type TradeType = 'BUY' | 'SELL';
export type OptionType = 'CALL' | 'PUT';
export type TradeStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
export type StrategyType = 'CALENDAR_SPREAD' | 'RATIO_CALENDAR_SPREAD' | 'CUSTOM';

export interface CreateTradeDto {
  symbol: string;
  strikePrice: number;
  expiryDate: string; // ISO date string
  tradeType: TradeType;
  optionType: OptionType;
  quantity: number;
  costBasis: number;
  currentValue: number;
  notes?: string;
  tradeGroupUuid?: string;
}

export interface UpdateTradeDto {
  symbol?: string;
  strikePrice?: number;
  expiryDate?: string;
  tradeType?: TradeType;
  optionType?: OptionType;
  quantity?: number;
  costBasis?: number;
  currentValue?: number;
  notes?: string;
  tradeGroupUuid?: string;
}

export interface TradeResponseDto {
  uuid: string;
  symbol: string;
  strikePrice: number;
  expiryDate: string;
  tradeType: TradeType;
  optionType: OptionType;
  quantity: number;
  costBasis: number;
  currentValue: number;
  pnl: number; // Calculated field
  daysToExpiry: number; // Calculated field
  status: TradeStatus;
  notes?: string;
  tradeGroupUuid?: string;
}

export interface TradeGroupResponseDto {
  uuid: string;
  name: string;
  strategyType: StrategyType;
  notes?: string;
  closingExpiry?: string; // Calculated: MIN of trade expiry dates
  status: TradeStatus; // Derived from trades
  totalPnL: number; // Calculated: SUM of trade P&Ls
  trades?: TradeResponseDto[];
}

export interface CreateTradeGroupDto {
  name: string;
  strategyType: StrategyType;
  notes?: string;
}

export interface UpdateTradeGroupDto {
  name?: string;
  strategyType?: StrategyType;
  notes?: string;
}

// API Response wrapper
export interface DataResponse<T> {
  data: T;
}
