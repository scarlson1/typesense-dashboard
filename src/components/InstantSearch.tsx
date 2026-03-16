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
import type {
  DocumentSchema,
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';

export type InstantSearchProps<T extends DocumentSchema> = {
  // SearchContextValues & {
  clusterId: string;
  client: Client;
  collectionId: string;
  children?: ReactNode;
  initialParams?: SearchContextParams<T>;
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
  initialParams = { per_page: 20 },
  debounceMs = 200,
  staleTime = 30000,
  pageSizeOptions = [5, 10, 20, 50, 100],
  // slots,
  // slotProps,
}: InstantSearchProps<T>) {
  // TODO: get default params (query_by) from CollectionProvider ??
  const { queryByOptions } = useCollectionSchema();
  const [params, setParams] = useState<SearchContextParams<T>>({
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
        debouncedQuery,
      ),
      queryFn: () => {
        const { preset, ...rest } = params;

        const searchParams = preset
          ? ({ ...rest, preset } as SearchParamsWithPreset<T, string>)
          : (rest as SearchParams<T, string>);

        return client
          .collections<T>(collectionId)
          .documents()
          .search({ q: debouncedQuery, ...searchParams });
      },
      // queryFn: () =>
      //   client
      //     .collections<T>(collectionId)
      //     .documents()
      //     .search({
      //       q: debouncedQuery,
      //       ...params,
      //     }),
      // enabled: !!debouncedQuery,
      staleTime,
      placeholderData: (previousData) => previousData,
    });

  const setPreset = useCallback((presetId: string | null) => {
    // setParams((prev) => ({ ...prev, preset: presetId ?? undefined }));
    if (presetId) setParams((prev) => ({ ...prev, preset: presetId }));
    else setParams(({ preset: _, ...prev }) => ({ ...prev }));
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
    ],
  );

  return (
    <SearchContext.Provider value={memoizedValue}>
      {children}
    </SearchContext.Provider>
  );
}
