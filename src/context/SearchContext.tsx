import type { UseQueryResult } from '@tanstack/react-query';
import { createContext, type Dispatch, type SetStateAction } from 'react';
import type {
  DocumentSchema,
  SearchParams,
  SearchParamsWithPreset,
  SearchResponse,
} from 'typesense/lib/Typesense/Documents';

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
  setParams: Dispatch<
    SetStateAction<Omit<SearchParams, 'q'> | Omit<SearchParamsWithPreset, 'q'>>
  >;
  setQuery: (value: string) => void;
};

export const SearchContext = createContext<SearchContextValues<
  any,
  Error
> | null>(null);

if (import.meta.env.DEV) {
  SearchContext.displayName = 'SearchContext';
}
