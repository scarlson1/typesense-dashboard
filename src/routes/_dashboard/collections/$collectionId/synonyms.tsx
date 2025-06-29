import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, Paper, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { SynonymCreateSchema } from 'typesense/lib/Typesense/Synonyms';
import { SynonymsGrid } from '../../../../components';
import {
  SynonymsForm,
  synonymsFormOpts,
} from '../../../../components/SynonymsForm';
import { collectionQueryKeys } from '../../../../constants';
import {
  useAppForm,
  useAsyncToast,
  useTypesenseClient,
} from '../../../../hooks';
import { queryClient } from '../../../../utils';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/synonyms'
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Synonyms',
  },
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <>
      <Typography variant='h3' gutterBottom>
        Synonyms
      </Typography>
      <Typography gutterBottom>
        <Link href='' target='_blank' rel='noopener noreferrer'>
          Read the documentation
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
        </Link>{' '}
        for information on one-way vs multi-way synonyms.
      </Typography>
      <Paper sx={{ mt: 2, p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <AddSynonym collectionId={collectionId} />
      </Paper>
      <Box sx={{ py: 2 }}>
        <SynonymsGrid collectionId={collectionId} />
      </Box>
    </>
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
    }) => client.collections(collectionId).synonyms().upsert(synonymId, params),
    onMutate: () => {
      toast.loading(`saving synonyms`, { id: 'synonyms' });
    },
    onSuccess: () => {
      toast.success(`saving synonyms`, { id: 'synonyms' });
    },
    onError: () => {
      toast.error(`saving synonyms`, { id: 'synonyms' });
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
      let params: SynonymCreateSchema = {
        ...value,
        synonyms: value.synonyms.split(',').map((s) => s.trim()),
        symbols_to_index: value.symbols_to_index
          .split(',')
          .map((s) => s.trim()),
      };
      try {
        await mutation.mutateAsync({ synonymId: value.synonyms, params });
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2,
      }}
    >
      <SynonymsForm form={form} />
    </Box>
  );
}
