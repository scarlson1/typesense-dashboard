import { collectionQueryKeys } from '@/constants';
import { CollectionContext, type CollectionContextValues } from '@/context';
import { typesenseFieldType, type TypesenseFieldType } from '@/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import type { Client } from 'typesense';
import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

// TODO:  use zustand to store collectionId ??
// can be passed to loader functions via router context  etc.

const QUERYABLE_FIELD_TYPES: TypesenseFieldType[] = [
  typesenseFieldType.enum.string,
  typesenseFieldType.enum['string[]'],
  typesenseFieldType.enum['string*'],
  // TODO: typesense should query fields within objects that have string type ??
  // currently returning error ??
  // typesenseFieldType.enum.object,
  // typesenseFieldType.enum['object[]'],
];

export type CollectionContextProps = {
  clusterId: string;
  client: Client;
  collectionId: string; // TODO: collectionId as param or use zustand ??
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

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = // isPlaceholderData
    useSuspenseQuery({
      queryKey: collectionQueryKeys.schema(clusterId, collectionId as string),
      queryFn: () => client.collections<T>(collectionId as string).retrieve(),
      // enabled: !!collectionId,
      staleTime,
    });

  const defaultSortingField = useMemo(() => {
    return data?.default_sorting_field
      ? `${data?.default_sorting_field}:desc`
      : undefined;
  }, [data?.default_sorting_field]);

  const [
    queryByOptions = [],
    sortByOptions = [],
    facetByOptions = [],
    groupByOptions = [],
    geoFieldOptions = [],
  ] = useMemo(() => {
    const queryByOptions = data?.fields
      .filter(
        (field) => field.index && QUERYABLE_FIELD_TYPES.includes(field.type)
      )
      .map((f) => f.name);

    const sortByOptions = data?.fields
      .filter((field) => field.sort)
      .map((f) => [`${f.name}:asc`, `${f.name}:desc`])
      .flat();

    const facetByOptions = data?.fields
      .filter((field) => field.facet)
      .map((f) => f.name);

    const groupByOptions = data?.fields
      .filter((field) => field.facet)
      .map((f) => f.name);

    const geoFieldOptions = data?.fields
      .filter((field) =>
        [
          typesenseFieldType.enum.geopoint,
          typesenseFieldType.enum['geopoint[]'],
        ].includes(field.type as 'geopoint' | 'geopoint[]')
      )
      .map((f: CollectionFieldSchema) => f.name);

    return [
      queryByOptions,
      sortByOptions,
      facetByOptions,
      groupByOptions,
      geoFieldOptions,
    ];
  }, [data?.fields]);

  const memoizedValue: CollectionContextValues<Error> = useMemo(
    () => ({
      data,
      isLoading,
      isFetching,
      isError,
      error,
      // isPlaceholderData,
      collectionId,
      defaultSortingField,
      queryByOptions,
      sortByOptions,
      facetByOptions,
      groupByOptions,
      geoFieldOptions,
      // setCollectionId,
    }),
    [
      data,
      isLoading,
      isFetching,
      isError,
      error,
      // isPlaceholderData,
      collectionId,
      defaultSortingField,
      queryByOptions,
      facetByOptions,
      groupByOptions,
      geoFieldOptions,
      // setCollectionId,
    ]
  );

  return (
    <CollectionContext.Provider value={memoizedValue}>
      {children}
    </CollectionContext.Provider>
  );
}
