import {
  analyticsFormDefaultValues,
  analyticsQueryKeys,
  analyticsFormOpts,
  collectionQueryKeys,
  type AnalyticsRuleCreateValues,
} from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import {
  AddRounded,
  DeleteOutlineRounded,
  MoreHorizRounded,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { AnalyticsRuleCreateSchema } from 'typesense/lib/Typesense/AnalyticsRule';
import { Badge } from './redesign';
import { AnalyticsRuleForm } from './AnalyticsRuleForm';
import { ErrorFallback } from './ErrorFallback';

export function AnalyticsRulesList() {
  const [client, clusterId] = useTypesenseClient();
  const { data: rules } = useSuspenseQuery({
    queryKey: analyticsQueryKeys.rules(clusterId),
    queryFn: async () => {
      const res = await client.analytics.rules().retrieve();
      return res.rules;
    },
  });
  const toast = useAsyncToast();
  const deleteMutation = useMutation({
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2,
        alignItems: { lg: 'flex-start' },
        width: '100%',
      }}
    >
      {/* Left: rules table */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            background: designTokens.surface,
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {rules.length === 0 ? (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography
                sx={{ fontSize: 13, color: designTokens.textMuted }}
              >
                No analytics rules yet. Create one using the panel on the
                right.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size='small' sx={{ tableLayout: 'auto' }}>
                <TableHead>
                  <TableRow
                    sx={{
                      background: designTokens.surfaceTinted,
                      '& th': {
                        textAlign: 'left',
                        px: 1.5,
                        py: 1.25,
                        fontSize: 11,
                        color: designTokens.textFaint,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: 'none',
                        borderBottom: `1px solid ${designTokens.border}`,
                        whiteSpace: 'nowrap',
                      },
                    }}
                  >
                    <TableCell>Rule</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>Limit</TableCell>
                    <TableCell sx={{ width: 50 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map((r, i) => (
                    <TableRow
                      key={r.name}
                      sx={{
                        '& td': {
                          px: 1.5,
                          py: 1.5,
                          border: 'none',
                          borderTop:
                            i === 0
                              ? 'none'
                              : `1px solid ${designTokens.border}`,
                        },
                        '&:hover': {
                          background: designTokens.surfaceMuted,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: designTokens.fontMono,
                            fontSize: 12.5,
                            color: designTokens.text,
                            fontWeight: 500,
                          }}
                        >
                          {r.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Badge tone='indigo' size={10.5}>
                          {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: designTokens.fontMono,
                            fontSize: 12,
                            color: designTokens.textMuted,
                          }}
                        >
                          {r.params.source?.collections?.join(', ') ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: designTokens.fontMono,
                            fontSize: 12,
                            color: designTokens.textMuted,
                          }}
                        >
                          {r.params.destination?.collection ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Typography
                          sx={{
                            fontFamily: designTokens.fontMono,
                            fontSize: 12,
                            color: designTokens.textMuted,
                          }}
                        >
                          {r.params.limit?.toLocaleString() ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Tooltip title='Delete rule'>
                          <IconButton
                            size='small'
                            onClick={() => deleteMutation.mutate(r.name)}
                            disabled={deleteMutation.isPending}
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: '5px',
                              color: designTokens.textFaint,
                              '&:hover': {
                                color: designTokens.danger,
                                background: designTokens.dangerSoft,
                              },
                            }}
                          >
                            <DeleteOutlineRounded sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Right: form panel */}
      <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => captureException(err)}
        >
          <Suspense>
            <NewRulePanel />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  );
}

function NewRulePanel() {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const { data: collectionNames } = useSuspenseQuery({
    queryKey: collectionQueryKeys.names(clusterId, { withAlias: true }),
    queryFn: async () => {
      const collections = await client.collections().retrieve();
      const aliasRes = await client.aliases().retrieve();
      return [
        ...aliasRes.aliases.map((a) => a.name),
        ...collections.map((c) => c.name),
      ];
    },
  });

  const mutation = useMutation({
    mutationFn: ({
      name,
      schema,
    }: {
      name: string;
      schema: AnalyticsRuleCreateSchema;
    }) => client.analytics.rules().upsert(name, schema),
    onMutate: (vars) => {
      toast.loading(`saving analytics rule`, {
        id: `rule-updated-${vars.name}`,
      });
    },
    onSuccess: (_, vars) => {
      toast.success(`analytics rule saved`, {
        id: `rule-updated-${vars.name}`,
      });
    },
    onError: (err, vars) => {
      const msg = err?.message || 'failed to save analytics rule';
      toast.error(msg, { id: `rule-updated-${vars.name}` });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsQueryKeys.rules(clusterId),
      });
    },
  });

  const form = useAppForm({
    ...analyticsFormOpts,
    defaultValues: analyticsFormDefaultValues,
    onSubmit: async ({ value }) => {
      const { name, type, params } = value;
      const schema: AnalyticsRuleCreateSchema = {
        type,
        params: {
          ...params,
          limit: isNaN(Number(params.limit))
            ? undefined
            : Number(params.limit),
        },
      };
      try {
        await mutation.mutateAsync({ name, schema });
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
      sx={{
        background: designTokens.surface,
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: 600,
          color: designTokens.text,
          mb: 0.5,
          letterSpacing: '-0.005em',
        }}
      >
        New analytics rule
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          lineHeight: 1.5,
          mb: 1.5,
        }}
      >
        Capture searches into a separate Typesense collection for analysis
        &amp; autocomplete.
      </Typography>

      <AnalyticsRuleForm
        form={form}
        sourceOptions={collectionNames}
        destinationOptions={collectionNames}
        submitButtonText='Add rule'
      />
    </Box>
  );
}
