import { primaryButtonSx, SectionCard, smallButtonSx } from '@/components/redesign';
import { analyticsEventType, analyticsQueryKeys } from '@/constants';
import {
  useCreateAnalyticsEvent,
  useRecentAnalyticsEvents,
  useTypesenseClient,
  type RecentEventsParams,
} from '@/hooks';
import { useTypesenseVersion } from '@/hooks/useTypesenseVersion';
import { designTokens } from '@/theme/themePrimitives';
import { SendRounded } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import type { AnalyticsRuleSchema } from 'typesense/lib/Typesense/AnalyticsRule';
import type { AnalyticsRuleSchemaV1 } from 'typesense/lib/Typesense/AnalyticsRuleV1';

interface AnalyticsEventOption {
  name: string;
  type: string;
}

// v30: events are posted under the rule's name. v29: counter rules define
// named events (params.source.events[].name) which is what POST expects;
// query-suggestion rules accept 'search' events under the rule name.
const deriveEventOptions = (
  rules: (AnalyticsRuleSchema | AnalyticsRuleSchemaV1)[],
  is30Plus: boolean,
): AnalyticsEventOption[] => {
  if (is30Plus) {
    return (rules as AnalyticsRuleSchema[]).map((r) => ({
      name: r.name,
      type: r.event_type || 'click',
    }));
  }
  return (rules as AnalyticsRuleSchemaV1[]).flatMap((r) => {
    if (r.type === 'counter') {
      return (r.params?.source?.events ?? []).map((e) => ({
        name: e.name,
        type: e.type || 'click',
      }));
    }
    return [{ name: r.name, type: 'search' }];
  });
};

export const AnalyticsEventsPanel = () => {
  const [client, clusterId] = useTypesenseClient();
  const { is30Plus } = useTypesenseVersion();

  // Same key (and equivalent fetch) as AnalyticsInsight on this page, so the
  // rules request is deduped by the query cache.
  const { data: rules } = useSuspenseQuery({
    queryKey: [...analyticsQueryKeys.rules(clusterId), is30Plus],
    queryFn: async () => {
      if (!is30Plus) {
        const res = await client.analyticsV1.rules().retrieve();
        return (res?.rules ?? []) as AnalyticsRuleSchemaV1[];
      }
      const res = (await client.analytics.rules().retrieve()) as unknown as
        | AnalyticsRuleSchema[]
        | { rules: AnalyticsRuleSchema[] };
      return Array.isArray(res) ? res : (res?.rules ?? []);
    },
  });

  const options = useMemo(
    () => deriveEventOptions(rules, is30Plus),
    [rules, is30Plus],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
        alignItems: 'start',
      }}
    >
      <SendAnalyticsEventCard options={options} />
      <RecentAnalyticsEventsCard options={options} />
    </Box>
  );
};

