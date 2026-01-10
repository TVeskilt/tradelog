import type { paths } from '@/types/api.types';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { API_CONFIG } from '@/constants';

// Create the fetch client
const fetchClient = createFetchClient<paths>({
  baseUrl: API_CONFIG.BASE_URL,
});

// Create the React Query client
export const apiClient = createClient(fetchClient);

// Type helpers for extracting request/response types
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type HttpMethodWithBody = Extract<HttpMethod, 'post' | 'put' | 'patch'>;

type DefinedPaths<M extends HttpMethod> = {
  [K in keyof paths]: M extends keyof paths[K]
    ? paths[K][M] extends { responses: unknown }
      ? K
      : never
    : never;
}[keyof paths];

type MethodBody<M extends HttpMethodWithBody, Path extends DefinedPaths<M>> = paths[Path] extends {
  [K in M]: {
    requestBody: {
      content: {
        'application/json': infer Body;
      };
    };
  };
}
  ? Body
  : undefined;

type PathsWithParams<M extends HttpMethod> = {
  [K in keyof paths]: M extends keyof paths[K]
    ? paths[K][M] extends {
        responses: unknown;
        parameters?: {
          path?: infer P;
        };
      }
      ? P extends Record<string, unknown>
        ? K
        : never
      : never
    : never;
}[keyof paths];

type PathParams<M extends HttpMethod, Path extends PathsWithParams<M>> = paths[Path] extends {
  [K in M]: {
    parameters?: {
      path?: infer P;
    };
  };
}
  ? P extends Record<string, unknown>
    ? P
    : undefined
  : undefined;

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

export type PatchBody<Path extends DefinedPaths<'patch'>> = MethodBody<'patch', Path>;
export type PostBody<Path extends DefinedPaths<'post'>> = MethodBody<'post', Path>;
export type PutBody<Path extends DefinedPaths<'put'>> = MethodBody<'put', Path>;
export type GetPathParams<Path extends PathsWithParams<'get'>> = PathParams<'get', Path>;
export type PatchPathParams<Path extends PathsWithParams<'patch'>> = PathParams<'patch', Path>;
export type PostPathParams<Path extends PathsWithParams<'post'>> = PathParams<'post', Path>;
export type PutPathParams<Path extends PathsWithParams<'put'>> = PathParams<'put', Path>;
export type DeletePathParams<Path extends PathsWithParams<'delete'>> = PathParams<'delete', Path>;
