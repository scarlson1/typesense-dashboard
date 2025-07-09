import {
  SearchContext,
  type SearchContextParams,
  type SearchContextValues,
} from '@/context';
import { useCallback, useContext, useMemo } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

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

  const updateParams = useCallback((values: SearchContextParams) => {
    setParams(({ ...prev }) => ({ ...prev, ...values }));
  }, []);

  return useMemo(() => {
    return [params as SearchContextParams, updateParams, setParams] as const;
  }, [params, updateParams, setParams]);
};
