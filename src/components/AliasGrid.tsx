import { DeleteRounded } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRowParams,
} from '@mui/x-data-grid';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { CollectionAliasSchema } from 'typesense/lib/Typesense/Aliases';
import { aliasQueryKeys } from '../constants';
import { useAsyncToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';

export function AliasGrid() {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const { data } = useSuspenseQuery({
    queryKey: aliasQueryKeys.all(clusterId),
    queryFn: async () => {
      let res = await client.aliases().retrieve();
      return res.aliases || [];
    },
  });

  const mutation = useMutation({
    mutationFn: (name: string) => client.aliases(name).delete(),
    onMutate: (variables) => {
      toast.loading(`deleting alias "${variables}"`, { id: 'delete-alias' });
      const prevAliases: CollectionAliasSchema[] | undefined =
        queryClient.getQueryData(aliasQueryKeys.all(clusterId));

      queryClient.setQueryData(
        aliasQueryKeys.all(clusterId),
        (data: CollectionAliasSchema[]) =>
          data.filter((c) => c.name !== variables)
      );

      return { name: variables, prevAliases };
    },
    onSuccess: (_, __, ctx) => {
      // TODO: need to handle stale state of initialSchema
      toast.success(`alias "${ctx.name}" deleted`, { id: 'delete-alias' });
    },
    onError(error, _, ctx) {
      console.log('ERROR: ', error);
      let msg = error.message ?? `failed to delete alias "${ctx?.name}"`;
      toast.error(msg, { id: 'delete-alias' });

      queryClient.setQueryData(aliasQueryKeys.all(clusterId), ctx?.prevAliases);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: aliasQueryKeys.all(clusterId),
      });
    },
  });

  const columns = useMemo<GridColDef<CollectionAliasSchema>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Alias',
        type: 'string',
        minWidth: 100,
        flex: 1,
        sortable: false,
        filterable: false,
      },
      {
        field: 'collection_name',
        headerName: 'Target Collection',
        type: 'string',
        minWidth: 100,
        flex: 1,
        sortable: true,
        filterable: true,
        // TODO: renderCell with link to collection
      },
      {
        headerName: 'Actions',
        field: 'actions',
        type: 'actions',
        width: 80,
        getActions: (params: GridRowParams<CollectionAliasSchema>) => [
          <GridActionsCellItem
            icon={
              <Tooltip placement='top' title='Delete'>
                <DeleteRounded fontSize='small' />
              </Tooltip>
            }
            onClick={() => {
              mutation.mutate(params.row.name);
            }}
            label='Delete Alias'
            disabled={!params.row.name || mutation.isPending}
          />,
        ],
      },
    ],
    []
  );

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
        rows={data || []}
        columns={columns}
        getRowId={(row) => row.name}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          columns: {
            columnVisibilityModel: {},
          },
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
      />
    </Box>
  );
}
