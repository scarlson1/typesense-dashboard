import { apiKeyQueryKeys } from '@/constants';
import { apiKeyColumns } from '@/constants/gridColumns';
import { useAsyncToast, useDialog, useTypesenseClient } from '@/hooks';
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
import type { KeySchema } from 'typesense/lib/Typesense/Key';
import type { KeysRetrieveSchema } from 'typesense/lib/Typesense/Keys';

export const ApiKeyGrid = () => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();
  const dialog = useDialog();

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: apiKeyQueryKeys.all(clusterId),
    queryFn: () => client.keys().retrieve(),
  });

  const mutation = useMutation({
    mutationFn: (id: number) => client.keys(id).delete(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: apiKeyQueryKeys.all(clusterId),
      });

      const keysData: KeysRetrieveSchema | undefined = queryClient.getQueryData(
        apiKeyQueryKeys.all(clusterId)
      );
      const prevKeyData = keysData?.keys.find((k) => k.id === variables);

      queryClient.setQueryData(
        apiKeyQueryKeys.all(clusterId),
        (data: KeysRetrieveSchema) => ({
          keys: data.keys?.filter((k) => k.id !== variables),
        })
      );

      toast.loading(`deleting key [${variables}]...`, { id: 'delete-key' });

      return { id: variables, prevKeyData };
    },
    onSuccess: (_, __, ctx) => {
      toast.success(`API key ${ctx.id} deleted`, {
        id: 'delete-key',
      });
    },
    onError: (err, _, ctx) => {
      let msg = err.message || 'failed to delete key';
      toast.error(msg, { id: 'delete-key' });

      if (ctx?.prevKeyData) {
        queryClient.setQueryData(
          apiKeyQueryKeys.all(clusterId),
          (data: KeysRetrieveSchema) => ({
            keys: [...(data.keys || []), ctx.prevKeyData],
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

  const columns = useMemo<GridColDef<KeySchema>[]>(
    () => [
      ...apiKeyColumns,
      {
        field: 'grid-actions',
        type: 'actions',
        minWidth: 50,
        maxWidth: 60,
        flex: 1,
        getActions: (params) => [
          <GridActionsCellItem
            icon={
              <Tooltip placement='top' title='delete'>
                <DeleteRounded fontSize='small' />
              </Tooltip>
            }
            onClick={async () => {
              try {
                await dialog.prompt({
                  variant: 'danger',
                  catchOnCancel: true,
                  title: `Confirm API Key Deletion [ID: ${params.id.toString()}]`,
                  description: `THIS ACTION CANNOT BE UNDONE. Please confirm whether you'd like to delete API Key with prefix ${params.row.value_prefix}`,
                  // content: <div dangerouslySetInnerHTML={{ __html: disclosureHTML }} />,
                  slotProps: {
                    dialog: {
                      maxWidth: 'sm',
                    },
                  },
                });
                mutation.mutate(params.row.id);
              } catch (err) {
                console.log(`confirmation exited`);
              }
            }}
            label='Delete Collection'
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
        rows={data?.keys || []}
        columns={columns}
        loading={isLoading || isFetching}
        pageSizeOptions={[5, 10, 20]}
        // checkboxSelection
        initialState={{
          columns: {
            columnVisibilityModel: {
              // value: false,
              autodelete: false,
            },
          },
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
      />
    </Box>
  );
};
