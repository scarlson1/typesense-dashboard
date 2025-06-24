import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, Paper, Typography } from '@mui/material';
import {
  useMutation,
  useSuspenseQuery,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type {
  CollectionAliasCreateSchema,
  CollectionAliasSchema,
} from 'typesense/lib/Typesense/Aliases';
import {
  AliasForm,
  aliasFormOpts,
  AliasGrid,
  ErrorFallback,
} from '../../components';
import { aliasQueryKeys, collectionQueryKeys } from '../../constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '../../hooks';
import { queryClient } from '../../utils';

export const Route = createFileRoute('/_dashboard/alias')({
  component: RouteComponent,
  staticData: {
    crumb: 'Aliases',
  },
});

function RouteComponent() {
  return (
    <Box>
      <Typography variant='h3' gutterBottom>
        Aliases
      </Typography>
      <Typography>
        Aliases are like symlinks that can point to collections.{' '}
        <Link
          href='https://typesense.org/docs/28.0/api/collection-alias.html'
          target='_blank'
          rel='noopener noreferrer'
        >
          Read the documentation
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.5 }} />
        </Link>{' '}
        for information on how to best use aliases.
      </Typography>

      <Paper sx={{ my: 2, p: 2 }}>
        <AddAlias />
      </Paper>
      <Box>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense>
            <AliasGrid />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  );
}

type UseCreateAliasProps = Omit<
  UseMutationOptions<
    CollectionAliasSchema,
    Error,
    { name: string; mapping: CollectionAliasCreateSchema }
  >,
  'mutationFn'
>;

function useCreateAlias(props?: UseCreateAliasProps) {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const { onSuccess, onError, ...rest } = props || {};

  return useMutation({
    ...rest,
    mutationFn: ({
      name,
      mapping,
    }: {
      name: string;
      mapping: CollectionAliasCreateSchema;
    }) => client.aliases().upsert(name, mapping),
    onMutate: (vars) => {
      toast.loading(`creating alias "${vars.name}"`, { id: 'new-alias' });
      // TODO: optimistic update

      return vars;
    },
    onSuccess: (data, vars) => {
      toast.success('alias created', { id: 'new-alias' });

      onSuccess && onSuccess(data, vars, {});
    },
    onError: (e, vars, ctx) => {
      let msg = e.message || 'an error occurred';
      toast.error(msg, { id: 'new-alias' });
      onError && onError(e, vars, ctx);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: aliasQueryKeys.all(clusterId),
      });
    },
  });
}

function AddAlias() {
  const [client, clusterId] = useTypesenseClient();
  const { data: collections } = useSuspenseQuery({
    queryKey: collectionQueryKeys.names(clusterId),
    queryFn: async () => {
      let collectionSchemas = await client.collections().retrieve();
      return collectionSchemas.map((c) => c.name);
    },
  });

  const mutation = useCreateAlias();

  const form = useAppForm({
    ...aliasFormOpts,
    onSubmit: async ({ value }) => {
      mutation.mutate({
        name: value.aliasName,
        mapping: {
          collection_name: value.targetCollection,
        },
      });
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
      <AliasForm form={form} targetOptions={collections || []} />
    </Box>
  );
}