function SendAnalyticsEventCard({
  options,
}: {
  options: AnalyticsEventOption[];
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('click');
  const [userId, setUserId] = useState('');
  const [docId, setDocId] = useState('');
  const [query, setQuery] = useState('');

  const mutation = useCreateAnalyticsEvent();

  const handleNameChange = useCallback(
    (next: string) => {
      setName(next);
      const match = options.find((o) => o.name === next);
      if (match) setType(match.type);
    },
    [options],
  );

  const handleSend = useCallback(() => {
    const data: Record<string, unknown> = { user_id: userId.trim() };
    if (docId.trim()) data.doc_id = docId.trim();
    if (query.trim()) data.q = query.trim();
    mutation.mutate({ name: name.trim(), type, data });
  }, [mutation, name, type, userId, docId, query]);

  const disabled = !name.trim() || !userId.trim();

  return (
    <SectionCard
      title='Send a test event'
      description='Validate a rule end-to-end by posting an analytics event as your application would.'
      footer={
        <Stack direction='row' sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            size='small'
            startIcon={<SendRounded sx={{ fontSize: 14 }} />}
            sx={primaryButtonSx}
            onClick={handleSend}
            disabled={disabled}
            loading={mutation.isPending}
          >
            Send event
          </Button>
        </Stack>
      }
    >
      <Autocomplete
        freeSolo
        size='small'
        options={options.map((o) => o.name)}
        inputValue={name}
        onInputChange={(_e, value) => handleNameChange(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Event name'
            placeholder='e.g. products_click_event'
            helperText='v30: the rule name · v29 counter rules: the rule’s named event'
          />
        )}
      />
      <TextField
        select
        size='small'
        label='Event type'
        value={type}
        onChange={(e) => setType(e.target.value)}
        fullWidth
      >
        {analyticsEventType.options.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size='small'
        label='User ID'
        required
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        fullWidth
      />
      <Stack direction='row' sx={{ gap: 1.5 }}>
        <TextField
          size='small'
          label='Document ID'
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          size='small'
          label='Query (q)'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
      </Stack>
    </SectionCard>
  );
}

function RecentAnalyticsEventsCard({
  options,
}: {
  options: AnalyticsEventOption[];
}) {
  const { is30Plus } = useTypesenseVersion();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [n, setN] = useState('10');
  const [params, setParams] = useState<RecentEventsParams | null>(null);

  const { data, isFetching, isError, error } = useRecentAnalyticsEvents(params);

  const handleFetch = useCallback(() => {
    const parsedN = Number.parseInt(n, 10);
    setParams({
      userId: userId.trim(),
      name: name.trim(),
      n: Number.isFinite(parsedN) && parsedN > 0 ? parsedN : 10,
    });
  }, [userId, name, n]);

  const events = data?.events ?? [];

  return (
    <SectionCard
      title='Recent events'
      description='Look up the latest events recorded for a user and event name.'
      footer={
        <Stack direction='row' sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant='outlined'
            size='small'
            sx={smallButtonSx}
            onClick={handleFetch}
            disabled={!userId.trim() || !name.trim()}
            loading={isFetching}
          >
            Fetch events
          </Button>
        </Stack>
      }
    >
      <Stack direction='row' sx={{ gap: 1.5 }}>
        <TextField
          size='small'
          label='User ID'
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          size='small'
          label='N'
          type='number'
          value={n}
          onChange={(e) => setN(e.target.value)}
          sx={{ width: 72 }}
          slotProps={{ htmlInput: { min: 1, max: 1000 } }}
        />
      </Stack>
      <Autocomplete
        freeSolo
        size='small'
        options={options.map((o) => o.name)}
        inputValue={name}
        onInputChange={(_e, value) => setName(value)}
        renderInput={(params) => (
          <TextField {...params} label='Event name' />
        )}
      />

      {isError ? (
        <Alert severity='error'>
          {(error as Error)?.message || 'failed to fetch events'}
        </Alert>
      ) : null}

      {params && !isError ? (
        isFetching && !data ? (
          <Stack spacing={1}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant='rectangular' height={18} />
            ))}
          </Stack>
        ) : events.length === 0 ? (
          <Typography sx={{ fontSize: 12.5, color: designTokens.textMuted }}>
            No events found for this user and event name.
            {!is30Plus
              ? ' Listing recent events requires Typesense v30+.'
              : ''}
          </Typography>
        ) : (
          <Stack sx={{ gap: 0.75 }}>
            {events.map((e, i) => (
              <Stack
                key={`${e.timestamp}-${i}`}
                data-testid='analytics-event-row'
                direction='row'
                sx={{
                  gap: 1,
                  alignItems: 'baseline',
                  px: 1.25,
                  py: 0.75,
                  background: designTokens.surfaceTinted,
                  borderRadius: '6px',
                  fontFamily: designTokens.fontMono,
                  fontSize: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Box component='span' sx={{ color: designTokens.textFaint }}>
                  {/* Timestamps are reported in microseconds. */}
                  {format(
                    new Date(Math.floor(e.timestamp / 1000)),
                    'MMM d HH:mm:ss',
                  )}
                </Box>
                <Box
                  component='span'
                  sx={{ color: designTokens.accentDeep, fontWeight: 600 }}
                >
                  {e.event_type}
                </Box>
                <Box component='span' sx={{ color: designTokens.text }}>
                  {e.doc_id ?? e.doc_ids?.join(',') ?? ''}
                </Box>
                {e.query ? (
                  <Box component='span' sx={{ color: designTokens.textMuted }}>
                    q: {e.query}
                  </Box>
                ) : null}
                <Box
                  component='span'
                  sx={{ color: designTokens.textFaint, ml: 'auto' }}
                >
                  {e.collection}
                </Box>
              </Stack>
            ))}
          </Stack>
        )
      ) : null}
    </SectionCard>
  );
}
