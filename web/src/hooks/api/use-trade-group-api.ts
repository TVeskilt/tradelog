import { apiClient, type GetPathParams } from '@/lib';
import { useQueryClient } from '@tanstack/react-query';

export const useTradeGroupApi = () => {
  const queryClient = useQueryClient();

  const getTradeGroups = () => {
    return apiClient.useQuery('get', '/v1/trade-groups');
  };

  const getTradeGroupByUuid = (path: GetPathParams<'/v1/trade-groups/{uuid}'>) => {
    return apiClient.useQuery('get', '/v1/trade-groups/{uuid}', {
      params: { path },
    });
  };

  const createTradeGroup = apiClient.useMutation('post', '/v1/trade-groups', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups', {}] });
    },
  });

  const createStrategy = apiClient.useMutation('post', '/v1/strategies', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trades', {}] });
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups', {}] });
    },
  });

  const updateTradeGroupByUuid = apiClient.useMutation('patch', '/v1/trade-groups/{uuid}', {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'get',
          '/v1/trade-groups/{uuid}',
          {
            params: {
              path: {
                uuid: variables.params.path.uuid,
              },
            },
          },
        ],
      });
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups', {}] });
    },
  });

  const deleteTradeGroupByUuid = apiClient.useMutation('delete', '/v1/trade-groups/{uuid}', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups', {}] });
    },
  });

  return {
    getTradeGroups,
    getTradeGroupByUuid,
    createTradeGroup,
    createStrategy,
    updateTradeGroupByUuid,
    deleteTradeGroupByUuid,
  };
};
