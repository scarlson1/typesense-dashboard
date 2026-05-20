import { ErrorFallback } from '@/components';
import { AliasForm, aliasFormOpts } from '@/components/AliasForm';
import { AliasGrid } from '@/components/AliasGrid';
import {
  Badge,
  PageHeader,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { aliasQueryKeys, collectionQueryKeys } from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import { OpenInNewRounded, LinkRounded } from '@mui/icons-material';
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
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/collection-alias.html'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            When to use aliases
          </Button>
        }
      />
      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1.75,
            p: 2,
            background: 'background.paper',
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
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: designTokens.text,
                mb: 0.4,
              }}
            >
              Aliases let you swap collections with zero downtime.
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: designTokens.textMuted,
                lineHeight: 1.55,
              }}
            >
              Point your app at the alias — and re-target it whenever you
              re-index. The cutover is atomic; in-flight queries finish on the
              old index, new ones land on the new one.
            </Typography>
          </Box>
        </Box>

        <SectionCard title='Existing aliases' noBodyPadding>
          <Box sx={{ p: 2 }}>
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(err: unknown) => captureException(err)}
            >
              <Suspense>
                <AliasGrid />
              </Suspense>
            </ErrorBoundary>
          </Box>
        </SectionCard>

        <Box sx={{ mt: 2 }}>
          <SectionCard title='Create / update alias'>
            <AddAlias />
          </SectionCard>
        </Box>
      </Box>
    </Stack>
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
