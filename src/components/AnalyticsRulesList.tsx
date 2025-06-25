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
import { analyticsFormDefaultValues, analyticsQueryKeys } from '../constants';
import { useAsyncToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';
import { ErrorFallback } from './ErrorFallback';
import { UpdateAnalyticsRule } from './UpdateAnalyticsRule';

// TODO: fix UI not updating when listing is updated or deleted (form name will show old index name, but accordion title will update correctly)
export function AnalyticsRulesList() {
  const [client, clusterId] = useTypesenseClient();
  const { data: rules } = useSuspenseQuery({
    queryKey: analyticsQueryKeys.rules(clusterId),
    queryFn: async () => {
      let rules = await client.analytics.rules().retrieve();
      return rules.rules;
    },
  });
  const toast = useAsyncToast();
  const mutation = useMutation({
    mutationFn: (name: string) => client.analytics.rules(name).delete(),
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
        queryKey: analyticsQueryKeys.rules(clusterId),
      });
    },
  });

  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAccordion =
    (panel: string) => (_: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : null);
    };

  const handleDeleteRule = (name: string) => {
    mutation.mutate(name);
  };

  return (
    <>
      {rules.map((r, i) => (
        <Accordion
          expanded={expanded === `${r.name}-${i}`}
          onChange={handleAccordion(`${r.name}-${i}`)}
          key={r.name}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreRounded />}
            aria-controls={`${r.name}-${i}-content`}
            id={`${r.name}-${i}-header`}
          >
            <Typography variant='h6'>{r.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense>
                <UpdateAnalyticsRule
                  defaultValues={{
                    name: r.name,
                    type: r.type,
                    params: {
                      source: {
                        collections: r.params.source.collections,
                      },
                      destination: {
                        collection: r.params.destination.collection,
                      },
                      enable_auto_aggregation:
                        r.params.enable_auto_aggregation || false,
                      expand_query: r.params.expand_query || false,
                      limit: r.params.limit ? String(r.params.limit) : '',
                    },
                  }}
                />
                <Button
                  onClick={() => handleDeleteRule(r.name)}
                  loading={mutation.isPending && mutation.variables === r.name}
                  disabled={mutation.isPending}
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
          <Typography variant='h6'>Add New Analytics Rule</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense>
              <UpdateAnalyticsRule
                defaultValues={analyticsFormDefaultValues}
                submitButtonText='Add Analytics Rule'
              />
            </Suspense>
          </ErrorBoundary>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
