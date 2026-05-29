import { queryClient, typesenseStore } from '@/utils';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod/v4';

const authSearchSchema = z.object({
  redirect: z.string().optional(),
  clusterId: z.string().optional(),
});

export const Route = createFileRoute('/logout')({
  component: () => null,
  validateSearch: (search) => authSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    queryClient.cancelQueries();
    // @ts-expect-error logout returns State
    const { currentCredsKey } = typesenseStore.getState().logout(search?.clusterId);
    queryClient.clear();

    if (!currentCredsKey) {
      throw redirect({ to: '/auth', search });
    }

    throw redirect({ to: search.redirect || '/' });
  },
});
