import type { paths } from '@/types/api.schema';
import { API_CONFIG } from '@/constants';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

const fetchClient = createFetchClient<paths>({
  baseUrl: API_CONFIG.BASE_URL,
});

export const apiClient = createClient(fetchClient);
