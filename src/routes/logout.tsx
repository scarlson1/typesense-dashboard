import { queryClient, typesenseStore } from '@/utils';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod/v4';
import { useStore } from 'zustand';

export const authSearchSchema = z.object({
  redirect: z.string().optional(),
  clusterId: z.string().optional(),
});

export const Route = createFileRoute('/logout')({
  component: RouteComponent,
  validateSearch: (search) => authSearchSchema.parse(search),
});

function RouteComponent() {
  const search = Route.useSearch();
  const logout = useStore(typesenseStore, (state) => state.logout);

  useEffect(() => {
    try {
      // TODO: add loading state and show loading indicator in list item
      queryClient.cancelQueries();
      logout(search?.clusterId);
      queryClient.clear();
      console.log('query cache cleared');
    } catch (err) {
      console.log('LOGOUT ERROR: ', err);
    }
  }, [search?.clusterId]);

  return <Navigate to={search.redirect || '/'} replace />;
}
