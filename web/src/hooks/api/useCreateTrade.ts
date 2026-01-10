import { api } from '@/lib/api';
import type { CreateTradeDto, TradeResponseDto } from '@/types/api.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation<TradeResponseDto, Error, CreateTradeDto>({
    mutationFn: async (tradeData) => {
      const response = await api.post('/v1/trades', tradeData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate trades query to refetch list
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trade-groups'] });
    },
  });
}
