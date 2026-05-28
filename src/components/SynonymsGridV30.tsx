import { collectionQueryKeys } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { DeleteRounded } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type {
  SynonymItemSchema,
  SynonymSetSchema,
} from 'typesense/lib/Typesense/SynonymSets';

// Flattened row: item data + the parent set's name
type SynonymRow = SynonymItemSchema & { setName: string };

export const SynonymsGridV30 = () => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: collectionQueryKeys.synonymSets(clusterId),
    queryFn: () => client.synonymSets().retrieve(),
  });

  // Flatten set → items so the grid shows one row per synonym rule
  const rows = useMemo<SynonymRow[]>(
    () =>
      data?.flatMap((set) =>
        set.items.map((item) => ({ ...item, setName: set.name })),
      ) ?? [],
    [data],
  );

  const mutation = useMutation({
    // Delete the whole set — each set holds exactly one item
    mutationFn: (setName: string) => client.synonymSets(setName).delete(),
    onMutate: async (setName) => {
      await queryClient.cancelQueries({
        queryKey: collectionQueryKeys.synonymSets(clusterId),
      });

      const prev = queryClient.getQueryData<SynonymSetSchema[]>(
        collectionQueryKeys.synonymSets(clusterId),
      );

      queryClient.setQueryData(
        collectionQueryKeys.synonymSets(clusterId),
        (old: SynonymSetSchema[]) => old.filter((s) => s.name !== setName),
      );

      toast.loading(`deleting [${setName}]...`, { id: 'delete-synonym' });

      return { setName, prev };
    },
    onSuccess: (_, setName) => {
      toast.success(`synonym deleted [${setName}]`, { id: 'delete-synonym' });
    },
    onError: (err, _, ctx) => {
      const msg = err.message || 'failed to delete synonym';
      toast.error(msg, { id: 'delete-synonym' });
      if (ctx?.prev) {
        queryClient.setQueryData(
          collectionQueryKeys.synonymSets(clusterId),
          ctx.prev,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.synonymSets(clusterId),
      });
    },
  });

  const columns = useMemo<GridColDef<SynonymRow>[]>(
    () => [
      {
        field: 'setName',
        headerName: 'Name',
        type: 'string',
        minWidth: 120,
        flex: 0.8,
        sortable: false,
        filterable: false,
      },
      {
        field: 'synonyms',
        headerName: 'Synonyms',
        type: 'string',
        minWidth: 120,
        flex: 1,
        sortable: false,
        filterable: false,
        valueGetter: (_, row) => row.synonyms?.join(', ') ?? '',
      },
      {
        field: 'root',
        headerName: 'Root',
        type: 'string',
        minWidth: 100,
        flex: 0.6,
        valueGetter: (_, row) => row.root ?? '',
      },
      {
        field: 'symbols_to_index',
        headerName: 'Symbols to Index',
        type: 'string',
        minWidth: 100,
        flex: 0.8,
        sortable: false,
        filterable: false,
        valueGetter: (_, row) => row.symbols_to_index?.join(', ') ?? '',
      },
      {
        field: 'locale',
        headerName: 'Locale',
        type: 'string',
        minWidth: 80,
        flex: 0.5,
        valueGetter: (_, row) => row.locale ?? '',
      },
      {
        field: 'grid-actions',
        type: 'actions',
        headerName: 'Actions',
        minWidth: 60,
        maxWidth: 80,
        flex: 1,
        getActions: (params) => [
          <GridActionsCellItem
            key='delete'
            icon={
              <Tooltip placement='top' title='delete'>
                <DeleteRounded fontSize='small' />
              </Tooltip>
            }
            onClick={() => mutation.mutate(params.row.setName)}
            label='Delete synonym'
            disabled={mutation.isPending}
          />,
        ],
      },
    ],
    [mutation.isPending, mutation.mutate],
  );

  if (isError)
    return <Typography>{error.message || 'something went wrong'}</Typography>;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 267,
        maxHeight: {
          xs: 'calc(100vh - 140px)',
          md: 'calc(100vh - 160px)',
        },
        width: '100%',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading || isFetching}
        pageSizeOptions={[5, 10, 20]}
        getRowId={(row) => `${row.setName}::${row.id}`}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
      />
    </Box>
  );
};

// import { apiKeyQueryKeys, collectionQueryKeys } from '@/constants';
// import { useAsyncToast, useTypesenseClient } from '@/hooks';
// import { queryClient } from '@/utils';
// import { DeleteRounded } from '@mui/icons-material';
// import { Box, Tooltip, Typography } from '@mui/material';
// import {
//   DataGrid,
//   GridActionsCellItem,
//   type GridColDef,
// } from '@mui/x-data-grid';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import { useMemo } from 'react';
// import type { SynonymSetSchema } from 'typesense';
// import type { KeysRetrieveSchema } from 'typesense/lib/Typesense/Keys';

