import { analyticsQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { AnalyticsEventsRetrieveSchema } from 'typesense/lib/Typesense/AnalyticsEvents';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

// POST /analytics/events is identical on v29 and v30 (verified against both
// servers): { type, name, data } — so the v30 client namespace is used for
// both and no version branching is needed here.
export interface CreateAnalyticsEventVars {
  /** v30: the rule name. v29 counter rules: the rule's named event. */
  name: string;
  type: string;
  data: Record<string, unknown>;
}

export type UseCreateAnalyticsEventProps = Omit<
  UseMutationOptions<unknown, Error, CreateAnalyticsEventVars>,
  'mutationFn'
>;

export const useCreateAnalyticsEvent = (
  props?: UseCreateAnalyticsEventProps,
) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  return useMutation({
    mutationFn: ({ name, type, data }: CreateAnalyticsEventVars) =>
      client.analytics.events().create({ type, name, data }),
    onMutate: (vars, ctx) => {
      toast.loading(`sending ${vars.type} event...`, {
        id: 'analytics-event',
      });
      props?.onMutate && props.onMutate(vars, ctx);
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`event sent [${vars.name}]`, { id: 'analytics-event' });
      props?.onSuccess && props.onSuccess(data, vars, result, ctx);
    },
    onError: (err, vars, result, ctx) => {
      const errMsg = err?.message || 'an error occurred sending the event';
      toast.error(errMsg, { id: 'analytics-event' });
      props?.onError && props.onError(err, vars, result, ctx);
    },
    onSettled: (data, err, vars, result, ctx) => {
      // Refresh any open recent-events viewers.
      queryClient.invalidateQueries({
        queryKey: analyticsQueryKeys.events(clusterId),
        exact: false,
      });
      props?.onSettled && props.onSettled(data, err, vars, result, ctx);
    },
  });
};

export interface RecentEventsParams {
  userId: string;
  name: string;
  n: number;
}

/**
 * GET /analytics/events — recent events for a user + event name. Available
 * on v30+; v29 servers expose the endpoint but return an empty list.
 * Pass null until the user submits the lookup form.
 */
export const useRecentAnalyticsEvents = (params: RecentEventsParams | null) => {
  const [client, clusterId] = useTypesenseClient();

  return useQuery<AnalyticsEventsRetrieveSchema>({
    queryKey: analyticsQueryKeys.events(
      clusterId,
      params ? { ...params } : undefined,
    ),
    enabled: Boolean(params),
    queryFn: () =>
      client.analytics.events().retrieve({
        user_id: params!.userId,
        name: params!.name,
        n: params!.n,
      }),
    retry: false,
  });
};
