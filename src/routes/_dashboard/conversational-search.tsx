import {
  Badge,
  MOBILE_BOTTOM_NAV_HEIGHT,
  PageHeader,
  primaryButtonSx,
  smallButtonSx,
} from '@/components/redesign';
import {
  collectionQueryKeys,
  isConversationHistoryCollection,
} from '@/constants';
import {
  useConversationModels,
  useCreateHistoryCollection,
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
  RefreshRounded,
  SendRounded,
  SettingsRounded,
  StopRounded,
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
  useMediaQuery,
  type Theme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
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
  status?: 'pending' | 'streaming' | 'done' | 'error';
  sources?: Source[];
  error?: string;
  /** The user question this assistant turn answers (for Retry). */
  question?: string;
}

const TITLE_FIELDS = ['name', 'title', 'heading', 'label'];
const SNIPPET_FIELDS = [
  'description',
  'summary',
  'overview',
  'text',
  'content',
];

function pick(
  doc: Record<string, unknown>,
  keys: string[],
): string | undefined {
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
  const title = pick(doc, TITLE_FIELDS) ?? String(doc.id ?? '(document)');
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

// On mobile the on-screen keyboard overlays the layout viewport without
// shrinking `100dvh`, so a bottom-pinned composer ends up hidden behind it.
// `visualViewport` reports the actually-visible area; the overlap between it
// and the layout viewport is the keyboard height we shrink the surface by so
// the composer rides the top of the keyboard.
function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      // Ignore small deltas (browser chrome) — only treat a real keyboard.
      setInset(overlap > 80 ? Math.round(overlap) : 0);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);
  return inset;
}

