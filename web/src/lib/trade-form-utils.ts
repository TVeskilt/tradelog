import type { CreateTradeSchema } from '@/schemas';
import type { StrategyGroup } from '@/types/trade-form.types';

export const validateStrategyCreation = (
  strategyGroup: StrategyGroup,
  tradesList: CreateTradeSchema[],
): string | null => {
  if (tradesList.length < 2) {
    return 'Strategy must have at least 2 trades';
  }

  if (!strategyGroup.name.trim()) {
    return 'Strategy name is required';
  }

  return null;
};

export const cleanTradeData = (data: CreateTradeSchema): CreateTradeSchema => ({
  ...data,
  notes: data.notes || undefined,
  tradeGroupUuid: undefined,
});

export const prepareStrategyPayload = (
  strategyGroup: StrategyGroup,
  tradesList: CreateTradeSchema[],
) => ({
  group: {
    name: strategyGroup.name,
    strategyType: strategyGroup.strategyType,
    notes: strategyGroup.notes || undefined,
  },
  trades: tradesList,
});
