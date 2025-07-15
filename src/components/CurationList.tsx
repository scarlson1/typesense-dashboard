import {
  collectionQueryKeys,
  defaultOverrideValues,
  overrideFormOpts,
} from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { ExpandMoreRounded } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useState, type SyntheticEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { OverrideCreateSchema } from 'typesense/lib/Typesense/Overrides';
import { CurationForm } from './CurationForm';
import { ErrorFallback } from './ErrorFallback';

interface CurationListProps {
  collectionId: string;
}

export const CurationList = ({ collectionId }: CurationListProps) => {
  const [client, clusterId] = useTypesenseClient();
  const { data: overrides } = useSuspenseQuery({
    queryKey: collectionQueryKeys.curation(clusterId, collectionId),
    queryFn: async () => {
      let { overrides } = await client
        .collections(collectionId)
        .overrides()
        .retrieve();
      return overrides;
    },
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAccordion =
    (panel: string) => (_: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : null);
    };

  return (
    <>
      {overrides.map((override) => (
        <Accordion
          expanded={expanded === `${override.id}`}
          onChange={handleAccordion(`${override.id}`)}
          key={override.id}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreRounded />}
            aria-controls={`${override.id}-content`}
            id={`${override.id}-header`}
          >
            <Typography variant='h6'>{override.id}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(err: Error) => {
                captureException(err);
              }}
            >
              <Suspense>
                <CurationFormComponent
                  collectionId={collectionId}
                  submitButtonText='Update Override'
                  defaultValues={{
                    overrideId: override.id,
                    rule_query_bool: Boolean(override.rule.query),
                    rule_filter_bool: Boolean(override.rule.filter_by),
                    rule_tags_bool: Boolean(override.rule.tags),
                    rule: {
                      query: override.rule.query || '',
                      match: override.rule.match || 'exact',
                      filter_by: override.rule.filter_by || '',
                      tags: override.rule.tags
                        ? override.rule.tags.join(', ')
                        : '',
                    },
                    filter_by_bool: Boolean(override.filter_by),
                    filter_by: override.filter_by || '',
                    sort_by_bool: Boolean(override.sort_by),
                    sort_by: override.sort_by,
                    filter_curated_hits: Boolean(override.filter_curated_hits),
                    replace_query_bool: Boolean(override.replace_query),
                    replace_query: override.replace_query || '',
                    remove_match_tokens: Boolean(
                      override.remove_matched_tokens
                    ),
                    custom_metadata_bool: Boolean(override.metadata),
                    metadata: override.metadata
                      ? JSON.stringify(override.metadata)
                      : '',
                    stop_processing: Boolean(override.stop_processing),
                    effective_from_ts_bool: Boolean(override.effective_from_ts),
                    effective_from_ts: override.effective_from_ts
                      ? new Date(override.effective_from_ts * 1000)
                      : new Date(),
                    effective_to_ts_bool: Boolean(override.effective_to_ts),
                    effective_to_ts: override.effective_to_ts
                      ? new Date(override.effective_to_ts * 1000)
                      : new Date(),
                  }}
                />
                <Button
                  // onClick={() => handleDeleteRule(r.name)}
                  onClick={() => alert('TODO: delete override')}
                  // loading={mutation.isPending && mutation.variables === r.name}
                  // disabled={mutation.isPending}
                  sx={{ my: 1 }}
                >
                  Delete
                </Button>
              </Suspense>
            </ErrorBoundary>
          </AccordionDetails>
        </Accordion>
      ))}

      <Accordion
        expanded={expanded === `new`}
        onChange={handleAccordion(`new`)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreRounded />}
          aria-controls={`new-content`}
          id={`new-header`}
        >
          <Typography variant='h6'>Add New Override</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: Error) => {
              captureException(err);
            }}
          >
            <Suspense>
              <CurationFormComponent
                collectionId={collectionId}
                defaultValues={defaultOverrideValues}
                submitButtonText='Add Override'
              />
            </Suspense>
          </ErrorBoundary>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

interface CurationFormComponentProps {
  collectionId: string;
  defaultValues: any;
  submitButtonText: string;
}

function CurationFormComponent({
  collectionId,
  defaultValues,
  submitButtonText,
}: CurationFormComponentProps) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const mutation = useMutation({
    mutationFn: ({
      collectionId,
      overrideId,
      params,
    }: {
      collectionId: string;
      overrideId: string;
      params: OverrideCreateSchema;
    }) =>
      client.collections(collectionId).overrides().upsert(overrideId, params),
    onMutate: (vars) => {
      toast.loading(`saving curation [${vars.overrideId}]`, {
        id: 'save-curation',
      });
    },
    onSuccess: (data) => {
      toast.success(`curation saved [${data.id}]`, { id: 'save-curation' });
    },
    onError: (err, vars) => {
      let msg = err.message || `error saving curation [${vars.overrideId}]`;
      toast.error(msg, { id: 'save-curation' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.curation(clusterId, collectionId),
      });
    },
  });

  const form = useAppForm({
    ...overrideFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      let overrideCreate: OverrideCreateSchema = {
        rule: {
          query: value.rule_query_bool ? value.rule.query : undefined,
          match: value.rule_query_bool ? value.rule.match : undefined,
          filter_by: value.rule_filter_bool ? value.rule.match : undefined,
          tags: value.rule.tags
            ? value.rule.tags.split(', ').map((t: string) => t.trim())
            : undefined,
        },
        filter_by: value.filter_by_bool ? value.filter_by : undefined,
        sort_by: value.sort_by_bool ? value.sort_by : undefined,
        remove_matched_tokens: value.remove_match_tokens,
        replace_query: value.replace_query_bool
          ? value.replace_query
          : undefined,
        // includes: [],
        // excludes: [],
        filter_curated_hits: value.filter_curated_hits,
        // TODO: date validation ?? does api throw if date is in the past ??
        effective_from_ts: value.effective_from_ts_bool
          ? value.effective_from_ts.getTime() / 1000
          : undefined,
        effective_to_ts: value.effective_to_ts_bool
          ? value.effective_to_ts.getTime() / 1000
          : undefined,
        stop_processing: value.stop_processing,
        metadata: value.custom_metadata_bool
          ? JSON.parse(value.metadata)
          : undefined,
      };

      try {
        await mutation.mutateAsync({
          collectionId,
          overrideId: value.overrideId,
          params: overrideCreate,
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2,
      }}
    >
      <CurationForm form={form} submitButtonText={submitButtonText} />
    </Box>
  );
}
