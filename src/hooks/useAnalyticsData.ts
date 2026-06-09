import { analyticsDataQueryKeys } from '@/constants';
import { useTypesenseClient } from '@/hooks/useTypesenseClient';
import { useQuery } from '@tanstack/react-query';
import type {
  DocumentSchema,
  SearchResponse,
} from 'typesense/lib/Typesense/Documents';

export interface AnalyticsQueryHit {
  q: string;
  count: number;
}

/**
 * Reads aggregated analytics data out of a rule's destination collection.
 * popular_queries and nohits_queries rules both write `{ q, count }` documents
 * there, sorted by frequency. This is version-agnostic: only the rule envelope
 * differs between v29 and v30 — the destination data is the same shape.
 *
 * Disabled until a destination is known, and never retries (a 404 just means
 * the destination collection has not been created or has no data yet).
 */
export const useAnalyticsData = (
  destination: string | undefined,
  limit = 10,
) => {
  const [client, clusterId] = useTypesenseClient();

  return useQuery({
    queryKey: [
      ...analyticsDataQueryKeys.destination(clusterId, destination ?? ''),
      limit,
    ],
    queryFn: async () => {
      const res = (await client
        .collections(destination as string)
        .documents()
        .search({
          q: '*',
          query_by: 'q',
          sort_by: 'count:desc',
          per_page: limit,
        })) as SearchResponse<DocumentSchema>;

      return (
        res.hits
          ?.map((h) => h.document as AnalyticsQueryHit)
          .filter((d) => d.q) ?? []
      );
    },
    enabled: Boolean(destination),
    retry: false,
  });
};
