import type { UseQueryResult } from '@tanstack/react-query';
import { createContext, type Dispatch, type SetStateAction } from 'react';
import type {
  DocumentSchema,
  SearchParams,
  SearchParamsWithPreset,
  SearchResponse,
} from 'typesense/lib/Typesense/Documents';

export type SearchContextParams =
  | Omit<SearchParams, 'q'>
  | Omit<SearchParamsWithPreset, 'q'>;

export type PaginationParams = Pick<
  SearchParams,
  'page' | 'per_page' | 'limit' | 'offset'
>;

export type SearchContextValues<
  TData extends DocumentSchema,
  TError = Error,
> = Pick<
  UseQueryResult<SearchResponse<TData>, TError>,
  | 'data'
  | 'isLoading'
  | 'isFetching'
  | 'isError'
  | 'error'
  | 'isPlaceholderData'
> & {
  // clusterId: string;
  // client: Client;
  collectionId: string;
  debouncedQuery: string;
  params: SearchContextParams;
  setParams: Dispatch<SetStateAction<SearchContextParams>>;
  setQuery: (value: string) => void;
  setPreset: (presetId: string | null) => void;
  setPagination: (params: PaginationParams) => void;
  pageSizeOptions: number[];
};

export const SearchContext = createContext<SearchContextValues<
  any,
  Error
> | null>(null);

if (import.meta.env.DEV) {
  SearchContext.displayName = 'SearchContext';
}