function RouteComponent() {
  const [client, clusterId] = useTypesenseClient();
  const navigate = useNavigate();
  const mobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const keyboardInset = useKeyboardInset();

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

  // You retrieve against content collections, never the internal conversation
  // history store — exclude history-schema collections from "Retrieve from".
  const retrievableCollections = useMemo(
    () =>
      (collections ?? []).filter((c) => !isConversationHistoryCollection(c)),
    [collections],
  );

  // Default the scope selectors once data arrives.
  useEffect(() => {
    if (!modelId && convModels?.length) setModelId(convModels[0].id);
  }, [convModels, modelId]);
  useEffect(() => {
    if (!collectionName && retrievableCollections.length)
      setCollectionName(retrievableCollections[0].name);
  }, [retrievableCollections, collectionName]);

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

  const createHistory = useCreateHistoryCollection();

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [turns]);

  const abortRef = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);

  const updateTurn = (key: string, patch: Partial<Turn>) =>
    setTurns((prev) =>
      prev.map((t) => (t.key === key ? { ...t, ...patch } : t)),
    );

  // Non-streaming fallback (used if streaming fails before any tokens arrive).
  const fetchOnce = async (q: string) =>
    (await client
      .collections(collectionName)
      .documents()
      .search({
        q,
        query_by: embeddingField as string,
        conversation: true,
        conversation_model_id: modelId,
        exclude_fields: embeddingField as string,
        per_page: 5,
        ...(conversationId ? { conversation_id: conversationId } : {}),
      } as Record<string, unknown>)) as SearchResponse<DocumentSchema>;

  const runConversation = async (q: string, asstKey: string) => {
    if (!embeddingField || !modelId) return;
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let displayed = '';
    let finalHits: unknown[] | undefined;
    let finalConv: SearchResponse<DocumentSchema>['conversation'] | undefined;

    try {
      const node = client.configuration.nodes[0] as {
        protocol: string;
        host: string;
        port: number | string;
      };
      const params = new URLSearchParams({
        q,
        query_by: embeddingField,
        conversation: 'true',
        conversation_stream: 'true',
        conversation_model_id: modelId,
        exclude_fields: embeddingField,
        per_page: '5',
      });
      if (conversationId) params.set('conversation_id', conversationId);

      const res = await fetch(
        `${node.protocol}://${node.host}:${node.port}/collections/${encodeURIComponent(
          collectionName,
        )}/documents/search?${params.toString()}`,
        {
          headers: { 'X-TYPESENSE-API-KEY': client.configuration.apiKey },
          signal: controller.signal,
        },
      );
      if (!res.ok || !res.body)
        throw new Error(`Search failed (HTTP ${res.status})`);

      updateTurn(asstKey, { status: 'streaming' });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const evt of events) {
          const dataLine = evt.split('\n').find((l) => l.startsWith('data:'));
          if (!dataLine) continue;
          const data = dataLine.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          let obj: Record<string, unknown>;
          try {
            obj = JSON.parse(data);
          } catch {
            continue;
          }
          const conv = obj.conversation as typeof finalConv;
          const frag = (conv?.answer ??
            (obj.message as string) ??
            (obj.answer as string)) as string | undefined;
          if (typeof frag === 'string' && frag) {
            // Handle both cumulative and token-delta stream shapes.
            displayed = frag.startsWith(displayed) ? frag : displayed + frag;
            updateTurn(asstKey, { content: displayed });
          }
          if (Array.isArray(obj.hits)) finalHits = obj.hits;
          if (conv) finalConv = conv;
        }
      }

      // Stream produced nothing usable → fall through to the non-streaming path.
      if (!displayed && !finalConv?.answer) throw new Error('empty-stream');

      if (finalConv?.conversation_id)
        setConversationId(finalConv.conversation_id);
      updateTurn(asstKey, {
        content: displayed || finalConv?.answer || '(no answer returned)',
        sources: (finalHits ?? []).map((h) =>
          hitToSource(
            h as {
              document: Record<string, unknown>;
              vector_distance?: number;
            },
          ),
        ),
        status: 'done',
      });
    } catch (err) {
      if (controller.signal.aborted) {
        updateTurn(asstKey, {
          status: 'done',
          content: displayed || '(stopped)',
        });
      } else if (displayed) {
        // Partial answer arrived before the error — keep what we have.
        updateTurn(asstKey, { status: 'done', content: displayed });
      } else {
        try {
          const res = await fetchOnce(q);
          if (res.conversation?.conversation_id)
            setConversationId(res.conversation.conversation_id);
          updateTurn(asstKey, {
            content: res.conversation?.answer ?? '(no answer returned)',
            sources: (res.hits ?? []).map((h) =>
              hitToSource(
                h as unknown as {
                  document: Record<string, unknown>;
                  vector_distance?: number;
                },
              ),
            ),
            status: 'done',
          });
        } catch (e2) {
          updateTurn(asstKey, {
            status: 'error',
            error: (e2 as Error).message || (err as Error).message,
          });
        }
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const canSend =
    Boolean(input.trim()) &&
    Boolean(embeddingField) &&
    Boolean(modelId) &&
    !busy &&
    !needsSetup;

  const handleSend = () => {
    const q = input.trim();
    if (!q || !canSend) return;
    const asstKey = `a-${Date.now()}`;
    setTurns((prev) => [
      ...prev,
      { key: `u-${Date.now()}`, role: 'user', content: q },
      {
        key: asstKey,
        role: 'assistant',
        content: '',
        status: 'pending',
        question: q,
      },
    ]);
    setInput('');
    void runConversation(q, asstKey);
  };

  const handleStop = () => abortRef.current?.abort();

  const retryTurn = (turn: Turn) => {
    if (busy || !turn.question) return;
    updateTurn(turn.key, { status: 'pending', content: '', error: undefined });
    void runConversation(turn.question, turn.key);
  };

  const handleNewConversation = () => {
    abortRef.current?.abort();
    setTurns([]);
    setConversationId(undefined);
    setInput('');
  };

  return (
    <Stack
      sx={{
        minWidth: 0,
        height: {
          // When the keyboard is open, shrink to the visible viewport so the
          // composer sits just above it; otherwise leave room for the bottom nav.
          xs:
            mobile && keyboardInset > 0
              ? `calc(100dvh - ${keyboardInset}px)`
              : `calc(100dvh - ${MOBILE_BOTTOM_NAV_HEIGHT}px - env(safe-area-inset-bottom))`,
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
            <>
              {/* Mobile: compact "+" sits where the menu button was (nav is now
                  the bottom nav). Desktop: full "New conversation" button. */}
              <Tooltip title='New conversation'>
                <Box
                  component='span'
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                >
                  <IconButton
                    onClick={handleNewConversation}
                    disabled={turns.length === 0}
                    aria-label='New conversation'
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      border: `1px solid ${designTokens.border}`,
                      background: designTokens.surface,
                      color: designTokens.text,
                      '&:hover': { borderColor: designTokens.borderStrong },
                    }}
                  >
                    <AddRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Tooltip>
              <Button
                variant='contained'
                size='small'
                startIcon={<AddRounded sx={{ fontSize: 14 }} />}
                onClick={handleNewConversation}
                disabled={turns.length === 0}
                sx={{
                  ...primaryButtonSx,
                  color: designTokens.onAccent,
                  display: { xs: 'none', md: 'inline-flex' },
                }}
              >
                New conversation
              </Button>
            </>
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
          px: { xs: 1.75, md: 3.5 },
          py: 1.25,
          background: 'background.paper',
          borderBottom: `1px solid ${designTokens.border}`,
          // Mobile: single scrollable row of compact chips. Desktop: wrap.
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          overflowX: { xs: 'auto', md: 'visible' },
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
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
          options={retrievableCollections.map((c) => c.name)}
          onChange={(v) => {
            setCollectionName(v);
            handleNewConversation();
          }}
        />
        <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
        {turns.length > 0 ? (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}>
            <Badge tone='neutral'>
              {turns.filter((t) => t.role === 'user').length} turns
            </Badge>
          </Box>
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
          <NoModelState
            onCreate={() => navigate({ to: '/conversation-models' })}
          />
        ) : needsSetup ? (
          <SetupRequiredState
            modelReady={Boolean(selectedModel)}
            historyOk={historyOk}
            historyCollection={selectedModel?.history_collection}
            hasEmbedding={Boolean(embeddingField)}
            collectionName={collectionName}
            onConfigureEmbedding={
              collectionName
                ? () =>
                    navigate({
                      to: '/collections/$collectionId/config' as never,
                      params: { collectionId: collectionName } as never,
                    })
                : undefined
            }
            onCreateHistory={
              selectedModel?.history_collection
                ? () => createHistory.mutate(selectedModel.history_collection!)
                : undefined
            }
            creatingHistory={createHistory.isPending}
          />
        ) : turns.length === 0 ? (
          <EmptyState
            model={modelId}
            collection={collectionName}
            onPick={(q) => setInput(q)}
          />
        ) : (
          <Box
            sx={{
              maxWidth: COLUMN,
              mx: 'auto',
              px: { xs: 2.5, md: 3.5 },
              py: 2,
            }}
          >
            {turns.map((t) =>
              t.role === 'user' ? (
                <UserTurn key={t.key}>{t.content}</UserTurn>
              ) : (
                <AssistantTurn
                  key={t.key}
                  turn={t}
                  model={modelId}
                  collection={collectionName}
                  onRetry={() => retryTurn(t)}
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
              // 16px on mobile keeps iOS Safari from auto-zooming on focus.
              sx={{
                '& textarea': {
                  fontSize: { xs: 16, md: 13.5 },
                  lineHeight: 1.5,
                },
              }}
            />
            {busy ? (
              <IconButton
                onClick={handleStop}
                aria-label='Stop generating'
                sx={{
                  width: 34,
                  height: 30,
                  borderRadius: '7px',
                  flexShrink: 0,
                  border: `1px solid ${designTokens.border}`,
                  color: designTokens.text,
                  background: designTokens.surface,
                  '&:hover': { background: designTokens.surfaceMuted },
                }}
              >
                <StopRounded sx={{ fontSize: 15 }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={handleSend}
                disabled={!canSend}
                aria-label='Send'
                sx={{
                  width: 34,
                  height: 30,
                  borderRadius: '7px',
                  flexShrink: 0,
                  background: canSend
                    ? designTokens.accent
                    : designTokens.borderStrong,
                  color: '#fff',
                  '&:hover': { background: designTokens.accentHover },
                  '&.Mui-disabled': { color: '#fff', opacity: 0.8 },
                }}
              >
                <SendRounded sx={{ fontSize: 15 }} />
              </IconButton>
            )}
          </Stack>
          <Typography
            sx={{
              fontSize: 11,
              color: designTokens.textSubtle,
              mt: 0.75,
              px: 0.5,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Answers cite retrieved documents
            <Box
              component='span'
              sx={{ display: { xs: 'none', md: 'inline' } }}
            >
              {' '}
              ·{' '}
              <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
                {modelId || 'no model'}
              </Box>{' '}
              · Enter to send, Shift+Enter for newline
            </Box>
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
        flexShrink: 0,
      }}
    >
      <Box sx={{ color: designTokens.textFaint, display: 'flex' }}>{icon}</Box>
      <Typography
        sx={{
          fontSize: 11.5,
          color: designTokens.textFaint,
          fontWeight: 500,
          // Drop the label on mobile so the chips stay compact in the row.
          display: { xs: 'none', md: 'block' },
        }}
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

// Inline citation chip — scrolls to the matching source card. Citations only
// render if the model emits [n] markers in its answer; otherwise the prose is
// shown plain and grounding still lives in the Sources strip below.
function Cite({ n, turnKey }: { n: string; turnKey: string }) {
  return (
    <Box
      component='sup'
      role='button'
      onClick={() =>
        document
          .getElementById(`source-${turnKey}-${n}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 15,
        height: 15,
        px: '4px',
        mx: '1px',
        borderRadius: '4px',
        background: designTokens.accentSoft,
        color: designTokens.accent,
        border: `1px solid ${designTokens.accentBorder}`,
        fontFamily: designTokens.fontMono,
        fontSize: 9.5,
        fontWeight: 600,
        lineHeight: 1,
        cursor: 'pointer',
        verticalAlign: '2px',
      }}
    >
      {n}
    </Box>
  );
}

const CITE_RE = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

// Split answer text on [n] / [n, m] markers, replacing them with Cite chips.
function renderAnswer(text: string, turnKey: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  CITE_RE.lastIndex = 0;
  while ((m = CITE_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    for (const num of m[1].split(',').map((s) => s.trim())) {
      out.push(
        <Cite key={`${turnKey}-cite-${key++}`} n={num} turnKey={turnKey} />,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
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
          background:
            turn.status === 'error'
              ? designTokens.dangerSoft
              : designTokens.accentSoft,
          border: `1px solid ${turn.status === 'error' ? designTokens.danger : designTokens.accentBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {turn.status === 'error' ? (
          <WarningAmberRounded
            sx={{ fontSize: 15, color: designTokens.danger }}
          />
        ) : (
          <AutoAwesomeRounded
            sx={{ fontSize: 15, color: designTokens.accent }}
          />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction='row'
          sx={{ alignItems: 'center', gap: 1, mb: 0.875, height: 28 }}
        >
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 600, color: designTokens.text }}
          >
            Assistant
          </Typography>
          {turn.status === 'pending' || turn.status === 'streaming' ? (
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
              {turn.status === 'streaming'
                ? 'Generating…'
                : 'Retrieving & generating…'}
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: 11,
                color: designTokens.textFaint,
                fontFamily: designTokens.fontMono,
              }}
            >
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
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: designTokens.danger }}
            >
              Couldn&apos;t generate an answer
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: designTokens.textMuted,
                lineHeight: 1.55,
                mt: 0.625,
              }}
            >
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
            <Typography
              sx={{
                fontSize: 13.5,
                lineHeight: 1.62,
                color: designTokens.text,
                whiteSpace: 'pre-wrap',
              }}
            >
              {renderAnswer(turn.content, turn.key)}
              {turn.status === 'streaming' ? (
                <Box
                  component='span'
                  sx={{
                    display: 'inline-block',
                    width: 7,
                    height: 14,
                    ml: '2px',
                    verticalAlign: '-2px',
                    borderRadius: '1px',
                    background: designTokens.accent,
                  }}
                />
              ) : null}
            </Typography>
            {turn.sources?.length ? (
              <Sources
                sources={turn.sources}
                collection={collection}
                turnKey={turn.key}
              />
            ) : null}
            {turn.status === 'done' ? (
              <Stack
                direction='row'
                sx={{ alignItems: 'center', gap: 0.5, mt: 1.5 }}
              >
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
            ) : null}
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
  turnKey,
}: {
  sources: Source[];
  collection: string;
  turnKey: string;
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
        <FormatQuoteRounded
          sx={{ fontSize: 13, color: designTokens.textFaint }}
        />
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
          · grounded in {sources.length} document
          {sources.length === 1 ? '' : 's'}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontSize: 11,
            color: designTokens.textFaint,
            fontFamily: designTokens.fontMono,
          }}
        >
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
          <SourceCard key={s.id} n={i + 1} source={s} turnKey={turnKey} />
        ))}
      </Box>
    </Box>
  );
}

function SourceCard({
  n,
  source,
  turnKey,
}: {
  n: number;
  source: Source;
  turnKey: string;
}) {
  return (
    <Stack
      id={`source-${turnKey}-${n}`}
      sx={{
        background: 'background.paper',
        border: `1px solid ${designTokens.border}`,
        borderRadius: '8px',
        p: 1.25,
        gap: 0.75,
        minWidth: 0,
        boxShadow: designTokens.shadowButton,
        scrollMarginTop: 80,
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
        <Typography
          sx={{
            fontSize: 9.5,
            fontFamily: designTokens.fontMono,
            color: designTokens.textSubtle,
          }}
        >
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
    <Box
      sx={{
        maxWidth: 620,
        mx: 'auto',
        px: 3.5,
        pt: 8,
        pb: 4,
        textAlign: 'center',
      }}
    >
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
      <Typography
        sx={{
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: '-0.025em',
          color: designTokens.text,
        }}
      >
        Ask anything about your documents
      </Typography>
      <Typography
        sx={{
          fontSize: 13.5,
          lineHeight: 1.6,
          color: designTokens.textMuted,
          mt: 1.25,
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        Answers are generated by{' '}
        <Box
          component='span'
          sx={{ fontFamily: designTokens.fontMono, color: designTokens.text }}
        >
          {model}
        </Box>{' '}
        and grounded in documents retrieved from{' '}
        <Box
          component='span'
          sx={{ fontFamily: designTokens.fontMono, color: designTokens.text }}
        >
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
            <ChatBubbleOutlineRounded
              sx={{ fontSize: 14, color: designTokens.textFaint }}
            />
            <Typography
              sx={{ flex: 1, fontSize: 13, color: designTokens.text }}
            >
              {q}
            </Typography>
            <ArrowForwardRounded
              sx={{ fontSize: 14, color: designTokens.textFaint }}
            />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function NoModelState({ onCreate }: { onCreate: () => void }) {
  return (
    <Box
      sx={{ maxWidth: 480, mx: 'auto', px: 3.5, py: 9.5, textAlign: 'center' }}
    >
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
        <AutoAwesomeRounded
          sx={{ fontSize: 22, color: designTokens.textFaint }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: designTokens.text,
        }}
      >
        No conversation model configured
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          lineHeight: 1.6,
          color: designTokens.textMuted,
          mt: 1.25,
          mb: 2.75,
          maxWidth: 380,
          mx: 'auto',
        }}
      >
        Conversational search needs an LLM you configure as a conversation model
        — set the provider, API key, and system prompt once, then reuse it
        across collections.
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
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: designTokens.success,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: designTokens.warning,
            }}
          />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 12.5, fontWeight: 500, color: designTokens.text }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 11.5,
            color: designTokens.textFaint,
            fontFamily: designTokens.fontMono,
          }}
        >
          {value}
        </Typography>
      </Box>
      <Badge tone={done ? 'success' : 'warn'}>
        {done ? 'ready' : 'missing'}
      </Badge>
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
  onCreateHistory,
  creatingHistory,
}: {
  modelReady: boolean;
  historyOk: boolean;
  historyCollection?: string;
  hasEmbedding: boolean;
  collectionName: string;
  onConfigureEmbedding?: () => void;
  onCreateHistory?: () => void;
  creatingHistory?: boolean;
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
          <WarningAmberRounded
            sx={{ fontSize: 18, color: designTokens.warning }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: designTokens.warningDeep,
            }}
          >
            Setup required
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: designTokens.textMuted,
              lineHeight: 1.55,
              mt: 0.5,
            }}
          >
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
            <SetupRow
              done={modelReady}
              label='Conversation model'
              value={modelReady ? 'selected' : 'none selected'}
            />
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
              value={
                hasEmbedding
                  ? 'configured'
                  : 'float[] embedding — not configured'
              }
            />
          </Box>
          <Stack direction='row' sx={{ gap: 1, flexWrap: 'wrap' }}>
            {!historyOk && onCreateHistory ? (
              <Button
                size='small'
                variant='contained'
                startIcon={<AddRounded sx={{ fontSize: 13 }} />}
                onClick={onCreateHistory}
                loading={creatingHistory}
                sx={{ ...primaryButtonSx, color: designTokens.onAccent }}
              >
                Create history collection
              </Button>
            ) : null}
            {!hasEmbedding && onConfigureEmbedding ? (
              <Button
                size='small'
                variant={!historyOk ? 'outlined' : 'contained'}
                startIcon={<SettingsRounded sx={{ fontSize: 13 }} />}
                onClick={onConfigureEmbedding}
                sx={
                  !historyOk
                    ? smallButtonSx
                    : { ...primaryButtonSx, color: designTokens.onAccent }
                }
              >
                Configure&nbsp;embeddings
              </Button>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
