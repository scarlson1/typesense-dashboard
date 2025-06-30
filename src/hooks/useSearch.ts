import { useQuery } from '@tanstack/react-query';
import type {
  SearchOptions,
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';
import { collectionQueryKeys } from '../constants';
import { useDebounce } from './useDebounce';
import { useTypesenseClient } from './useTypesenseClient';

export interface UseSearchProps {
  collectionId: string;
  debounceMs?: number;
  q: string;
  params?: Omit<SearchParams, 'q'> | Omit<SearchParamsWithPreset, 'q'>;
  options?: SearchOptions;
}

export const useSearch = ({
  collectionId,
  q,
  params = {},
  options,
  debounceMs = 250,
}: UseSearchProps) => {
  const [client, clusterId] = useTypesenseClient();
  const debouncedTerm = useDebounce(q, debounceMs);

  return useQuery({
    queryKey: collectionQueryKeys.search(
      clusterId,
      collectionId,
      params,
      // options,
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
    // or extend react query options ??
    staleTime: (options?.cacheSearchResultsForSeconds || 1) * 1000,
  });
};
