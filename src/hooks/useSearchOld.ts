import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type {
  SearchOptions,
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';
import { collectionQueryKeys } from '../constants';
import { useDebounce } from './useDebounce';
import { useTypesenseClient } from './useTypesenseClient';

const DEFAULT_STALE_TIME = 1000 * 60;

export interface UseSearchOldProps
  extends Omit<UseQueryOptions, 'queryKey' | 'queryFn'> {
  collectionId: string;
  debounceMs?: number;
  q: string;
  params?: Omit<SearchParams, 'q'> | Omit<SearchParamsWithPreset, 'q'>;
  options?: SearchOptions;
}

export const useSearchOld = ({
  collectionId,
  q,
  params = {},
  options,
  debounceMs = 250,
  ...rest
}: UseSearchOldProps) => {
  const [client, clusterId] = useTypesenseClient();
  const debouncedTerm = useDebounce(q, debounceMs);

  return useQuery({
    queryKey: collectionQueryKeys.search(
      clusterId,
      collectionId,
      params,
      debouncedTerm
    ),
    queryFn: () =>
      client
        .collections(collectionId)
        .documents()
        .search({
          q: debouncedTerm,
          ...params,
        }),
    enabled: !!debouncedTerm,
    staleTime: DEFAULT_STALE_TIME,
    // use react query options (stale time etc.) in favor of typesense options ??
    // staleTime: (options?.cacheSearchResultsForSeconds || 1) * 1000,
    ...(rest || {}),
  });
};
