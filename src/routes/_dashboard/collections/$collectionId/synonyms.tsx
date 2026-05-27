import {
  Badge,
  CollectionTabBar,
  PageHeader,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { SynonymsForm, synonymsFormOpts } from '@/components/SynonymsForm';
import { SynonymsGrid } from '@/components/SynonymsGrid';
import { collectionQueryKeys } from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import { DownloadRounded, OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { SynonymCreateSchema } from 'typesense/lib/Typesense/Synonyms';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/synonyms',
)({
  component: RouteComponent,
  staticData: { crumb: 'Synonyms' },
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Synonyms'
        badges={<Badge tone='neutral'>{collectionId}</Badge>}
        actions={
          <>
            <Button
              component='a'
              href='https://typesense.org/docs/29.0/api/synonyms.html'
              target='_blank'
              rel='noopener noreferrer'
              variant='outlined'
              size='small'
              startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
              sx={smallButtonSx}
            >
              One-way vs multi-way
            </Button>
            <Button
              variant='outlined'
              size='small'
              startIcon={<DownloadRounded sx={{ fontSize: 13 }} />}
              sx={smallButtonSx}
            >
              Export
            </Button>
          </>
        }
      />
      <CollectionTabBar collectionId={collectionId} />

      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 2,
          minHeight: 0,
        }}
      >
        <SectionCard noBodyPadding>
          <Box sx={{ p: 2 }}>
            <SynonymsGrid collectionId={collectionId} />
          </Box>
        </SectionCard>

        <Box sx={{ minWidth: 0 }}>
          <SectionCard title='Add synonym rule'>
            <AddSynonym collectionId={collectionId} />
          </SectionCard>
        </Box>
      </Box>
    </Stack>
  );
}

interface AddSynonymProps {
  collectionId: string;
}

function AddSynonym({ collectionId }: AddSynonymProps) {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const mutation = useMutation({
    mutationFn: ({
      synonymId,
      params,
    }: {
      synonymId: string;
      params: SynonymCreateSchema;
    }) =>
      client.collections(collectionId).synonyms().upsert(synonymId, params),
    onMutate: () => {
      toast.loading('saving synonyms', { id: 'synonyms' });
    },
    onSuccess: () => {
      toast.success('synonyms saved', { id: 'synonyms' });
    },
    onError: (err) => {
      const msg = err?.message ?? 'An error occurred saving synonyms';
      toast.error(msg, { id: 'synonyms' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.synonyms(clusterId, collectionId),
      });
    },
  });

  const form = useAppForm({
    ...synonymsFormOpts,
    onSubmit: async ({ value }) => {
      const params: SynonymCreateSchema = {
        ...value,
        synonyms: value.synonyms.split(',').map((s) => s.trim()),
        symbols_to_index: value.symbols_to_index
          .split(',')
          .map((s) => s.trim()),
      };
      try {
        await mutation.mutateAsync({ synonymId: value.synonyms, params });
        form.reset();
      } catch (err) {
        // swallow - toast handled in mutation
      }
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
      sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
    >
      <SynonymsForm form={form} />
    </Box>
  );
}
