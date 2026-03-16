import type { UseQueryResult } from '@tanstack/react-query';
import { createContext, type Dispatch, type SetStateAction } from 'react';
import type {
  DocumentSchema,
  SearchParams,
  SearchParamsWithPreset,
  SearchResponse,
} from 'typesense/lib/Typesense/Documents';

export type SearchContextParams<T extends DocumentSchema = DocumentSchema> =
  | Omit<SearchParams<T, string>, 'q'>
  | Omit<SearchParamsWithPreset<T, string>, 'q'>;

export type PaginationParams<T extends DocumentSchema = DocumentSchema> = Pick<
  // export type PaginationParams = Pick<
  SearchParams<T>,
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
  collectionId: string;
  debouncedQuery: string;
  params: SearchContextParams<TData>;
  setParams: Dispatch<SetStateAction<SearchContextParams<TData>>>;
  setQuery: (value: string) => void;
  setPreset: (presetId: string | null) => void;
  setPagination: (params: PaginationParams<TData>) => void;
  pageSizeOptions: number[];
};

export const SearchContext = createContext<SearchContextValues<
  any,
  Error
> | null>(null);

if (import.meta.env.DEV) {
  SearchContext.displayName = 'SearchContext';
}
