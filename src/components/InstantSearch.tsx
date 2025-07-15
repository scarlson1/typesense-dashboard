import { collectionQueryKeys } from '@/constants';
import {
  SearchContext,
  type PaginationParams,
  type SearchContextParams,
  type SearchContextValues,
} from '@/context';
import { useCollectionSchema, useDebounce } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Client } from 'typesense';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

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
  pageSizeOptions?: number[];
  // slots?: Partial<SearchSlotComponents>;
  // slotProps?: Partial<SearchSlotProps>;
};

export function InstantSearch<T extends DocumentSchema>({
  children,
  client,
  clusterId,
  collectionId,
  initialParams = { per_page: 5 },
  debounceMs = 200,
  staleTime = 30000,
  pageSizeOptions = [5, 10, 20, 50],
  // slots,
  // slotProps,
}: InstantSearchProps) {
  // TODO: get default params (query_by) from CollectionProvider ??
  const { queryByOptions } = useCollectionSchema();
  const [params, setParams] = useState<SearchContextParams>({
    query_by: queryByOptions,
    ...initialParams,
  });
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
      // enabled: !!debouncedQuery,
      staleTime,
      placeholderData: (previousData) => previousData,
    });

  const setPreset = useCallback((presetId: string | null) => {
    setParams((prev) => ({ ...prev, preset: presetId ?? undefined }));
  }, []);

  const setPagination = useCallback((values: PaginationParams) => {
    // { page, per_page, limit, offset, ...prev }
    setParams(({ ...prev }) => ({ ...prev, ...values }));
  }, []);

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
      setPagination,
      pageSizeOptions,
      debouncedQuery,
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
      setPagination,
      pageSizeOptions,
      debouncedQuery,
    ]
  );

  return (
    <SearchContext.Provider value={memoizedValue}>
      {/* <SearchSlotsProvider slots={slots} slotProps={slotProps}> */}
      {children}
      {/* </SearchSlotsProvider> */}
    </SearchContext.Provider>
  );
}
