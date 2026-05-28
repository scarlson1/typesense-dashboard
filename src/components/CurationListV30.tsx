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
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { captureException } from '@sentry/react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useState, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type {
  CurationObjectSchema,
  CurationRuleSchema,
} from 'typesense/lib/Typesense/CurationSets';
import { CurationForm } from './CurationForm';
import { ErrorFallback } from './ErrorFallback';
import { Badge, smallButtonSx } from './redesign';

export const CurationListV30 = () => {
  const [client, clusterId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: collectionQueryKeys.curationSets(clusterId),
    queryFn: () => client.curationSets().retrieve(),
  });

  // Track editing by { setName, itemId } pair — items are scoped to a set in v30
  const [editingKey, setEditingKey] = useState<
    { setName: string; itemId: string } | '__new__'
  >('__new__');

  const editingEntry =
    editingKey === '__new__'
      ? null
      : (data
          .find((s) => s.name === editingKey.setName)
          ?.items.find((item) => item.id === editingKey.itemId) ?? null);

  const editingSetName =
    editingKey !== '__new__' ? editingKey.setName : undefined;

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
      {/* Left: one card per item (flattened across all sets) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {data.length === 0 ? (
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
          data.flatMap((curationSet) =>
            curationSet.items.map((item) => (
              <CurationItemCard
                key={`${curationSet.name}::${item.id}`}
                setName={curationSet.name}
                item={item}
                isSelected={
                  editingKey !== '__new__' &&
                  editingKey.setName === curationSet.name &&
                  editingKey.itemId === item.id
                }
                onEdit={() =>
                  setEditingKey({ setName: curationSet.name, itemId: item.id })
                }
              />
            )),
          )
        )}
      </Box>

      {/* Right: form panel */}
      <Box sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0 }}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => captureException(err)}
        >
          <Suspense>
            {editingKey === '__new__' || !editingEntry ? (
              <CurationFormCard
                key='__new__'
                isNew
                onSaved={(setName, itemId) =>
                  setEditingKey({ setName, itemId })
                }
              />
            ) : (
              <CurationFormCard
                key={`${editingSetName}::${editingEntry.id}`}
                setName={editingSetName!}
                item={editingEntry}
                onSaved={() => {}}
                onCancel={() => setEditingKey('__new__')}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────

interface CurationItemCardProps {
  setName: string;
  item: CurationObjectSchema;
  isSelected: boolean;
  onEdit: () => void;
}

function CurationItemCard({
  setName,
  item,
  isSelected,
  onEdit,
}: CurationItemCardProps) {
  const hasSchedule = item.effective_from_ts || item.effective_to_ts;
  const now = Math.floor(Date.now() / 1000);
  const isActive =
    (!item.effective_from_ts || item.effective_from_ts <= now) &&
    (!item.effective_to_ts || item.effective_to_ts >= now);

  const matchText = item.rule.query
    ? `${item.rule.match === 'contains' ? 'contains:' : ''}${item.rule.query}`
    : item.rule.filter_by
      ? item.rule.filter_by
      : (item.rule.tags?.join(', ') ?? '—');

  const scheduleText = (() => {
    if (!hasSchedule) return 'always';
    const fmt = (ts: number) =>
      new Date(ts * 1000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    const from = item.effective_from_ts ? fmt(item.effective_from_ts) : '';
    const to = item.effective_to_ts ? fmt(item.effective_to_ts) : '';
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
      {/* Header */}
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
        <AutoFixHighRounded sx={{ fontSize: 15, color: designTokens.accent }} />
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
          <Typography
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 13,
              fontWeight: 600,
              color: designTokens.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.id}
          </Typography>
          {/* Show set name when item ID differs from set name */}
          {item.id !== setName && (
            <Typography
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 11,
                color: designTokens.textFaint,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              set: {setName}
            </Typography>
          )}
        </Stack>
        {isActive ? (
          <Badge tone='success' size={10}>
            ● active
          </Badge>
        ) : (
          <Badge tone='neutral' size={10}>
            paused
          </Badge>
        )}
        <Button
          size='small'
          variant='outlined'
          onClick={onEdit}
          sx={{
            ...smallButtonSx,
            height: 28,
            fontSize: 12,
            px: 1.25,
            minWidth: 'auto',
          }}
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

      {/* Body: WHEN / THEN */}
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
          <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center' }}>
            <SettingsRounded
              sx={{ fontSize: 12, color: designTokens.textFaint }}
            />
            <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
              {scheduleText}
            </Typography>
          </Stack>
        </Box>

        {/* THEN */}
        <Box>
          <SectionLabel>Then</SectionLabel>
          {item.includes && item.includes.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography
                sx={{ fontSize: 11, color: designTokens.textFaint, mb: 0.5 }}
              >
                Pin to top:
              </Typography>
              <Stack
                direction='row'
                spacing={0.625}
                sx={{ flexWrap: 'wrap', gap: 0.625 }}
              >
                {item.includes.map((inc) => (
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
          {item.excludes && item.excludes.length > 0 && (
            <Box>
              <Typography
                sx={{ fontSize: 11, color: designTokens.textFaint, mb: 0.5 }}
              >
                Hide:
              </Typography>
              <Stack
                direction='row'
                spacing={0.625}
                sx={{ flexWrap: 'wrap', gap: 0.625 }}
              >
                {item.excludes.map((ex) => (
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
          {(!item.includes || item.includes.length === 0) &&
            (!item.excludes || item.excludes.length === 0) && (
              <Box>
                {item.filter_by && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: designTokens.textMuted,
                      fontFamily: designTokens.fontMono,
                    }}
                  >
                    filter: {item.filter_by}
                  </Typography>
                )}
                {item.sort_by && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: designTokens.textMuted,
                      fontFamily: designTokens.fontMono,
                    }}
                  >
                    sort: {item.sort_by}
                  </Typography>
                )}
                {item.replace_query && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: designTokens.textMuted,
                      fontFamily: designTokens.fontMono,
                    }}
                  >
                    replace: {item.replace_query}
                  </Typography>
                )}
                {!item.filter_by && !item.sort_by && !item.replace_query && (
                  <Typography
                    sx={{ fontSize: 11.5, color: designTokens.textFaint }}
                  >
                    —
                  </Typography>
                )}
              </Box>
            )}
        </Box>
      </Box>
    </Box>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
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

// ── Form panel ────────────────────────────────────────────────────────────────

interface CurationFormCardProps {
  isNew?: boolean;
  setName?: string; // undefined when isNew
  item?: CurationObjectSchema; // undefined when isNew
  onSaved: (setName: string, itemId: string) => void;
  onCancel?: () => void;
}

function CurationFormCard({
  isNew,
  setName,
  item,
  onSaved,
  onCancel,
}: CurationFormCardProps) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const mutation = useMutation({
    mutationFn: async ({
      resolvedSetName,
      resolvedItemId,
      params,
      creating,
    }: {
      resolvedSetName: string;
      resolvedItemId: string;
      params: Omit<CurationObjectSchema, 'id'>;
      creating: boolean;
    }) => {
      if (creating) {
        // Ensure set container exists before adding the item
        await client.curationSets(resolvedSetName).upsert({ items: [] });
      }
      return client
        .curationSets(resolvedSetName)
        .items(resolvedItemId)
        .upsert({ id: resolvedItemId, ...params } as CurationObjectSchema);
    },
    onMutate: (vars) => {
      toast.loading(`saving curation [${vars.resolvedItemId}]`, {
        id: 'save-curation',
      });
    },
    onSuccess: (data) => {
      toast.success(`curation saved [${data.id}]`, { id: 'save-curation' });
    },
    onError: (err, vars) => {
      const msg =
        err.message || `error saving curation [${vars.resolvedItemId}]`;
      toast.error(msg, { id: 'save-curation' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.curationSets(clusterId),
      });
    },
  });

  // Populate form from existing item when editing
  const defaultValues = item
    ? {
        overrideId: item.id,
        rule_query_bool: Boolean(item.rule.query),
        rule_filter_bool: Boolean(item.rule.filter_by),
        rule_tags_bool: Boolean(item.rule.tags),
        rule: {
          query: item.rule.query || '',
          match: (item.rule.match as 'exact' | 'contains') || 'exact',
          filter_by: item.rule.filter_by || '',
          tags: item.rule.tags ? item.rule.tags.join(', ') : '',
        },
        filter_by_bool: Boolean(item.filter_by),
        filter_by: item.filter_by || '',
        sort_by_bool: Boolean(item.sort_by),
        sort_by: item.sort_by || '',
        filter_curated_hits: Boolean(item.filter_curated_hits),
        replace_query_bool: Boolean(item.replace_query),
        replace_query: item.replace_query || '',
        remove_match_tokens: Boolean(item.remove_matched_tokens),
        custom_metadata_bool: Boolean(item.metadata),
        metadata: item.metadata ? JSON.stringify(item.metadata) : '',
        stop_processing: Boolean(item.stop_processing),
        effective_from_ts_bool: Boolean(item.effective_from_ts),
        effective_from_ts: item.effective_from_ts
          ? new Date(item.effective_from_ts * 1000)
          : new Date(),
        effective_to_ts_bool: Boolean(item.effective_to_ts),
        effective_to_ts: item.effective_to_ts
          ? new Date(item.effective_to_ts * 1000)
          : new Date(),
      }
    : defaultOverrideValues;

  const form = useAppForm({
    ...overrideFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      // For new entries, overrideId is the set name; item ID matches set name.
      // For edits, setName and item.id are fixed from props.
      const resolvedSetName = isNew ? value.overrideId : setName!;
      const resolvedItemId = isNew ? value.overrideId : item!.id;

      const params: Omit<CurationObjectSchema, 'id'> = {
        rule: {
          query: value.rule_query_bool ? value.rule.query : undefined,
          match: value.rule_query_bool ? value.rule.match : undefined,
          filter_by: value.rule_filter_bool ? value.rule.filter_by : undefined,
          tags: value.rule_tags_bool
            ? value.rule.tags.split(',').map((t: string) => t.trim())
            : undefined,
        } as CurationRuleSchema,
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
          resolvedSetName,
          resolvedItemId,
          params,
          creating: Boolean(isNew),
        });
        if (isNew) {
          form.reset();
          onSaved(resolvedSetName, result.id);
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
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: designTokens.text,
            letterSpacing: '-0.005em',
          }}
        >
          {isNew ? 'New curation' : `Edit: ${item?.id}`}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          lineHeight: 1.5,
          mb: 1.5,
        }}
      >
        Pin, hide, or re-rank specific documents when a query matches a rule.
      </Typography>

      <CurationForm
        form={form}
        submitButtonText={isNew ? 'Save curation' : 'Update'}
      />

      {!isNew && onCancel && (
        <Button
          type='button'
          variant='text'
          size='small'
          onClick={onCancel}
          sx={{
            mt: 1,
            fontSize: 12,
            color: designTokens.textMuted,
            textTransform: 'none',
          }}
        >
          Cancel editing
        </Button>
      )}
    </Box>
  );
}
