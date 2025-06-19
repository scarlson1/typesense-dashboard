import { useStore } from 'zustand';
import { getTypesenseClient, typesenseStore } from '../utils';

export const useTypesenseClient = () => {
  const creds = useStore(typesenseStore, (state) => state.credentials);
  if (!creds) throw new Error('authentication required');
  return getTypesenseClient(creds);
};
