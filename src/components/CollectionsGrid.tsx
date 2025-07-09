import { collectionQueryKeys, DEFAULT_MONACO_OPTIONS } from '@/constants';
import { collectionColumns } from '@/constants/gridColumns';
import {
  useCollectionEditorDialog,
  useDeleteCollection,
  useTypesenseClient,
} from '@/hooks';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { DataObjectRounded, DeleteRounded } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import type {
  GridCellParams,
  GridColDef,
  GridRowParams,
} from '@mui/x-data-grid';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Client } from 'typesense';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionsRetrieveOptions } from 'typesense/lib/Typesense/Collections';

const DEFAULT_VIEW_OPTIONS = { ...DEFAULT_MONACO_OPTIONS, readOnly: true };

// need to use REST api instead of sdk in order to use limit & offset (server grid pagination) ??
function fetchCollections(client: Client, query?: CollectionsRetrieveOptions) {
  return client.collections().retrieve(query);
}

export function CollectionsGrid() {
  const navigate = useNavigate();
  const [client, clusterId] = useTypesenseClient();

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: collectionQueryKeys.list(clusterId, {}),
    queryFn: () => fetchCollections(client),
  });

  const { openConfirmDelete } = useConfirmDelete();
  const mutation = useDeleteCollection();

  const viewSchema = useCollectionEditorDialog({
    initialOptions: DEFAULT_VIEW_OPTIONS,
  });

  const columns = useMemo<GridColDef<CollectionSchema>[]>(
    () => [
      ...collectionColumns,
      {
        headerName: 'Actions',
        field: 'actions',
        type: 'actions',
        width: 160,
        getActions: (params: GridRowParams<CollectionSchema>) => [
          <GridActionsCellItem
            icon={
              <Tooltip placement='top' title='view JSON'>
                <DataObjectRounded fontSize='small' />
              </Tooltip>
            }
            onClick={() => {
              viewSchema({
                title: params.id.toString(),
                value: JSON.stringify(params.row, null, 2),
              });
            }}
            label='View JSON'
          />,
          <GridActionsCellItem
            icon={
              <Tooltip placement='top' title='delete'>
                <DeleteRounded fontSize='small' />
              </Tooltip>
            }
            onClick={async () => {
              let focusedEl = document.activeElement as HTMLElement;
              if (focusedEl) focusedEl.blur();

              try {
                await openConfirmDelete(params.id.toString());

                mutation.mutate(params.row.name);
              } catch (err) {}
            }}
            label='Delete Collection'
            disabled={mutation.isPending}
          />,
        ],
      },
    ],
    []
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
        getRowId={(row) => row.name}
        loading={isLoading || isFetching}
        pageSizeOptions={[5, 10, 20]}
        onCellDoubleClick={(params: GridCellParams<CollectionSchema>) => {
          navigate({
            from: '/collections',
            to: `$collectionId/documents/search`,
            params: { collectionId: params.row.name },
          });
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {
              default_sorting_field: false,
              enable_nested_fields: false,
              symbols_to_index: false,
              token_separators: false,
              metadata: false,
              ['voice_query_model.model_name']: false,
            },
          },
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
      />
    </Box>
  );
}
