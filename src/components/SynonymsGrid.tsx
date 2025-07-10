import { apiKeyQueryKeys, collectionQueryKeys } from '@/constants';
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
import type { KeysRetrieveSchema } from 'typesense/lib/Typesense/Keys';
import type { SynonymSchema } from 'typesense/lib/Typesense/Synonym';

interface SynonymsGridProps {
  collectionId: string;
}

export const SynonymsGrid = ({ collectionId }: SynonymsGridProps) => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: collectionQueryKeys.synonyms(clusterId, collectionId),
    queryFn: async () => {
      let synonyms = await client
        .collections(collectionId)
        .synonyms()
        .retrieve();
      return synonyms.synonyms;
    },
  });

  const mutation = useMutation({
    mutationFn: (id: string) =>
      client.collections(collectionId).synonyms(id).delete(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: collectionQueryKeys.synonyms(clusterId, collectionId),
      });

      const synonymsData: SynonymSchema[] | undefined =
        queryClient.getQueryData(
          collectionQueryKeys.synonyms(clusterId, collectionId)
        );
      const prevData = synonymsData?.find((k) => k.id === variables);

      queryClient.setQueryData(
        collectionQueryKeys.synonyms(clusterId, collectionId),
        (data: SynonymSchema[]) => data.filter((k) => k.id !== variables)
      );

      toast.loading(`deleting synonym [${variables}]...`, {
        id: 'delete-synonym',
      });

      return { id: variables, prevData };
    },
    onSuccess: (_, __, ctx) => {
      toast.success(`API synonym deleted [${ctx.id}]`, {
        id: 'delete-synonym',
      });
    },
    onError: (err, _, ctx) => {
      let msg = err.message || 'failed to delete synonym';
      toast.error(msg, { id: 'delete-synonym' });

      if (ctx?.prevData) {
        queryClient.setQueryData(
          apiKeyQueryKeys.all(clusterId),
          (data: KeysRetrieveSchema) => ({
            keys: [...(data.keys || []), ctx.prevData],
          })
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: apiKeyQueryKeys.all(clusterId),
      });
    },
  });

  const columns = useMemo<GridColDef<SynonymSchema>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
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
        flex: 0.8,
        sortable: false,
        filterable: false,
        valueGetter: (_, row) => (row.synonyms ? row.synonyms.join(', ') : ''),
      },
      {
        field: 'root',
        headerName: 'Root',
        type: 'string',
        minWidth: 100,
        flex: 1,
        valueGetter: (_, row) => row.root ?? '',
      },
      {
        field: 'symbols_to_index',
        headerName: 'Symbols to Index',
        type: 'string',
        minWidth: 100,
        flex: 1,
        sortable: false,
        filterable: false,
        valueGetter: (_, row) =>
          row.symbols_to_index ? row.symbols_to_index.join(', ') : '',
      },
      {
        field: 'locale',
        headerName: 'Locale',
        type: 'string',
        minWidth: 100,
        flex: 1,
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
            icon={
              <Tooltip placement='top' title='delete'>
                <DeleteRounded fontSize='small' />
              </Tooltip>
            }
            onClick={async () => {
              mutation.mutate(params.row.id);
            }}
            label='Delete Synonyms'
            disabled={mutation.isPending}
          />,
        ],
      },
    ],
    [mutation.isPending, mutation.mutate]
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
        rows={data || []}
        columns={columns}
        loading={isLoading || isFetching}
        pageSizeOptions={[5, 10, 20]}
        // checkboxSelection
        initialState={{
          columns: {
            columnVisibilityModel: {},
          },
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
      />
    </Box>
  );
};
