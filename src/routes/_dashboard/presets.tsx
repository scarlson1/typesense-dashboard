import { ExpandMoreRounded, OpenInNewRounded } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Link,
  Typography,
} from '@mui/material';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useState, type SyntheticEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { SearchParams } from 'typesense/lib/Typesense/Documents';
import type {
  MultiSearchRequestSchema,
  MultiSearchRequestsSchema,
  MultiSearchRequestWithPresetSchema,
} from 'typesense/lib/Typesense/MultiSearch';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import { ErrorFallback, PresetsForm } from '../../components';
import {
  DEFAULT_PRESET_VALUES,
  EMPTY_PRESET_PARAMS,
  presetQueryKeys,
  presetsFormOpts,
  presetType,
  type MultiParameterKeys,
  type ParameterKeys,
} from '../../constants';
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
        <PresetsList />
        <UpdatePreset />
      </Box>
    </>
  );
}

function useDeletePreset() {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  return useMutation({
    mutationFn: (name: string) => client.presets(name).delete(),
    onMutate: (vars) => {
      toast.success(`deleting ["${vars}"]`, { id: `${vars}-delete` });
    },
    onSuccess: (_, vars) => {
      toast.success(`"${vars}" deleted`, { id: `${vars}-delete` });
    },
    onError: (_, vars) => {
      toast.success(`failed to delete rule ["${vars}"]`, {
        id: `${vars}-delete`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
    },
  });
}

function PresetsList() {
  const [client, clusterId] = useTypesenseClient();
  const { data: presets } = useSuspenseQuery({
    queryKey: presetQueryKeys.all(clusterId),
    queryFn: async () => {
      let { presets } = await client.presets().retrieve();
      return presets;
    },
  });
  console.log('PRESETS: ', presets);

  const deleteMutation = useDeletePreset();

  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAccordion =
    (panel: string) => (_: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : null);
    };

  const handleDeletePreset = (name: string) => {
    deleteMutation.mutate(name);
  };

  return (
    <>
      {presets.map((preset, i) => {
        let isMulti = isMultiSearch(preset.value);

        console.log('VAL: ', preset.value);

        const defaultValues = {
          presetId: preset.name,
          presetType: isMulti
            ? presetType.enum['Multi-Search']
            : presetType.enum['Single-Collection'],
          searchParameters: isMulti
            ? [EMPTY_PRESET_PARAMS]
            : Object.entries(preset.value).map(([k, v]) => ({
                name: k,
                value: v,
              })),
          multiSearchParams: isMulti // @ts-ignore
            ? (preset.value as MultiSearchRequestSchema).searches.map(
                (
                  x: (
                    | MultiSearchRequestSchema
                    | MultiSearchRequestWithPresetSchema
                  )[]
                ) =>
                  Object.entries(x).map(([k, v]) => ({
                    name: k,
                    value: v,
                  }))
              )
            : [[EMPTY_PRESET_PARAMS], [EMPTY_PRESET_PARAMS]],
        };
        console.log('DEFAULT VALUES: ', defaultValues);

        return (
          <Accordion
            expanded={expanded === `${preset.name}-${i}`}
            onChange={handleAccordion(`${preset.name}-${i}`)}
            key={preset.name}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRounded />}
              aria-controls={`${preset.name}-${i}-content`}
              id={`${preset.name}-${i}-header`}
            >
              <Typography variant='h6'>{preset.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense>
                  <UpdatePreset
                    defaultValues={defaultValues}
                    submitButtonText='Update'
                  />
                  <Button
                    onClick={() => handleDeletePreset(preset.name)}
                    loading={
                      deleteMutation.isPending &&
                      deleteMutation.variables === preset.name
                    }
                    disabled={deleteMutation.isPending}
                    sx={{ my: 1 }}
                    color='error'
                  >
                    Delete
                  </Button>
                </Suspense>
              </ErrorBoundary>
            </AccordionDetails>
          </Accordion>
        );
      })}
      <Accordion
        expanded={expanded === `new`}
        onChange={handleAccordion(`new`)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreRounded />}
          aria-controls={`new-content`}
          id={`new-header`}
        >
          <Typography variant='h6'>Add New Preset</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense>
              <UpdatePreset
                // defaultValues={analyticsFormDefaultValues}
                submitButtonText='Add Preset'
              />
            </Suspense>
          </ErrorBoundary>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

function isMultiSearch(
  val: SearchParams | MultiSearchRequestsSchema<undefined>
): val is MultiSearchRequestSchema {
  return (val as MultiSearchRequestsSchema).searches !== undefined;
}

interface UpdatePresetProps {
  defaultValues?: any;
  submitButtonText?: string;
}

function UpdatePreset({
  defaultValues = DEFAULT_PRESET_VALUES,
  submitButtonText = 'Submit',
}: UpdatePresetProps) {
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
        queryKey: presetQueryKeys.all(clusterId),
      });
    },
  });

  const form = useAppForm({
    ...presetsFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        // TODO: handle param value types aside from strings (arrays, numbers, etc.)
        // use zod refine / coerce ??
        let presetValue: PresetCreateSchema['value'] = {};
        if (value.presetType === presetType.enum['Single-Collection']) {
          let x = value.searchParameters.map(
            (p: { name: ParameterKeys; value: string }) => ({
              [p.name]: p.value,
            })
          );
          presetValue = x[0];
        } else if (value.presetType === presetType.enum['Multi-Search']) {
          presetValue = {
            // union: true,
            searches: value.multiSearchParams.map(
              (p: { name: MultiParameterKeys; value: string }[]) =>
                Object.assign(
                  {},
                  ...p.map((params) => ({ [params.name]: params.value }))
                )
            ),
          };
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
      <PresetsForm form={form} submitButtonText={submitButtonText} />
    </Box>
  );
}
