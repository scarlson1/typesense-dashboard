import {
  Badge,
  MOBILE_BOTTOM_NAV_HEIGHT,
  PageHeader,
  primaryButtonSx,
  smallButtonSx,
} from '@/components/redesign';
import { collectionQueryKeys } from '@/constants';
import {
  useConversationModels,
  useTypesenseClient,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import {
  AddRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
  ChatBubbleOutlineRounded,
  ContentCopyRounded,
  FormatQuoteRounded,
  KeyboardArrowDownRounded,
  RefreshRounded,
  SendRounded,
  SettingsRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type {
  DocumentSchema,
  SearchResponse,
} from 'typesense/lib/Typesense/Documents';

export const Route = createFileRoute('/_dashboard/conversational-search')({
  component: RouteComponent,
  staticData: { crumb: 'Conversational search' },
});

const COLUMN = 760;

interface Source {
  id: string;
  title: string;
  snippet: string;
  field: string;
  distance?: number;
}

interface Turn {
  key: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'pending' | 'done' | 'error';
  sources?: Source[];
  error?: string;
}

const TITLE_FIELDS = ['name', 'title', 'heading', 'label'];
const SNIPPET_FIELDS = ['description', 'summary', 'overview', 'text', 'content'];

function pick(doc: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = doc[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return undefined;
}

function hitToSource(hit: {
  document: Record<string, unknown>;
  vector_distance?: number;
}): Source {
  const doc = hit.document;
  const title =
    pick(doc, TITLE_FIELDS) ?? String(doc.id ?? '(document)');
  const snippet =
    pick(doc, SNIPPET_FIELDS) ??
    Object.entries(doc)
      .filter(([, v]) => typeof v === 'string')
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 1)
      .join(' ') ??
    '';
  const matchedTitle = TITLE_FIELDS.find((k) => doc[k]);
  const matchedSnippet = SNIPPET_FIELDS.find((k) => doc[k]);
  const field = [matchedTitle, matchedSnippet].filter(Boolean).join(' + ');
  return {
    id: String(doc.id ?? title),
    title,
    snippet,
    field: field || 'document',
    distance: hit.vector_distance,
  };
}

function RouteComponent() {
  const [client, clusterId] = useTypesenseClient();
  const navigate = useNavigate();

  const { data: convModels } = useConversationModels();
  const { data: collections } = useQuery({
    queryKey: collectionQueryKeys.all(clusterId),
    queryFn: () => client.collections().retrieve(),
  });

  const [modelId, setModelId] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');

  // Default the scope selectors once data arrives.
  useEffect(() => {
    if (!modelId && convModels?.length) setModelId(convModels[0].id);
  }, [convModels, modelId]);
  useEffect(() => {
    if (!collectionName && collections?.length)
      setCollectionName(collections[0].name);
  }, [collections, collectionName]);

  const selectedCollection = useMemo(
    () => collections?.find((c) => c.name === collectionName),
    [collections, collectionName],
  );
  const embeddingField = useMemo(
    () =>
      selectedCollection?.fields?.find(
        (f) =>
          f.type === 'float[]' &&
          ((f as { embed?: unknown }).embed != null || f.num_dim != null),
      )?.name,
    [selectedCollection],
  );
  const selectedModel = useMemo(
    () => convModels?.find((m) => m.id === modelId),
    [convModels, modelId],
  );

  const historyOk =
    !selectedModel?.history_collection ||
    Boolean(
      collections?.some((c) => c.name === selectedModel.history_collection),
    );

  const noModel = convModels != null && convModels.length === 0;
  const needsSetup = !noModel && (!embeddingField || !historyOk);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [turns]);

  const mutation = useMutation({
    mutationFn: async (vars: { q: string; asstKey: string }) => {
      const res = (await client
        .collections(collectionName)
        .documents()
        .search({
          q: vars.q,
          query_by: embeddingField as string,
          conversation: true,
          conversation_model_id: modelId,
          exclude_fields: embeddingField as string,
          per_page: 5,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        } as Record<string, unknown>)) as SearchResponse<DocumentSchema>;
      return res;
    },
    onSuccess: (res, vars) => {
      const answer = res.conversation?.answer ?? '(no answer returned)';
      const sources = (res.hits ?? []).map((h) =>
        hitToSource(h as unknown as { document: Record<string, unknown>; vector_distance?: number }),
      );
      if (res.conversation?.conversation_id)
        setConversationId(res.conversation.conversation_id);
      setTurns((prev) =>
        prev.map((t) =>
          t.key === vars.asstKey
            ? { ...t, content: answer, sources, status: 'done' }
            : t,
        ),
      );
    },
    onError: (err: Error, vars) => {
      setTurns((prev) =>
        prev.map((t) =>
          t.key === vars.asstKey
            ? { ...t, status: 'error', error: err.message }
            : t,
        ),
      );
    },
  });

  const canSend =
    Boolean(input.trim()) &&
    Boolean(embeddingField) &&
    Boolean(modelId) &&
    !mutation.isPending &&
    !needsSetup;

  const handleSend = () => {
    const q = input.trim();
    if (!q || !canSend) return;
    const asstKey = `a-${Date.now()}`;
    setTurns((prev) => [
      ...prev,
      { key: `u-${Date.now()}`, role: 'user', content: q },
      { key: asstKey, role: 'assistant', content: '', status: 'pending' },
    ]);
    setInput('');
    mutation.mutate({ q, asstKey });
  };

  const handleNewConversation = () => {
    setTurns([]);
    setConversationId(undefined);
    setInput('');
  };

  return (
    <Stack
      sx={{
        minWidth: 0,
        height: {
          xs: `calc(100dvh - ${MOBILE_BOTTOM_NAV_HEIGHT}px - env(safe-area-inset-bottom))`,
          md: 'calc(100dvh - 48px)',
        },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <PageHeader
          title='Conversational search'
          badges={
            <>
              <Badge tone='indigo'>RAG</Badge>
              {convModels?.length ? (
                <Badge tone='success'>
                  {convModels.length} model{convModels.length === 1 ? '' : 's'}
                </Badge>
              ) : null}
            </>
          }
          actions={
            <Button
              variant='contained'
              size='small'
              startIcon={<AddRounded sx={{ fontSize: 14 }} />}
              onClick={handleNewConversation}
              disabled={turns.length === 0}
              sx={{ ...primaryButtonSx, color: designTokens.onAccent }}
            >
              New conversation
            </Button>
          }
        />
      </Box>

      {/* scope bar */}
      <Stack
        direction='row'
        sx={{
          flexShrink: 0,
          alignItems: 'center',
          gap: 1.25,
          px: { xs: 2.5, md: 3.5 },
          py: 1.25,
          background: 'background.paper',
          borderBottom: `1px solid ${designTokens.border}`,
          flexWrap: 'wrap',
        }}
      >
        <ScopeSelect
          icon={<AutoAwesomeRounded sx={{ fontSize: 13 }} />}
          label='Model'
          value={modelId}
          options={(convModels ?? []).map((m) => m.id)}
          onChange={setModelId}
          placeholder='none'
        />
        <ScopeSelect
          icon={<ChatBubbleOutlineRounded sx={{ fontSize: 13 }} />}
          label='Retrieve from'
          value={collectionName}
          options={(collections ?? []).map((c) => c.name)}
          onChange={(v) => {
            setCollectionName(v);
            handleNewConversation();
          }}
        />
        <Box sx={{ flex: 1 }} />
        {turns.length > 0 ? (
          <Badge tone='neutral'>
            {turns.filter((t) => t.role === 'user').length} turns
          </Badge>
        ) : null}
      </Stack>

      {/* thread / states */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: designTokens.surfaceTinted,
        }}
      >
        {noModel ? (
          <NoModelState onCreate={() => navigate({ to: '/conversation-models' })} />
        ) : needsSetup ? (
          <SetupRequiredState
            modelReady={Boolean(selectedModel)}
            historyOk={historyOk}
            historyCollection={selectedModel?.history_collection}
            hasEmbedding={Boolean(embeddingField)}
            collectionName={collectionName}
            onConfigureEmbedding={() =>
              navigate({
                to: '/collections/$collectionId/config' as never,
                params: { collectionId: collectionName } as never,
              })
            }
          />
        ) : turns.length === 0 ? (
          <EmptyState
            model={modelId}
            collection={collectionName}
            onPick={(q) => setInput(q)}
          />
        ) : (
          <Box sx={{ maxWidth: COLUMN, mx: 'auto', px: { xs: 2.5, md: 3.5 }, py: 2 }}>
            {turns.map((t) =>
              t.role === 'user' ? (
                <UserTurn key={t.key}>{t.content}</UserTurn>
              ) : (
                <AssistantTurn
                  key={t.key}
                  turn={t}
                  model={modelId}
                  collection={collectionName}
                  onRetry={handleSend}
                />
              ),
            )}
          </Box>
        )}
      </Box>

      {/* composer */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${designTokens.border}`,
          background: 'background.paper',
          px: { xs: 2.5, md: 3.5 },
          py: 1.75,
        }}
      >
        <Box sx={{ maxWidth: COLUMN, mx: 'auto' }}>
          <Stack
            direction='row'
            sx={{
              alignItems: 'flex-end',
              gap: 1,
              border: `1px solid ${input && !needsSetup ? designTokens.accent : designTokens.borderStrong}`,
              borderRadius: '12px',
              background:
                noModel || needsSetup
                  ? designTokens.surfaceMuted
                  : designTokens.surface,
              boxShadow:
                input && !needsSetup
                  ? `0 0 0 3px ${designTokens.accentSoft}`
                  : designTokens.shadowSheet,
              px: 1.5,
              py: 1,
              opacity: noModel || needsSetup ? 0.7 : 1,
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={6}
              variant='standard'
              placeholder={
                noModel
                  ? 'Configure a conversation model to begin…'
                  : needsSetup
                    ? 'Finish setup to start a conversation…'
                    : `Ask a question about ${collectionName}…`
              }
              value={input}
              disabled={noModel || needsSetup}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              slotProps={{ input: { disableUnderline: true } }}
              sx={{ '& textarea': { fontSize: 13.5, lineHeight: 1.5 } }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!canSend}
              sx={{
                width: 34,
                height: 30,
                borderRadius: '7px',
                flexShrink: 0,
                background: canSend ? designTokens.accent : designTokens.borderStrong,
                color: '#fff',
                '&:hover': { background: designTokens.accentHover },
                '&.Mui-disabled': { color: '#fff', opacity: 0.8 },
              }}
            >
              <SendRounded sx={{ fontSize: 15 }} />
            </IconButton>
          </Stack>
          <Typography
            sx={{ fontSize: 11, color: designTokens.textSubtle, mt: 0.75, px: 0.5 }}
          >
            Answers cite retrieved documents ·{' '}
            <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
              {modelId || 'no model'}
            </Box>{' '}
            · Enter to send, Shift+Enter for newline
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
}

// ── scope selector pill ────────────────────────────────────────────────────
function ScopeSelect({
  icon,
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Stack
      direction='row'
      sx={{
        alignItems: 'center',
        gap: 1,
        height: 32,
        px: 1.25,
        border: `1px solid ${designTokens.border}`,
        borderRadius: '7px',
        background: designTokens.surface,
        boxShadow: designTokens.shadowButton,
        maxWidth: 280,
      }}
    >
      <Box sx={{ color: designTokens.textFaint, display: 'flex' }}>{icon}</Box>
      <Typography
        sx={{ fontSize: 11.5, color: designTokens.textFaint, fontWeight: 500 }}
      >
        {label}
      </Typography>
      {options.length ? (
        <TextField
          select
          variant='standard'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          slotProps={{ input: { disableUnderline: true } }}
          sx={{
            '& .MuiSelect-select': {
              fontFamily: designTokens.fontMono,
              fontSize: 12.5,
              color: designTokens.text,
              fontWeight: 500,
              py: 0,
              pr: '20px !important',
            },
          }}
        >
          {options.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <Typography
          sx={{
            fontSize: 12.5,
            fontFamily: designTokens.fontMono,
            color: designTokens.textFaint,
          }}
        >
          {placeholder ?? '—'}
        </Typography>
      )}
    </Stack>
  );
}

// ── user / assistant turns ──────────────────────────────────────────────────
function UserTurn({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 2.25 }}>
      <Box
        sx={{
          maxWidth: '76%',
          background: designTokens.accentSoft,
          color: designTokens.text,
          border: `1px solid ${designTokens.accentBorder}`,
          borderRadius: '12px',
          borderTopRightRadius: '4px',
          px: 1.75,
          py: 1.25,
          fontSize: 13.5,
          lineHeight: 1.55,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function AssistantTurn({
  turn,
  model,
  collection,
  onRetry,
}: {
  turn: Turn;
  model: string;
  collection: string;
  onRetry: () => void;
}) {
  return (
    <Stack direction='row' sx={{ gap: 1.5, mb: 1 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '7px',
          flexShrink: 0,
          mt: '1px',
          background: turn.status === 'error' ? designTokens.dangerSoft : designTokens.accentSoft,
          border: `1px solid ${turn.status === 'error' ? designTokens.danger : designTokens.accentBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {turn.status === 'error' ? (
          <WarningAmberRounded sx={{ fontSize: 15, color: designTokens.danger }} />
        ) : (
          <AutoAwesomeRounded sx={{ fontSize: 15, color: designTokens.accent }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction='row' sx={{ alignItems: 'center', gap: 1, mb: 0.875, height: 28 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: designTokens.text }}>
            Assistant
          </Typography>
          {turn.status === 'pending' ? (
            <Box
              component='span'
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontSize: 11,
                color: designTokens.accent,
                background: designTokens.accentSoft,
                border: `1px solid ${designTokens.accentBorder}`,
                borderRadius: '12px',
                px: 1,
                py: '2px',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: designTokens.accent,
                }}
              />
              Retrieving &amp; generating…
            </Box>
          ) : (
            <Typography sx={{ fontSize: 11, color: designTokens.textFaint, fontFamily: designTokens.fontMono }}>
              {model}
            </Typography>
          )}
        </Stack>

        {turn.status === 'error' ? (
          <Box
            sx={{
              background: 'background.paper',
              border: `1px solid ${designTokens.danger}`,
              borderRadius: '8px',
              p: 1.75,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: designTokens.danger }}>
              Couldn&apos;t generate an answer
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: designTokens.textMuted, lineHeight: 1.55, mt: 0.625 }}>
              {turn.error || 'The model request failed.'}
            </Typography>
            <Button
              size='small'
              variant='outlined'
              startIcon={<RefreshRounded sx={{ fontSize: 13 }} />}
              onClick={onRetry}
              sx={{ ...smallButtonSx, mt: 1.5 }}
            >
              Retry
            </Button>
          </Box>
        ) : turn.status === 'pending' ? null : (
          <>
            <Typography sx={{ fontSize: 13.5, lineHeight: 1.62, color: designTokens.text, whiteSpace: 'pre-wrap' }}>
              {turn.content}
            </Typography>
            {turn.sources?.length ? (
              <Sources sources={turn.sources} collection={collection} />
            ) : null}
            <Stack direction='row' sx={{ alignItems: 'center', gap: 0.5, mt: 1.5 }}>
              <Tooltip title='Copy answer'>
                <IconButton
                  size='small'
                  onClick={() => navigator.clipboard?.writeText(turn.content)}
                  sx={{ color: designTokens.textFaint }}
                >
                  <ContentCopyRounded sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </>
        )}
      </Box>
    </Stack>
  );
}

// ── sources strip ───────────────────────────────────────────────────────────
function Sources({
  sources,
  collection,
}: {
  sources: Source[];
  collection: string;
}) {
  return (
    <Box
      sx={{
        mt: 1.75,
        background: designTokens.surfaceTinted,
        border: `1px solid ${designTokens.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${designTokens.border}`,
        }}
      >
        <FormatQuoteRounded sx={{ fontSize: 13, color: designTokens.textFaint }} />
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            color: designTokens.textFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Sources
        </Typography>
        <Typography sx={{ fontSize: 11, color: designTokens.textSubtle }}>
          · grounded in {sources.length} document{sources.length === 1 ? '' : 's'}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 11, color: designTokens.textFaint, fontFamily: designTokens.fontMono }}>
          {collection}
        </Typography>
      </Stack>
      <Box
        sx={{
          p: 1.25,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 1.25,
        }}
      >
        {sources.map((s, i) => (
          <SourceCard key={s.id} n={i + 1} source={s} />
        ))}
      </Box>
    </Box>
  );
}

function SourceCard({ n, source }: { n: number; source: Source }) {
  return (
    <Stack
      sx={{
        background: 'background.paper',
        border: `1px solid ${designTokens.border}`,
        borderRadius: '8px',
        p: 1.25,
        gap: 0.75,
        minWidth: 0,
        boxShadow: designTokens.shadowButton,
      }}
    >
      <Stack direction='row' sx={{ alignItems: 'center', gap: 0.875 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '4px',
            background: designTokens.accentSoft,
            color: designTokens.accent,
            border: `1px solid ${designTokens.accentBorder}`,
            fontFamily: designTokens.fontMono,
            fontSize: 9.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {n}
        </Box>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: designTokens.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {source.title}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: 11.5,
          color: designTokens.textMuted,
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {source.snippet}
      </Typography>
      <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 9.5, fontFamily: designTokens.fontMono, color: designTokens.textSubtle }}>
          {source.field}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {source.distance != null ? (
          <Box
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 10,
              color: designTokens.textFaint,
              background: designTokens.surfaceMuted,
              border: `1px solid ${designTokens.border}`,
              borderRadius: '4px',
              px: 0.625,
              py: '1px',
            }}
          >
            {source.distance.toFixed(3)}
          </Box>
        ) : null}
      </Stack>
    </Stack>
  );
}

