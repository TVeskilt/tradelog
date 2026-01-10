import type { paths } from '@/types/api.schema';
import { API_CONFIG } from '@/constants';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

const fetchClient = createFetchClient<paths>({
  baseUrl: API_CONFIG.BASE_URL,
});

export const apiClient = createClient(fetchClient);

type DefinedPaths<Method extends keyof paths[keyof paths]> = {
  [Path in keyof paths]: paths[Path] extends { [M in Method]: unknown } ? Path : never;
}[keyof paths];

type PathsWithParams<Method extends keyof paths[keyof paths]> = {
  [Path in keyof paths]: paths[Path] extends {
    [M in Method]: {
      parameters: {
        path: Record<string, unknown>;
      };
    };
  }
    ? Path
    : never;
}[keyof paths];

type PathParams<
  Method extends keyof paths[keyof paths],
  Path extends keyof paths,
> = paths[Path] extends {
  [M in Method]: {
    parameters: {
      path: infer P;
    };
  };
}
  ? P
  : never;

export type GetQueryParams<Path extends DefinedPaths<'get'>> = paths[Path] extends {
  get: {
    parameters?: {
      query?: infer Q;
    };
  };
}
  ? Q extends Record<string, unknown>
    ? Q
    : undefined
  : undefined;

export type GetPathParams<Path extends PathsWithParams<'get'>> = PathParams<'get', Path>;
