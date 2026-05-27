import {
  collectionQueryKeys,
  defaultOverrideValues,
  overrideFormOpts,
} from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import {
  AutoFixHighRounded,
  MoreHorizRounded,
  SettingsRounded,
} from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { captureException } from '@sentry/react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { OverrideCreateSchema } from 'typesense/lib/Typesense/Overrides';
import type { OverrideSchema } from 'typesense/lib/Typesense/Override';
import { Badge, smallButtonSx } from './redesign';
import { CurationForm } from './CurationForm';
import { ErrorFallback } from './ErrorFallback';
import { Button } from '@mui/material';

interface CurationListProps {
  collectionId: string;
}

export const CurationList = ({ collectionId }: CurationListProps) => {
  const [client, clusterId] = useTypesenseClient();
  const { data: overrides } = useSuspenseQuery({
    queryKey: collectionQueryKeys.curation(clusterId, collectionId),
    queryFn: async () => {
      const { overrides } = await client
        .collections(collectionId)
        .overrides()
        .retrieve();
      return overrides;
    },
  });

  const [editingId, setEditingId] = useState<string | null>('__new__');

  const editingOverride =
    editingId === '__new__'
      ? null
      : overrides.find((o) => o.id === editingId) ?? null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {/* Left: override cards */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {overrides.length === 0 ? (
          <Box
            sx={{
              background: designTokens.surface,
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: 13, color: designTokens.textMuted }}>
              No curation rules yet. Create one using the panel on the right.
            </Typography>
          </Box>
        ) : (
          overrides.map((override) => (
            <OverrideCard
              key={override.id}
              override={override}
              isSelected={editingId === override.id}
              onEdit={() => setEditingId(override.id)}
            />
          ))
        )}
      </Box>

      {/* Right: form panel */}
      <Box sx={{ width: 320, flexShrink: 0 }}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => captureException(err)}
        >
          <Suspense>
            {editingId === '__new__' || !editingOverride ? (
              <CurationFormCard
                key='__new__'
                collectionId={collectionId}
                isNew
                onSaved={(id) => setEditingId(id)}
              />
            ) : (
              <CurationFormCard
                key={editingOverride.id}
                collectionId={collectionId}
                override={editingOverride}
                onSaved={() => {}}
                onCancel={() => setEditingId('__new__')}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

interface OverrideCardProps {
  override: OverrideSchema;
  isSelected: boolean;
  onEdit: () => void;
}

function OverrideCard({ override, isSelected, onEdit }: OverrideCardProps) {
  const hasSchedule =
    override.effective_from_ts || override.effective_to_ts;

  const matchText =
    override.rule.query
      ? `${override.rule.match === 'contains' ? 'name:contains:' : ''}${override.rule.query}`
      : override.rule.filter_by
        ? override.rule.filter_by
        : override.rule.tags?.join(', ') ?? '—';

  const scheduleText = (() => {
    if (!hasSchedule) return 'always';
    const from = override.effective_from_ts
      ? new Date(override.effective_from_ts * 1000).toLocaleDateString(
          undefined,
          { month: 'short', day: 'numeric' },
        )
      : '';
    const to = override.effective_to_ts
      ? new Date(override.effective_to_ts * 1000).toLocaleDateString(
          undefined,
          { month: 'short', day: 'numeric' },
        )
      : '';
    if (from && to) return `${from}–${to}`;
    if (from) return `from ${from}`;
    return `until ${to}`;
  })();

  return (
    <Box
      sx={{
        background: designTokens.surface,
        border: `1px solid ${isSelected ? designTokens.accentBorder : designTokens.border}`,
        borderRadius: 1,
        overflow: 'hidden',
        transition: 'border-color 120ms ease',
      }}
    >
      {/* Card header */}
      <Stack
        direction='row'
        sx={{
          px: 2,
          py: 1.5,
          alignItems: 'center',
          gap: 1.25,
          borderBottom: `1px solid ${designTokens.border}`,
          background: designTokens.surfaceTinted,
        }}
      >
        <AutoFixHighRounded
          sx={{ fontSize: 15, color: designTokens.accent }}
        />
        <Typography
          sx={{
            fontFamily: designTokens.fontMono,
            fontSize: 13,
            fontWeight: 600,
            color: designTokens.text,
          }}
        >
          {override.id}
        </Typography>
        {override.stop_processing === false ? (
          <Badge tone='success' size={10}>
            ● active
          </Badge>
        ) : (
          <Badge tone='neutral' size={10}>
            paused
          </Badge>
        )}
        <Box sx={{ flex: 1 }} />
        <Button
          size='small'
          variant='outlined'
          onClick={onEdit}
          sx={{ ...smallButtonSx, height: 28, fontSize: 12, px: 1.25, minWidth: 'auto' }}
        >
          Edit
        </Button>
        <IconButton
          size='small'
          sx={{
            width: 26,
            height: 26,
            borderRadius: '5px',
            color: designTokens.textFaint,
          }}
        >
          <MoreHorizRounded sx={{ fontSize: 15 }} />
        </IconButton>
      </Stack>

      {/* Card body: WHEN / THEN */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 2.25,
          px: 2.25,
          py: 1.75,
        }}
      >
        {/* WHEN */}
        <Box>
          <SectionLabel>When</SectionLabel>
          <Box
            sx={{
              px: 1.25,
              py: 1,
              background: designTokens.surfaceMuted,
              borderRadius: '5px',
              fontFamily: designTokens.fontMono,
              fontSize: 12,
              color: designTokens.text,
              mb: 1,
              wordBreak: 'break-word',
            }}
          >
            {matchText}
          </Box>
          <Stack
            direction='row'
            spacing={0.75}
            sx={{ alignItems: 'center', fontSize: 11.5, color: designTokens.textMuted }}
          >
            <SettingsRounded sx={{ fontSize: 12, color: designTokens.textFaint }} />
            <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
              {scheduleText}
            </Typography>
          </Stack>
        </Box>

        {/* THEN */}
        <Box>
          <SectionLabel>Then</SectionLabel>
          {override.includes && override.includes.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 11, color: designTokens.textFaint, mb: 0.5 }}>
                Pin to top:
              </Typography>
              <Stack direction='row' spacing={0.625} sx={{ flexWrap: 'wrap', gap: 0.625 }}>
                {override.includes.map((inc) => (
                  <Box
                    key={inc.id}
                    component='span'
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1,
                      py: '3px',
                      background: designTokens.successSoft,
                      border: `1px solid ${designTokens.successBorder}`,
                      color: designTokens.successDeep,
                      borderRadius: '4px',
                      fontFamily: designTokens.fontMono,
                      fontSize: 11.5,
                    }}
                  >
                    <Box
                      component='span'
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        background: designTokens.successDeep,
                        color: designTokens.onAccent,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {inc.position}
                    </Box>
                    {inc.id}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          {override.excludes && override.excludes.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 11, color: designTokens.textFaint, mb: 0.5 }}>
                Hide:
              </Typography>
              <Stack direction='row' spacing={0.625} sx={{ flexWrap: 'wrap', gap: 0.625 }}>
                {override.excludes.map((ex) => (
                  <Box
                    key={ex.id}
                    component='span'
                    sx={{
                      px: 1,
                      py: '3px',
                      background: designTokens.dangerSoft,
                      border: `1px solid color-mix(in srgb, ${designTokens.danger} 40%, transparent)`,
                      color: designTokens.danger,
                      borderRadius: '4px',
                      fontFamily: designTokens.fontMono,
                      fontSize: 11.5,
                    }}
                  >
                    ↓ {ex.id}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          {(!override.includes || override.includes.length === 0) &&
            (!override.excludes || override.excludes.length === 0) && (
              <Box>
                {override.filter_by && (
                  <Typography sx={{ fontSize: 12, color: designTokens.textMuted, fontFamily: designTokens.fontMono }}>
                    filter: {override.filter_by}
                  </Typography>
                )}
                {override.sort_by && (
                  <Typography sx={{ fontSize: 12, color: designTokens.textMuted, fontFamily: designTokens.fontMono }}>
                    sort: {override.sort_by}
                  </Typography>
                )}
                {override.replace_query && (
                  <Typography sx={{ fontSize: 12, color: designTokens.textMuted, fontFamily: designTokens.fontMono }}>
                    replace: {override.replace_query}
                  </Typography>
                )}
                {!override.filter_by && !override.sort_by && !override.replace_query && (
                  <Typography sx={{ fontSize: 11.5, color: designTokens.textFaint }}>—</Typography>
                )}
              </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 10.5,
        fontWeight: 700,
        color: designTokens.textFaint,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );
}

interface CurationFormCardProps {
  collectionId: string;
  isNew?: boolean;
  override?: OverrideSchema;
  onSaved: (id: string) => void;
  onCancel?: () => void;
}

function CurationFormCard({
  collectionId,
  isNew,
  override,
  onSaved,
  onCancel,
}: CurationFormCardProps) {
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
      const msg = err.message || `error saving curation [${vars.overrideId}]`;
      toast.error(msg, { id: 'save-curation' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.curation(clusterId, collectionId),
      });
    },
  });

  const defaultValues = override
    ? {
        overrideId: override.id,
        rule_query_bool: Boolean(override.rule.query),
        rule_filter_bool: Boolean(override.rule.filter_by),
        rule_tags_bool: Boolean(override.rule.tags),
        rule: {
          query: override.rule.query || '',
          match: (override.rule.match as 'exact' | 'contains') || 'exact',
          filter_by: override.rule.filter_by || '',
          tags: override.rule.tags ? override.rule.tags.join(', ') : '',
        },
        filter_by_bool: Boolean(override.filter_by),
        filter_by: override.filter_by || '',
        sort_by_bool: Boolean(override.sort_by),
        sort_by: override.sort_by || '',
        filter_curated_hits: Boolean(override.filter_curated_hits),
        replace_query_bool: Boolean(override.replace_query),
        replace_query: override.replace_query || '',
        remove_match_tokens: Boolean(override.remove_matched_tokens),
        custom_metadata_bool: Boolean(override.metadata),
        metadata: override.metadata ? JSON.stringify(override.metadata) : '',
        stop_processing: Boolean(override.stop_processing),
        effective_from_ts_bool: Boolean(override.effective_from_ts),
        effective_from_ts: override.effective_from_ts
          ? new Date(override.effective_from_ts * 1000)
          : new Date(),
        effective_to_ts_bool: Boolean(override.effective_to_ts),
        effective_to_ts: override.effective_to_ts
          ? new Date(override.effective_to_ts * 1000)
          : new Date(),
      }
    : defaultOverrideValues;

  const form = useAppForm({
    ...overrideFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      const overrideCreate: OverrideCreateSchema = {
        rule: {
          query: value.rule_query_bool ? value.rule.query : undefined,
          match: value.rule_query_bool ? value.rule.match : undefined,
          filter_by: value.rule_filter_bool ? value.rule.filter_by : undefined,
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
        filter_curated_hits: value.filter_curated_hits,
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
        const result = await mutation.mutateAsync({
          collectionId,
          overrideId: value.overrideId,
          params: overrideCreate,
        });
        if (isNew) {
          form.reset();
          onSaved(result.id);
        }
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
      {/* Panel header */}
      <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: 0.75,
            background: designTokens.accentSoft,
            color: designTokens.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AutoFixHighRounded sx={{ fontSize: 14 }} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: designTokens.text, letterSpacing: '-0.005em' }}>
          {isNew ? 'New override' : `Edit: ${override?.id}`}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 12, color: designTokens.textMuted, lineHeight: 1.5, mb: 1.5 }}>
        Pin, hide, or re-rank specific documents when a query matches a rule.
      </Typography>

      <CurationForm form={form} submitButtonText={isNew ? 'Save override' : 'Update'} />

      {!isNew && onCancel ? (
        <Button
          type='button'
          variant='text'
          size='small'
          onClick={onCancel}
          sx={{ mt: 1, fontSize: 12, color: designTokens.textMuted, textTransform: 'none' }}
        >
          Cancel editing
        </Button>
      ) : null}
    </Box>
  );
}
