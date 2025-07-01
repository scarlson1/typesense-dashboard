import { useContext, useMemo } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import { SearchContext, type SearchContextValues } from '../context';

export const useHits = <T extends DocumentSchema>() => {
  const context = useContext<SearchContextValues<T, Error> | null>(
    SearchContext
  );
  if (context === undefined)
    throw new Error('useHits must be within a InstantSearch Provider');

  return useMemo(() => context?.data, [context?.data]);
};
