import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Client } from 'typesense';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import { collectionQueryKeys } from '../constants';
import {
  SearchContext,
  type SearchContextParams,
  type SearchContextValues,
} from '../context';
import { useDebounce } from '../hooks';
import { CollectionProvider } from './CollectionProvider';

export type InstantSearchProps = {
  // SearchContextValues & {
  clusterId: string;
  client: Client;
  collectionId: string;
  children?: ReactNode;
  initialParams?: SearchContextParams;
  debounceMs?: number;
  // TODO: extends UseQueryOptions ??
  staleTime?: number;
};

export function InstantSearch<T extends DocumentSchema>({
  children,
  client,
  clusterId,
  collectionId,
  initialParams = {},
  debounceMs = 200,
  staleTime = 30000,
}: InstantSearchProps) {
  const [params, setParams] = useState(initialParams);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const { data, isLoading, isFetching, isError, error, isPlaceholderData } =
    useQuery({
      queryKey: collectionQueryKeys.search(
        clusterId,
        collectionId,
        params,
        debouncedQuery
      ),
      queryFn: () =>
        client
          .collections<T>(collectionId)
          .documents()
          .search({
            q: debouncedQuery,
            ...params,
          }),
      enabled: !!debouncedQuery,
      staleTime,
    });

  const setPreset = useCallback((presetId: string | null) => {
    setParams((prev) => ({ ...prev, preset: presetId ?? undefined }));
  }, []);

  // TODO:
  // search params
  // create hooks for specific types of updates to context (presets, search params, etc.)

  const memoizedValue: SearchContextValues<T, Error> = useMemo(
    () => ({
      data,
      isLoading,
      isFetching,
      isError,
      error,
      isPlaceholderData,
      collectionId,
      params,
      setParams,
      setQuery,
      setPreset,
    }),
    [
      data,
      isLoading,
      isFetching,
      isError,
      error,
      isPlaceholderData,
      collectionId,
      params,
      setParams,
      setQuery,
      setPreset,
    ]
  );

  return (
    <SearchContext.Provider value={memoizedValue}>
      TODO: index context to store current index info (schema, default query_by,
      etc.)
      {/* <IndexContext.Provider value={search.mainIndex}> */}
      <CollectionProvider
        client={client}
        collectionId={collectionId}
        clusterId={clusterId}
      >
        {children}
      </CollectionProvider>
      {/* </IndexContext.Provider> */}
    </SearchContext.Provider>
  );
}
