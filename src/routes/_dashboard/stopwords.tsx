import { DeleteRounded, OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, Paper, Tooltip, Typography } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { StopwordSchema } from 'typesense/lib/Typesense/Stopword';
import type { StopwordCreateSchema } from 'typesense/lib/Typesense/Stopwords';
import { StopwordsForm } from '../../components';
import { stopwordsFormOpts } from '../../constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '../../hooks';
import { queryClient } from '../../utils';

export const Route = createFileRoute('/_dashboard/stopwords')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Typography variant='h3' gutterBottom>
        Stopwords
      </Typography>
      <Typography>
        Stopwords are removed from the search query when they are present in the
        search query.{' '}
        <Link
          href='https://typesense.org/docs/28.0/api/stopwords.html'
          target='_blank'
          rel='noopener noreferrer'
        >
          Docs <OpenInNewRounded fontSize='inherit' />
        </Link>
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <AddStopword />
      </Paper>
      <Box sx={{ py: 2 }}>
        <StopwordsList />
      </Box>
    </>
  );
}

function StopwordsList() {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [clusterId, 'stopwords'],
    queryFn: async () => {
      let res = await client.stopwords().retrieve();

      return res.stopwords;
    },
  });

  const mutation = useMutation({
    mutationFn: (id: string) => client.stopwords(id).delete(),
    onMutate: (vars) => {
      toast.loading(`deleting [${vars}]`, { id: `delete-${vars}` });
    },
    onSuccess: (_, vars) => {
      toast.success(`"${vars}" deleted`, { id: `delete-${vars}` });
    },
    onError: (err, vars) => {
      let msg = err?.message || `error deleting "${vars}"`;
      toast.error(msg, { id: `delete-${vars}` });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [clusterId, 'stopwords'],
      });
    },
  });

  const columns = useMemo<GridColDef<StopwordSchema>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        type: 'string',
        minWidth: 120,
        flex: 1,
        sortable: false,
        filterable: false,
      },
      {
        field: 'stopwords',
        headerName: 'Description',
        type: 'string',
        minWidth: 160,
        flex: 1.5,
        sortable: false,
        filterable: false,
        valueFormatter: (_, row) => row.stopwords.join(', '),
      },
      {
        field: 'locale',
        headerName: 'Locale',
        type: 'string',
        minWidth: 80,
        flex: 0.4,
        sortable: false,
        filterable: false,
      },
      {
        headerName: 'Actions',
        field: 'grid-actions',
        type: 'actions',
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
            label='Delete Stopword Set'
            disabled={mutation.isPending}
          />,
        ],
      },
    ],
    [mutation.mutate, mutation.isPending]
  );

  if (isError) {
    return <Typography>{error?.message || 'an error occurred'}</Typography>;
  }

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
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
      />
    </Box>
  );
}

function AddStopword() {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();
  const mutation = useMutation({
    mutationFn: ({
      stopwordId,
      params,
    }: {
      stopwordId: string;
      params: StopwordCreateSchema;
    }) => client.stopwords().upsert(stopwordId, params),
    onMutate: (vars) => {
      toast.loading(`saving stopword set [${vars.stopwordId}]`, {
        id: 'save-stopwords',
      });
    },
    onSuccess: (data) => {
      toast.success(`stopwords saved [${data.id}]`, { id: 'save-stopwords' });
    },
    onError: (err, vars) => {
      let msg = err.message || `error saving stopwords [${vars.stopwordId}]`;
      toast.error(msg, { id: 'save-stopwords' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [clusterId, 'stopwords'],
      });
    },
  });

  const form = useAppForm({
    ...stopwordsFormOpts,
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync({
          stopwordId: value.stopwordId,
          params: {
            stopwords: value.stopwords.split(',').map((w) => w.trim()),
            locale: value.locale,
          },
        });
        form.reset();
      } catch (err) {}
    },
  });

  return (
    <Box
      component='form'
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <StopwordsForm form={form} />
    </Box>
  );
}
