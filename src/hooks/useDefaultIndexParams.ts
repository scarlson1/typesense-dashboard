import { useMemo } from 'react';
import { useCollectionSchema } from './useCollectionSchema';

export const useDefaultIndexParams = () => {
  const {
    defaultSortingField,
    queryByOptions,
    sortByOptions,
    facetByOptions,
    groupByOptions,
    geoFieldOptions,
  } = useCollectionSchema();

  return useMemo(
    () => ({
      defaultSortingField,
      queryByOptions,
      sortByOptions,
      facetByOptions,
      groupByOptions,
      geoFieldOptions,
    }),
    [
      defaultSortingField,
      queryByOptions,
      sortByOptions,
      facetByOptions,
      groupByOptions,
      geoFieldOptions,
    ]
  );
};
