import { PageHeader, SectionCard, smallButtonSx } from '@/components/redesign';
import {
  synonymsFormOptsV30,
  SynonymsFormV30,
} from '@/components/SynonymsFormV30';
import {
  SynonymsGridV30,
  type SynonymRowForEdit,
} from '@/components/SynonymsGridV30';
import { collectionQueryKeys } from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import { DownloadRounded, OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { SynonymSetCreateSchema } from 'typesense';

export const Route = createFileRoute('/_dashboard/synonyms')({
  component: RouteComponent,
  staticData: { crumb: 'Synonyms' },
});

function RouteComponent() {
  const [editingSynonym, setEditingSynonym] = useState<SynonymRowForEdit | null>(null);

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Synonyms'
        actions={
          <>
            <Button
              component='a'
              href='https://typesense.org/docs/30.2/api/synonyms.html'
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
          <SynonymsGridV30 onEdit={(row) => setEditingSynonym(row)} />
        </SectionCard>

        <Box sx={{ minWidth: 0 }}>
          <SectionCard title={editingSynonym ? 'Edit synonym rule' : 'Add synonym rule'}>
            <AddSynonym
              editingSynonym={editingSynonym}
              onCancel={() => setEditingSynonym(null)}
            />
          </SectionCard>
        </Box>
      </Box>
    </Stack>
  );
}

interface AddSynonymProps {
  editingSynonym?: SynonymRowForEdit | null;
  onCancel?: () => void;
}

function AddSynonym({ editingSynonym, onCancel }: AddSynonymProps) {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const mutation = useMutation({
    mutationFn: ({
      synonymSetName,
      synonymSet,
    }: {
      synonymSetName: string;
      synonymSet: SynonymSetCreateSchema;
    }) => client.synonymSets(synonymSetName).upsert(synonymSet),
    onMutate: () => {
      toast.loading('saving synonym rule', { id: 'synonyms' });
    },
    onSuccess: () => {
      toast.success('synonym rule saved', { id: 'synonyms' });
    },
    onError: (err) => {
      const msg = err?.message ?? 'An error occurred saving synonym rule';
      toast.error(msg, { id: 'synonyms' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.synonymSets(clusterId),
      });
    },
  });

  const form = useAppForm({
    ...synonymsFormOptsV30,
    onSubmit: async ({ value }) => {
      const synonymSet: SynonymSetCreateSchema = {
        items: [
          {
            id: value.name,
            synonyms: value.synonyms
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            root: value.root || undefined,
            locale: value.locale || undefined,
            symbols_to_index: value.symbols_to_index
              ? value.symbols_to_index
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined,
          },
        ],
      };
      try {
        await mutation.mutateAsync({ synonymSetName: value.name, synonymSet });
        form.reset();
        onCancel?.();
      } catch (_) {
        // toast handled in mutation
      }
    },
  });

  useEffect(() => {
    if (editingSynonym) {
      form.setFieldValue('name', editingSynonym.setName);
      form.setFieldValue('synonyms', editingSynonym.synonyms);
      form.setFieldValue('root', editingSynonym.root);
      form.setFieldValue('symbols_to_index', editingSynonym.symbols_to_index);
      form.setFieldValue('locale', editingSynonym.locale);
    } else {
      form.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSynonym?.setName]);

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
      <SynonymsFormV30 form={form} isEditing={!!editingSynonym} onCancel={onCancel} />
    </Box>
  );
}
