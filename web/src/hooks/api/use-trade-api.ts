import { apiClient, type GetPathParams } from '@/lib';
import { useQueryClient } from '@tanstack/react-query';

export const useTradeApi = () => {
  const queryClient = useQueryClient();

  const createTrade = apiClient.useMutation('post', '/v1/trades', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trades', {}] });
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups', {}] });
    },
  });

  const getTrades = () => {
    return apiClient.useQuery('get', '/v1/trades');
  };

  const getTradeByUuid = (path: GetPathParams<'/v1/trades/{uuid}'>) => {
    return apiClient.useQuery('get', '/v1/trades/{uuid}', {
      params: { path },
    });
  };

  const updateTradeByUuid = apiClient.useMutation('put', '/v1/trades/{uuid}', {
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
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trades', {}] });
    },
  });

  const deleteTradeByUuid = apiClient.useMutation('delete', '/v1/trades/{uuid}', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trades', {}] });
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups', {}] });
    },
  });

  return {
    createTrade,
    getTrades,
    getTradeByUuid,
    updateTradeByUuid,
    deleteTradeByUuid,
  };
};
