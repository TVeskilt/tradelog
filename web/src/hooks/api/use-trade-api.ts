import { apiClient } from '@/lib';
import { useQueryClient } from '@tanstack/react-query';

export const useTradeApi = () => {
  const queryClient = useQueryClient();

  const createTrade = apiClient.useMutation('post', '/v1/trades', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trades'] });
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups'] });
    },
  });

  const getTrades = () => {
    return apiClient.useQuery('get', '/v1/trades');
  };

  const getTrade = (uuid: string) => {
    return apiClient.useQuery('get', '/v1/trades/{uuid}', {
      params: {
        path: { uuid },
      },
    });
  };

  const updateTrade = apiClient.useMutation('put', '/v1/trades/{uuid}', {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'get',
          '/v1/trades/{uuid}',
          {
            params: {
              path: {
                uuid: variables.params.path.uuid,
              },
            },
          },
        ],
      });
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trades'] });
    },
  });

  const deleteTrade = apiClient.useMutation('delete', '/v1/trades/{uuid}', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trades'] });
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups'] });
    },
  });

  return {
    createTrade,
    getTrades,
    getTrade,
    updateTrade,
    deleteTrade,
  };
};
