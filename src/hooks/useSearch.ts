import { SearchContext, type SearchContextValues } from '@/context';
import { useContext } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

export const useSearch = <T extends DocumentSchema = DocumentSchema>() => {
  const context = useContext<SearchContextValues<T, Error> | null>(
    SearchContext
  );
  if (context === undefined)
    throw new Error('useSearch must be within a InstantSearch Provider');

  return context as SearchContextValues<T, Error>;
};