// export const SynonymsGridV30 = () => {
//   const [client, clusterId] = useTypesenseClient();
//   const toast = useAsyncToast();

//   const { data, isFetching, isLoading, isError, error } = useQuery({
//     queryKey: collectionQueryKeys.synonymSets(clusterId),
//     queryFn: async () => await client.synonymSets().retrieve(),
//   });

//   const mutation = useMutation({
//     mutationFn: (name: string) => client.synonymSets(name).delete(),
//     onMutate: async (variables) => {
//       await queryClient.cancelQueries({
//         queryKey: collectionQueryKeys.synonymSets(clusterId),
//       });

//       const synonymsData: SynonymSetSchema[] | undefined =
//         queryClient.getQueryData(collectionQueryKeys.synonymSets(clusterId));
//       const prevData = synonymsData?.find((k) => k.name === variables);

//       queryClient.setQueryData(
//         collectionQueryKeys.synonymSets(clusterId),
//         (data: SynonymSetSchema[]) => data.filter((k) => k.name !== variables),
//       );

//       toast.loading(`deleting synonym [${variables}]...`, {
//         id: 'delete-synonym',
//       });

//       return { id: variables, prevData };
//     },
//     onSuccess: (_, __, ctx) => {
//       toast.success(`API synonym deleted [${ctx.id}]`, {
//         id: 'delete-synonym',
//       });
//     },
//     onError: (err, _, ctx) => {
//       const msg = err.message || 'failed to delete synonym';
//       toast.error(msg, { id: 'delete-synonym' });

//       if (ctx?.prevData) {
//         queryClient.setQueryData(
//           apiKeyQueryKeys.all(clusterId),
//           (data: KeysRetrieveSchema) => ({
//             keys: [...(data.keys || []), ctx.prevData],
//           }),
//         );
//       }
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({
//         queryKey: apiKeyQueryKeys.all(clusterId),
//       });
//     },
//   });

//   const columns = useMemo<GridColDef<SynonymSetSchema>[]>(
//     () => [
//       {
//         field: 'name',
//         headerName: 'Name',
//         type: 'string',
//         minWidth: 120,
//         flex: 0.8,
//         sortable: false,
//         filterable: false,
//       },
//       {
//         field: 'synonyms',
//         headerName: 'Synonyms',
//         type: 'string',
//         minWidth: 120,
//         flex: 0.8,
//         sortable: false,
//         filterable: false,
//         valueGetter: (_, row) => (row.synonyms ? row.synonyms.join(', ') : ''),
//       },
//       {
//         field: 'root',
//         headerName: 'Root',
//         type: 'string',
//         minWidth: 100,
//         flex: 1,
//         valueGetter: (_, row) => row.root ?? '',
//       },
//       {
//         field: 'symbols_to_index',
//         headerName: 'Symbols to Index',
//         type: 'string',
//         minWidth: 100,
//         flex: 1,
//         sortable: false,
//         filterable: false,
//         valueGetter: (_, row) =>
//           row.symbols_to_index ? row.symbols_to_index.join(', ') : '',
//       },
//       {
//         field: 'locale',
//         headerName: 'Locale',
//         type: 'string',
//         minWidth: 100,
//         flex: 1,
//         valueGetter: (_, row) => row.locale ?? '',
//       },
//       {
//         field: 'grid-actions',
//         type: 'actions',
//         headerName: 'Actions',
//         minWidth: 60,
//         maxWidth: 80,
//         flex: 1,
//         getActions: (params) => [
//           <GridActionsCellItem
//             icon={
//               <Tooltip placement='top' title='delete'>
//                 <DeleteRounded fontSize='small' />
//               </Tooltip>
//             }
//             onClick={async () => {
//               mutation.mutate(params.row.name);
//             }}
//             label='Delete Synonyms'
//             disabled={mutation.isPending}
//           />,
//         ],
//       },
//     ],
//     [mutation.isPending, mutation.mutate],
//   );

//   if (isError)
//     return <Typography>{error.message || 'something went wrong'}</Typography>;

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         minHeight: 267,
//         maxHeight: {
//           xs: 'calc(100vh - 140px)',
//           md: 'calc(100vh - 160px)',
//         },
//         width: '100%',
//       }}
//     >
//       <DataGrid
//         rows={data || []}
//         columns={columns}
//         loading={isLoading || isFetching}
//         pageSizeOptions={[5, 10, 20]}
//         getRowId={(row) => row.name}
//         initialState={{
//           columns: {
//             columnVisibilityModel: {},
//           },
//           pagination: { paginationModel: { pageSize: 10, page: 0 } },
//         }}
//       />
//     </Box>
//   );
// };
