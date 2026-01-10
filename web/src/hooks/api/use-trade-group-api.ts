import { apiClient } from '@/lib';
import { useQueryClient } from '@tanstack/react-query';

export const useTradeGroupApi = () => {
  const queryClient = useQueryClient();

  const getTradeGroups = () => {
    return apiClient.useQuery('get', '/v1/trade-groups');
  };

  const getTradeGroup = (uuid: string) => {
    return apiClient.useQuery('get', '/v1/trade-groups/{uuid}', {
      params: {
        path: { uuid },
      },
    });
  };

  const createTradeGroup = apiClient.useMutation('post', '/v1/trade-groups', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups'] });
    },
  });

  const updateTradeGroup = apiClient.useMutation('patch', '/v1/trade-groups/{uuid}', {
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
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups'] });
    },
  });

  const deleteTradeGroup = apiClient.useMutation('delete', '/v1/trade-groups/{uuid}', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get', '/v1/trade-groups'] });
    },
  });

  return {
    getTradeGroups,
    getTradeGroup,
    createTradeGroup,
    updateTradeGroup,
    deleteTradeGroup,
  };
};
