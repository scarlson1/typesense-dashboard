import { DataObjectRounded, DeleteRounded } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import type {
  GridCellParams,
  GridColDef,
  GridRowParams,
} from '@mui/x-data-grid';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { editor } from 'monaco-editor';
import { useMemo, useState } from 'react';
import { Client } from 'typesense';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionsRetrieveOptions } from 'typesense/lib/Typesense/Collections';
import { collectionQueryKeys } from '../constants';
import { collectionColumns } from '../constants/gridColumns';
import { useAsyncToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';
import { CollectionJsonDialog } from './CollectionJsonDialog';

// TODO: add confirmation before deleting collection (force typing collection name)

const DEFAULT_MONACO_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  tabSize: 2,
  minimap: { enabled: false },
  // lineNumbers: true,
  quickSuggestions: true, // Auto-completion
  // autoIndent: true,
  automaticLayout: true,
  // validate: true,
  folding: true,
  hover: {
    enabled: true,
  },
  suggest: {
    // insertMode: 'insert',
    showInlineDetails: true,
    // showDetails: true,
    preview: true,
    // previewMode: 'prefix',
    // maxVisibleSuggestions: 12,
  },
};

// need to use REST api instead of sdk in order to use limit & offset ??
function fetchCollections(client: Client, query?: CollectionsRetrieveOptions) {
  return client.collections().retrieve(query);
}

export function CollectionsGrid() {
  const navigate = useNavigate();
  const client = useTypesenseClient();
  const toast = useAsyncToast();

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: collectionQueryKeys.list({}),
    queryFn: () => fetchCollections(client),
  });

  const [open, setOpen] = useState(false);
  const [tempDialogData, setTempDialogData] = useState<string>('');

  const handleClose = () => {
    setTempDialogData('');
    setOpen(false);
  };

  const mutation = useMutation({
    mutationFn: (colName: string) => client.collections(colName).delete(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: collectionQueryKeys.list({}),
      });

      const collections: CollectionSchema[] | undefined =
        queryClient.getQueryData(collectionQueryKeys.list({}));
      const prevCollection = collections?.find((c) => c.name === variables);

      queryClient.setQueryData(
        collectionQueryKeys.list({}),
        (data: CollectionSchema[]) => data.filter((c) => c.name !== variables)
      );

      toast.loading(`removing ${variables} collection`, {
        id: 'delete-collection',
      });

      let ctx: { colName: string; prevCollection?: CollectionSchema } = {
        colName: variables,
      };
      if (prevCollection) ctx.prevCollection = prevCollection;
      return ctx;
    },
    onSuccess: (_, __, context) => {
      toast.success(`collection ${context.colName} dropped`, {
        id: 'delete-collection',
      });
    },
    onError: (err, _, context) => {
      let msg = err.message || 'failed to delete collection';
      toast.error(msg, { id: 'delete-collection' });

      if (context?.prevCollection) {
        queryClient.setQueryData(
          collectionQueryKeys.list({}),
          (data: CollectionSchema[]) => [...data, context?.prevCollection]
        );
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.list({}) }),
  });

  const columns = useMemo<GridColDef<CollectionSchema>[]>(
    () => [
      {
        field: 'actions',
        type: 'actions',
        width: 80,
        getActions: (params: GridRowParams<CollectionSchema>) => [
          <GridActionsCellItem
            icon={
              <Tooltip placement='top' title='view JSON'>
                <DataObjectRounded fontSize='small' />
              </Tooltip>
            }
            onClick={() => {
              setTempDialogData(JSON.stringify(params.row, null, 2));
              setOpen(true);
            }}
            label='View JSON'
            // disabled={!params.row.asin}
          />,
          <GridActionsCellItem
            icon={
              <Tooltip placement='top' title='delete'>
                <DeleteRounded fontSize='small' />
              </Tooltip>
            }
            onClick={() => {
              mutation.mutate(params.row.name);
            }}
            label='Delete Collection'
            disabled={mutation.isPending}
          />,
        ],
      },
      ...collectionColumns,
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
        // {...gridProps}
        rows={data || []}
        columns={columns}
        getRowId={(row) => row.name}
        loading={isLoading || isFetching}
        pageSizeOptions={[5, 10, 20]}
        // checkboxSelection
        onCellDoubleClick={(params: GridCellParams<CollectionSchema>) => {
          navigate({
            from: '/collections',
            to: `$collectionId`,
            params: { collectionId: params.row.name },
          });
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {
              symbols_to_index: false,
              token_separators: false,
              metadata: false,
              ['voice_query_model.model_name']: false,
            },
          },
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
      />
      <CollectionJsonDialog
        value={tempDialogData}
        handleClose={handleClose}
        open={open}
        initialOptions={DEFAULT_MONACO_OPTIONS}
        client={client}
      />
    </Box>
  );
}
