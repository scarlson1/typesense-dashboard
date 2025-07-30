import { useMemo } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import { useSearch } from './useSearch';

export const useHits = <T extends DocumentSchema>() => {
  const context = useSearch<T>();

  return useMemo(() => context?.data, [context?.data]);
};
