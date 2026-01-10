import { api } from '@/lib/api';
import type { TradeGroupResponseDto } from '@/types/api.types';
import { useQuery } from '@tanstack/react-query';

export function useTradeGroups() {
  return useQuery<TradeGroupResponseDto[]>({
    queryKey: ['trade-groups'],
    queryFn: async () => {
      const response = await api.get('/v1/trade-groups');
      return response.data;
    },
  });
}
