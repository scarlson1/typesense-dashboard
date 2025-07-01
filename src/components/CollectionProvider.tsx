import { useQuery } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import type { Client } from 'typesense';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import { collectionQueryKeys } from '../constants';
import { CollectionContext, type CollectionContextValues } from '../context';

// TODO:  use zustand to store collection Id ??
// can be passed to loader functions via router context  etc.

export type CollectionContextProps = {
  clusterId: string;
  client: Client;
  collectionId?: string; // TODO: collectionId as param or use zustand ??
  children?: ReactNode;
  // TODO: extends UseQueryOptions ??
  staleTime?: number;
};

export function CollectionProvider<T extends DocumentSchema>({
  client,
  clusterId,
  children,
  collectionId,
  staleTime = 30000,
}: CollectionContextProps) {
  // const [collectionId, setCollectionId] = useState<string | null>(
  //   collectionName
  // );

  const { data, isLoading, isFetching, isError, error, isPlaceholderData } =
    useQuery({
      queryKey: collectionQueryKeys.schema(clusterId, collectionId as string),
      queryFn: () => client.collections<T>(collectionId as string).retrieve(),
      enabled: !!collectionId,
      staleTime,
    });

  const defaultSortingField = useMemo(() => {
    return data?.default_sorting_field;
  }, [data?.default_sorting_field]);

  const [
    queryByOptions = [],
    sortByOptions = [],
    facetByOptions = [],
    groupByOptions = [],
  ] = useMemo(() => {
    const queryByOptions = data?.fields
      .filter((field) => field.index)
      .map((f) => f.name);

    const sortByOptions = data?.fields
      .filter((field) => field.sort)
      .map((f) => f.name);

    const facetByOptions = data?.fields
      .filter((field) => field.facet)
      .map((f) => f.name);

    const groupByOptions = data?.fields
      .filter((field) => field.index)
      .map((f) => f.name);

    return [queryByOptions, sortByOptions, facetByOptions, groupByOptions];
  }, [data?.fields]);

  const memoizedValue: CollectionContextValues<Error> = useMemo(
    () => ({
      data,
      isLoading,
      isFetching,
      isError,
      error,
      isPlaceholderData,
      collectionId,
      defaultSortingField,
      queryByOptions,
      sortByOptions,
      facetByOptions,
      groupByOptions,
      // setCollectionId,
    }),
    [
      data,
      isLoading,
      isFetching,
      isError,
      error,
      isPlaceholderData,
      collectionId,
      defaultSortingField,
      queryByOptions,
      facetByOptions,
      groupByOptions,
      // setCollectionId,
    ]
  );

  return (
    <CollectionContext.Provider value={memoizedValue}>
      {children}
    </CollectionContext.Provider>
  );
}
