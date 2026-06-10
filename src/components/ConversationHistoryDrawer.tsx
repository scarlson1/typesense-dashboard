import { Badge } from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { ChatBubbleOutlineRounded, CloseRounded } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

/**
 * A turn document as stored in a conversation-history collection. `message` and
 * `role` are stored-but-unindexed; Typesense still returns them via
 * include_fields. `timestamp` is unix seconds.
 */
interface HistoryDoc {
  conversation_id: string;
  role: string;
  message: string;
  timestamp: number;
}

interface ConversationSummary {
  id: string;
  /** First user prompt of the thread, used as the list title. */
  title: string;
  /** Most recent turn timestamp (unix seconds), for sorting + display. */
  lastTimestamp: number;
  /** Number of user prompts in the thread (matches the chat's "turns" count). */
  turnCount: number;
}

// Collapse a flat, timestamp-desc list of turns into one summary per
// conversation. Because hits arrive newest-first, the *last* user message we
// see for a conversation is its earliest — so overwriting keeps the opening
// prompt as the title.
function summarize(hits: { document: HistoryDoc }[]): ConversationSummary[] {
  const byId = new Map<string, ConversationSummary>();
  for (const { document: d } of hits) {
    let s = byId.get(d.conversation_id);
    if (!s) {
      s = {
        id: d.conversation_id,
        title: '',
        lastTimestamp: d.timestamp,
        turnCount: 0,
      };
      byId.set(d.conversation_id, s);
    }
    if (d.timestamp > s.lastTimestamp) s.lastTimestamp = d.timestamp;
    if (d.role === 'user') {
      s.turnCount += 1;
      if (d.message.trim()) s.title = d.message;
    }
  }
  for (const s of byId.values()) if (!s.title) s.title = '(no prompt)';
  return [...byId.values()].sort((a, b) => b.lastTimestamp - a.lastTimestamp);
}

function relativeTime(unixSeconds: number): string {
  const diff = Date.now() / 1000 - unixSeconds;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export interface ConversationHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  /** The selected model's history collection; the drawer is inert without it. */
  historyCollection?: string;
  /** Scope the list to threads created with the active model. */
  modelId: string;
  /** Highlight the thread currently loaded in the chat, if any. */
  activeConversationId?: string;
  onSelect: (conversationId: string) => void;
}

/**
 * Right-anchored drawer listing prior conversations from a model's history
 * collection. Selecting one hands its `conversation_id` back to the chat to
 * reopen and continue. Conversations expire with the model's TTL (24h default),
 * so this only ever shows recent threads.
 */
export function ConversationHistoryDrawer({
  open,
  onClose,
  historyCollection,
  modelId,
  activeConversationId,
  onSelect,
}: ConversationHistoryDrawerProps) {
  const [client, clusterId] = useTypesenseClient();

  const {
    data: conversations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['conversation-history', clusterId, historyCollection, modelId],
    enabled: open && Boolean(historyCollection) && Boolean(modelId),
    queryFn: async () => {
      const res = await client
        .collections(historyCollection as string)
        .documents()
        .search({
          q: '*',
          query_by: 'conversation_id',
          filter_by: `model_id:=\`${modelId}\``,
          sort_by: 'timestamp:desc',
          per_page: 250,
          include_fields: 'conversation_id,role,message,timestamp',
        } as Record<string, unknown>);
      const hits = (res.hits ?? []) as unknown as { document: HistoryDoc }[];
      return summarize(hits);
    },
  });

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '85vw', sm: 340 },
            background: designTokens.surface,
            borderLeft: `1px solid ${designTokens.border}`,
          },
        },
      }}
    >
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${designTokens.border}`,
        }}
      >
        <ChatBubbleOutlineRounded
          sx={{ fontSize: 16, color: designTokens.textFaint }}
        />
        <Typography
          sx={{ fontSize: 13.5, fontWeight: 600, color: designTokens.text }}
        >
          Previous conversations
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton
          onClick={onClose}
          aria-label='Close history'
          sx={{ color: designTokens.textFaint }}
        >
          <CloseRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.25 }}>
        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress size={20} />
          </Stack>
        ) : isError ? (
          <DrawerNote text="Couldn't load conversation history." />
        ) : !conversations?.length ? (
          <DrawerNote text='No previous conversations yet. Threads appear here once you start chatting.' />
        ) : (
          <Stack sx={{ gap: 0.5 }}>
            {conversations.map((c) => {
              const active = c.id === activeConversationId;
              return (
                <Stack
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  sx={{
                    gap: 0.625,
                    px: 1.25,
                    py: 1.125,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: `1px solid ${active ? designTokens.accentBorder : 'transparent'}`,
                    background: active
                      ? designTokens.accentSoft
                      : 'transparent',
                    '&:hover': {
                      background: active
                        ? designTokens.accentSoft
                        : designTokens.surfaceMuted,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: designTokens.text,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {c.title}
                  </Typography>
                  <Stack
                    direction='row'
                    sx={{ alignItems: 'center', gap: 0.875 }}
                  >
                    <Typography
                      sx={{ fontSize: 10.5, color: designTokens.textSubtle }}
                    >
                      {relativeTime(c.lastTimestamp)}
                    </Typography>
                    <Box
                      sx={{
                        width: 3,
                        height: 3,
                        borderRadius: '50%',
                        background: designTokens.textFaint,
                      }}
                    />
                    <Typography
                      sx={{ fontSize: 10.5, color: designTokens.textSubtle }}
                    >
                      {c.turnCount} turn{c.turnCount === 1 ? '' : 's'}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    {active ? <Badge tone='indigo'>open</Badge> : null}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

function DrawerNote({ text }: { text: string }) {
  return (
    <Typography
      sx={{
        fontSize: 12,
        color: designTokens.textMuted,
        lineHeight: 1.55,
        px: 1.25,
        py: 4,
        textAlign: 'center',
      }}
    >
      {text}
    </Typography>
  );
}
