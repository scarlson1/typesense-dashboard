import { EMPTY_PRESET_PARAMS, presetQueryKeys, presetType } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { ExpandMoreRounded } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from '@mui/material';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useState, type SyntheticEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { SearchParams } from 'typesense/lib/Typesense/Documents';
import type {
  MultiSearchRequestSchema,
  MultiSearchRequestsSchema,
} from 'typesense/lib/Typesense/MultiSearch';
import { ErrorFallback } from './ErrorFallback';
import { UpdatePreset } from './UpdatePreset';

export function PresetsList() {
  const [client, clusterId] = useTypesenseClient();
  const { data: presets } = useSuspenseQuery({
    queryKey: presetQueryKeys.all(clusterId),
    queryFn: async () => {
      let { presets } = await client.presets().retrieve();
      return presets;
    },
  });

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
          multiSearchParams: isMulti
            ? (preset.value as MultiSearchRequestsSchema).searches.map((x) =>
                Object.entries(x).map(([k, v]) => ({
                  name: k,
                  value: v,
                }))
              )
            : [[EMPTY_PRESET_PARAMS], [EMPTY_PRESET_PARAMS]],
        };

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
              <UpdatePreset submitButtonText='Add Preset' />
            </Suspense>
          </ErrorBoundary>
        </AccordionDetails>
      </Accordion>
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

function isMultiSearch(
  val: SearchParams | MultiSearchRequestsSchema<undefined>
): val is MultiSearchRequestSchema {
  return (val as MultiSearchRequestsSchema).searches !== undefined;
}