// ── states ──────────────────────────────────────────────────────────────────
function EmptyState({
  model,
  collection,
  onPick,
}: {
  model: string;
  collection: string;
  onPick: (q: string) => void;
}) {
  const examples = [
    `What are the highest-rated items in ${collection}?`,
    'Summarize the most common themes across these documents.',
    'Which entries best match someone looking for value?',
  ];
  return (
    <Box sx={{ maxWidth: 620, mx: 'auto', px: 3.5, pt: 8, pb: 4, textAlign: 'center' }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          mx: 'auto',
          mb: 2.25,
          background: designTokens.accentSoft,
          border: `1px solid ${designTokens.accentBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AutoAwesomeRounded sx={{ fontSize: 24, color: designTokens.accent }} />
      </Box>
      <Typography sx={{ fontSize: 21, fontWeight: 600, letterSpacing: '-0.025em', color: designTokens.text }}>
        Ask anything about your documents
      </Typography>
      <Typography sx={{ fontSize: 13.5, lineHeight: 1.6, color: designTokens.textMuted, mt: 1.25, maxWidth: 480, mx: 'auto' }}>
        Answers are generated by{' '}
        <Box component='span' sx={{ fontFamily: designTokens.fontMono, color: designTokens.text }}>
          {model}
        </Box>{' '}
        and grounded in documents retrieved from{' '}
        <Box component='span' sx={{ fontFamily: designTokens.fontMono, color: designTokens.text }}>
          {collection}
        </Box>
        . Every answer cites its sources.
      </Typography>
      <Stack sx={{ gap: 1, mt: 3, textAlign: 'left' }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            color: designTokens.textFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Try asking
        </Typography>
        {examples.map((q) => (
          <Stack
            key={q}
            direction='row'
            onClick={() => onPick(q)}
            sx={{
              alignItems: 'center',
              gap: 1.25,
              background: 'background.paper',
              border: `1px solid ${designTokens.border}`,
              borderRadius: '8px',
              px: 1.75,
              py: 1.5,
              cursor: 'pointer',
              boxShadow: designTokens.shadowButton,
              '&:hover': { borderColor: designTokens.borderStrong },
            }}
          >
            <ChatBubbleOutlineRounded sx={{ fontSize: 14, color: designTokens.textFaint }} />
            <Typography sx={{ flex: 1, fontSize: 13, color: designTokens.text }}>
              {q}
            </Typography>
            <ArrowForwardRounded sx={{ fontSize: 14, color: designTokens.textFaint }} />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function NoModelState({ onCreate }: { onCreate: () => void }) {
  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', px: 3.5, py: 9.5, textAlign: 'center' }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          mx: 'auto',
          mb: 2.25,
          background: designTokens.surfaceMuted,
          border: `1px solid ${designTokens.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AutoAwesomeRounded sx={{ fontSize: 22, color: designTokens.textFaint }} />
      </Box>
      <Typography sx={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em', color: designTokens.text }}>
        No conversation model configured
      </Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: designTokens.textMuted, mt: 1.25, mb: 2.75, maxWidth: 380, mx: 'auto' }}>
        Conversational search needs an LLM you configure as a conversation model —
        set the provider, API key, and system prompt once, then reuse it across
        collections.
      </Typography>
      <Button
        variant='contained'
        startIcon={<AddRounded sx={{ fontSize: 16 }} />}
        onClick={onCreate}
        sx={{ ...primaryButtonSx, color: designTokens.onAccent }}
      >
        Create a conversation model
      </Button>
    </Box>
  );
}

function SetupRow({
  done,
  label,
  value,
}: {
  done: boolean;
  label: string;
  value: string;
}) {
  return (
    <Stack direction='row' sx={{ alignItems: 'center', gap: 1.25, py: 1.125 }}>
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '5px',
          flexShrink: 0,
          background: done ? designTokens.successSoft : 'background.paper',
          border: `1px solid ${done ? designTokens.successBorder : designTokens.borderStrong}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? (
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: designTokens.success }} />
        ) : (
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: designTokens.warning }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: designTokens.text }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: designTokens.textFaint, fontFamily: designTokens.fontMono }}>
          {value}
        </Typography>
      </Box>
      <Badge tone={done ? 'success' : 'warn'}>{done ? 'ready' : 'missing'}</Badge>
    </Stack>
  );
}

function SetupRequiredState({
  modelReady,
  historyOk,
  historyCollection,
  hasEmbedding,
  collectionName,
  onConfigureEmbedding,
}: {
  modelReady: boolean;
  historyOk: boolean;
  historyCollection?: string;
  hasEmbedding: boolean;
  collectionName: string;
  onConfigureEmbedding: () => void;
}) {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', px: 3.5, py: 5 }}>
      <Box
        sx={{
          background: designTokens.warningSoft,
          border: `1px solid ${designTokens.warningBorder}`,
          borderRadius: '10px',
          p: 2.5,
          display: 'flex',
          gap: 1.75,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            flexShrink: 0,
            background: 'background.paper',
            border: `1px solid ${designTokens.warningBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningAmberRounded sx={{ fontSize: 18, color: designTokens.warning }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: designTokens.warningDeep }}>
            Setup required
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: designTokens.textMuted, lineHeight: 1.55, mt: 0.5 }}>
            Conversational search needs a conversation-history collection and an
            embedding-enabled field on the collection you retrieve from.
          </Typography>
          <Box
            sx={{
              background: 'background.paper',
              border: `1px solid ${designTokens.border}`,
              borderRadius: '8px',
              px: 1.75,
              my: 1.75,
            }}
          >
            <SetupRow done={modelReady} label='Conversation model' value={modelReady ? 'selected' : 'none selected'} />
            <Box sx={{ height: 1, background: designTokens.border }} />
            <SetupRow
              done={historyOk}
              label='Conversation-history collection'
              value={
                historyCollection
                  ? `${historyCollection}${historyOk ? '' : ' — not found'}`
                  : 'managed by model'
              }
            />
            <Box sx={{ height: 1, background: designTokens.border }} />
            <SetupRow
              done={hasEmbedding}
              label={`Embedding field on ${collectionName}`}
              value={hasEmbedding ? 'configured' : 'float[] embedding — not configured'}
            />
          </Box>
          {!hasEmbedding ? (
            <Button
              size='small'
              variant='contained'
              startIcon={<SettingsRounded sx={{ fontSize: 13 }} />}
              onClick={onConfigureEmbedding}
              sx={{ ...primaryButtonSx, color: designTokens.onAccent }}
            >
              Configure embeddings
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
