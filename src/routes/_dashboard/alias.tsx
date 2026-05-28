import { ErrorFallback } from '@/components';
import { AliasForm, aliasFormOpts } from '@/components/AliasForm';
import { AliasGrid } from '@/components/AliasGrid';
import {
  Badge,
  PageHeader,
  smallButtonSx,
} from '@/components/redesign';
import { aliasQueryKeys, collectionQueryKeys } from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import {
  OpenInNewRounded,
  LinkRounded,
} from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { captureException } from '@sentry/react';
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

export const Route = createFileRoute('/_dashboard/alias')({
  component: RouteComponent,
  staticData: {
    crumb: 'Aliases',
  },
});

function RouteComponent() {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Aliases'
        badges={<Badge tone='neutral'>zero-downtime swaps</Badge>}
        actions={
          <Stack direction='row' gap={1} alignItems='center'>
            <Button
              component='a'
              href='https://typesense.org/docs/29.0/api/collection-alias.html'
              target='_blank'
              rel='noopener noreferrer'
              variant='outlined'
              size='small'
              startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
              sx={{ ...smallButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
            >
              When to use aliases
            </Button>
          </Stack>
        }
      />

      {/* Mobile count strip */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          px: 2.5,
          pb: 1.5,
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${designTokens.border}`,
        }}
      >
        <ErrorBoundary FallbackComponent={ErrorFallback} onError={(err: unknown) => captureException(err)}>
          <Suspense>
            <AliasCountChip />
          </Suspense>
        </ErrorBoundary>
      </Box>

      <Box
        sx={{
          flex: 1,
          px: { xs: 0, md: 3.5 },
          py: { xs: 0, md: 2.25 },
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        {/* Mobile info strip */}
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            px: 2,
            py: 1.5,
            background: designTokens.accentSoft,
          }}
        >
          <Typography sx={{ fontSize: 13, color: designTokens.accentDeep, lineHeight: 1.55 }}>
            Point your app at an alias — re-target it on re-index and the cutover is atomic.
          </Typography>
        </Box>

        {/* Desktop explainer card */}
        <Stack
          direction='row'
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 1.75,
            p: 2,
            backgroundColor: 'background.paper',
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            mb: 2,
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.75,
              background: designTokens.accentSoft,
              color: designTokens.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LinkRounded sx={{ fontSize: 16 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: designTokens.text, mb: 0.4 }}>
              Aliases let you swap collections with zero downtime.
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: designTokens.textMuted, lineHeight: 1.55 }}>
              Point your app at the alias — and re-target it whenever you
              re-index. The cutover is atomic; in-flight queries finish on the
              old index, new ones land on the new one.
            </Typography>
          </Box>
        </Stack>

        {/* Combined table + inline form card */}
        <Box
          sx={{
            background: designTokens.surface,
            border: { xs: 'none', md: `1px solid ${designTokens.border}` },
            borderTop: { xs: `1px solid ${designTokens.border}`, md: `1px solid ${designTokens.border}` },
            borderRadius: { xs: 0, md: 1 },
            overflow: 'hidden',
          }}
        >
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <Suspense>
              <AliasGrid />
            </Suspense>
          </ErrorBoundary>

          {/* Inline add/upsert footer */}
          <Box
            sx={{
              px: 2,
              py: 1.75,
              borderTop: `1px solid ${designTokens.border}`,
              background: designTokens.surfaceTinted,
            }}
          >
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(err: unknown) => captureException(err)}
            >
              <Suspense>
                <AddAlias />
              </Suspense>
            </ErrorBoundary>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}

function AliasCountChip() {
  const [client, clusterId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: aliasQueryKeys.all(clusterId),
    queryFn: async () => {
      const res = await client.aliases().retrieve();
      return res.aliases || [];
    },
  });
  const count = data.length;
  return (
    <Box
      component='span'
      sx={{
        display: 'inline-block',
        fontSize: 12.5,
        color: designTokens.textMuted,
        background: designTokens.surfaceMuted,
        border: `1px solid ${designTokens.border}`,
        borderRadius: '100px',
        px: 1.25,
        py: 0.375,
      }}
    >
      {count} alias{count !== 1 ? 'es' : ''}
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
      return vars;
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success('alias created', { id: 'new-alias' });
      onSuccess && onSuccess(data, vars, result, ctx);
    },
    onError: (e, vars, result, ctx) => {
      const msg = e.message || 'an error occurred';
      toast.error(msg, { id: 'new-alias' });
      onError && onError(e, vars, result, ctx);
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
      const collectionSchemas = await client.collections().retrieve();
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
