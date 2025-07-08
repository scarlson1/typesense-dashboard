import { useTypesenseClient } from '@/hooks';
import { Chip } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

export function ServerHealth() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'health'],
    queryFn: () => client.health.retrieve(),
    staleTime: 1000 * 5,
    refetchInterval: 10000,
  });

  // @ts-ignore
  const chipLabel = data.ok ? 'healthy' : (data.resource_error ?? 'Down');

  return (
    <Chip
      label={chipLabel}
      color={data.ok ? 'success' : 'warning'}
      size='small'
    />
  );
}
