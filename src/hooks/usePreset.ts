import { SearchContext, type SearchContextValues } from '@/context';
import { useContext, useMemo } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

const noop = (_: any) => {};

export const usePreset = <T extends DocumentSchema = DocumentSchema>() => {
  const context = useContext<SearchContextValues<T, Error> | null>(
    SearchContext
  );
  if (context === undefined)
    throw new Error('usePreset must be within a InstantSearch Provider');

  const { params, setPreset } = context || {
    params: {},
    setPreset: noop,
  };

  return useMemo(() => {
    return [params?.preset, setPreset] as const;
  }, [params?.preset, setPreset]);
};
