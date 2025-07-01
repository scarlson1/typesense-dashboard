import type { UseQueryResult } from '@tanstack/react-query';
import { createContext } from 'react';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import type {
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';

export type CollectionContextParams =
  | Omit<SearchParams, 'q'>
  | Omit<SearchParamsWithPreset, 'q'>;

export type CollectionContextValues<TError = Error> = Pick<
  UseQueryResult<CollectionSchema, TError>,
  | 'data'
  | 'isLoading'
  | 'isFetching'
  | 'isError'
  | 'error'
  | 'isPlaceholderData'
> & {
  collectionId: string;
  defaultSortingField?: string | undefined;
  queryByOptions: string[];
  sortByOptions: string[];
  facetByOptions: string[];
  groupByOptions: string[];
};

export const CollectionContext =
  createContext<CollectionContextValues<Error> | null>(null);

if (import.meta.env.DEV) {
  CollectionContext.displayName = 'CollectionContext';
}
