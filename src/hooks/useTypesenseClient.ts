import { redirect } from '@tanstack/react-router';
import type { Client } from 'typesense';
import { useStore } from 'zustand';
import { getTypesenseClient, typesenseStore } from '../utils';

export const useTypesenseClient = () => {
  const credentials = useStore(typesenseStore, (state) => state.credentials);
  const credKey = useStore(typesenseStore, (state) => state.currentCredsKey);

  if (!credKey)
    throw redirect({
      to: '/auth',
      search: {
        redirect: location.href,
      },
    });

  let creds = credentials[credKey];
  if (!creds)
    throw redirect({
      to: '/auth',
      search: {
        redirect: location.href,
      },
    });
  return [getTypesenseClient(creds), credKey] as [Client, string];
};
