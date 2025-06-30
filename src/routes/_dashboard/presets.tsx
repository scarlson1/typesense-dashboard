import { OpenInNewRounded } from '@mui/icons-material';
import { Alert, Box, Link, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import { PresetsForm } from '../../components';
import { presetsFormOpts, presetType } from '../../constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '../../hooks';
import { queryClient } from '../../utils';

export const Route = createFileRoute('/_dashboard/presets')({
  component: RouteComponent,
  staticData: {
    crumb: 'Presets',
  },
});

function RouteComponent() {
  return (
    <>
      <Typography variant='h3' gutterBottom>
        Presets
      </Typography>
      <Typography sx={{ maxWidth: 760, textAlign: 'justify' }} gutterBottom>
        Presets allow you to manage search parameters in Typesense, and
        reference just the preset name in your application. This way, you can
        change search parameters without having to make code changes.{' '}
        <Link
          href='https://typesense.org/docs/28.0/api/search.html#presets'
          target='_blank'
          rel='noopener noreferrer'
        >
          Read the documentation
          <OpenInNewRounded fontSize='inherit' />
        </Link>{' '}
        for more information on available options.
      </Typography>
      <Alert severity='warning'>
        Multi-Collection Presets not implemented yet
      </Alert>
      <Box sx={{ py: 2, maxWidth: 840 }}>
        <AddPreset />
      </Box>
    </>
  );
}

function AddPreset() {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();
  const mutation = useMutation({
    mutationFn: ({
      presetId,
      params,
    }: {
      presetId: string;
      params: PresetCreateSchema;
    }) => client.presets().upsert(presetId, params),
    onMutate: (vars) => {
      toast.loading(`saving stopword set [${vars.presetId}]`, {
        id: 'save-presets',
      });
      return vars;
    },
    onSuccess: (data) => {
      toast.success(`presets saved [${data.name}]`, { id: 'save-presets' });
    },
    onError: (err, vars) => {
      let msg = err.message || `error saving presets [${vars.presetId}]`;
      toast.error(msg, { id: 'save-presets' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [clusterId, 'presets'],
      });
    },
  });

  const form = useAppForm({
    ...presetsFormOpts,
    onSubmit: async ({ value }) => {
      try {
        // TODO: format params value based on "single" or "multi-search"
        // TODO: handle value types aside from strings (arrays, numbers, etc.)
        // use zod refine / coerce ??
        let presetValue: PresetCreateSchema['value'] = {};
        if (value.presetType === presetType.enum['Single-Collection']) {
          presetValue = Object.assign({}, ...value.searchParameters);
        } else if (value.presetType === presetType.enum['Multi-Search']) {
          let presetValues = {
            // union: true,
            searches: value.multiSearchParams.map((p) =>
              p.map((params) => ({ [params.name]: params.value })).flat()
            ),
          };
          console.log('PRESET VALUES:', presetValues);
          throw new Error('multi-search not implemented yet');
        }

        await mutation.mutateAsync({
          presetId: value.presetId,
          params: {
            value: presetValue,
          },
        });
        form.reset();
      } catch (err) {
        console.log(err);
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
    >
      <PresetsForm form={form} />
    </Box>
  );
}
