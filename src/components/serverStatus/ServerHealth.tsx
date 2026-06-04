import { Badge } from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

export function ServerHealth() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'health'],
    queryFn: () => client.health.retrieve(),
    staleTime: 1000 * 5,
    refetchInterval: 10000,
  });

  // @ts-expect-error resource_error is not in the typed health response
  const chipLabel = data.ok ? 'Healthy' : (data.resource_error ?? 'Down');

  return <Badge tone={data.ok ? 'success' : 'danger'}>● {chipLabel}</Badge>;

  // return (
  //   <Chip
  //     label={chipLabel}
  //     color={data.ok ? 'success' : 'warning'}
  //     size='small'
  //   />
  // );
}
