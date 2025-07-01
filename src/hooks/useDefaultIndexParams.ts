import { useMemo } from 'react';
import { useCollectionSchema } from './useCollectionSchema';

export const useDefaultIndexParams = () => {
  const {
    defaultSortingField,
    queryByOptions,
    sortByOptions,
    facetByOptions,
    groupByOptions,
  } = useCollectionSchema();

  return useMemo(
    () => ({
      defaultSortingField,
      queryByOptions,
      sortByOptions,
      facetByOptions,
      groupByOptions,
    }),
    [
      defaultSortingField,
      queryByOptions,
      sortByOptions,
      facetByOptions,
      groupByOptions,
    ]
  );
};
