import { useContext, useMemo } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import { SearchContext, type SearchContextValues } from '../context';

const noop = (_: any) => {};

export const useSearchParams = <
  T extends DocumentSchema = DocumentSchema,
>() => {
  const context = useContext<SearchContextValues<T, Error> | null>(
    SearchContext
  );
  if (context === undefined)
    throw new Error('useSearchParams must be within a InstantSearch Provider');

  const { params, setParams } = context || {
    params: {},
    setParams: noop,
  };

  return useMemo(() => {
    return [params, setParams] as const;
  }, [params, setParams]);
};
