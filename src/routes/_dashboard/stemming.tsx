import {
  Badge,
  dangerButtonSx,
  PageHeader,
  primaryButtonSx,
  smallButtonSx,
} from '@/components/redesign';
import { stemmingQueryKeys } from '@/constants';
import { compactMonoInputSx, fieldLabelSx } from '@/constants/redesignSx';
import { useAsyncToast, useDialog, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import {
  AddRounded,
  ArrowForwardRounded,
  DeleteOutlineRounded,
  OpenInNewRounded,
  SearchRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import type { StemmingDictionaryCreateSchema } from 'typesense/lib/Typesense/StemmingDictionary';

export const Route = createFileRoute('/_dashboard/stemming')({
  component: RouteComponent,
  staticData: { crumb: 'Stemming' },
});

// A single word → root mapping.
type Pair = StemmingDictionaryCreateSchema; // { word: string; root: string }

function RouteComponent() {
  const [client, clusterId] = useTypesenseClient();
  const { data: dictionaries } = useQuery({
    queryKey: stemmingQueryKeys.all(clusterId),
    queryFn: async () => {
      const res = await client.stemming.dictionaries().retrieve();
      return res.dictionaries;
    },
  });

  const ids = useMemo(() => dictionaries ?? [], [dictionaries]);

  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (selectedId === undefined && ids.length > 0) {
      setSelectedId(ids[0]);
    }
    if (selectedId && !ids.includes(selectedId)) {
      setSelectedId(ids[0] ?? null);
    }
  }, [ids, selectedId]);

  const badgeText =
    ids.length > 0
      ? `${ids.length} dictionar${ids.length === 1 ? 'y' : 'ies'}`
      : 'maps inflected words to a root';

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Stemming'
        badges={<Badge tone='neutral'>{badgeText}</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/stemming.html'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            About stemming
          </Button>
        }
      />
      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { md: 'flex-start' },
        }}
      >
        {/* Left: dictionaries sidebar */}
        <DictionarySidebar
          ids={ids}
          selectedId={selectedId ?? null}
          onSelect={setSelectedId}
        />

        {/* Right: editor */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {selectedId ? (
            <DictionaryEditor key={selectedId} id={selectedId} />
          ) : (
            <NewDictionaryPanel onCreated={(id) => setSelectedId(id)} />
          )}
        </Box>
      </Box>
    </Stack>
  );
}

// ─── Sidebar ────────────────────────────────────────

function DictionarySidebar({
  ids,
  selectedId,
  onSelect,
}: {
  ids: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: designTokens.textFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          mb: 0.75,
          px: '2px',
        }}
      >
        Dictionaries
      </Typography>
      <Stack spacing={0.5}>
        {ids.map((id) => {
          const selected = selectedId === id;
          return (
            <Box
              key={id}
              component='button'
              type='button'
              onClick={() => onSelect(id)}
              sx={{
                width: '100%',
                textAlign: 'left',
                px: 1.5,
                py: 1.125,
                borderRadius: '7px',
                background: selected
                  ? designTokens.accentSoft
                  : designTokens.surface,
                border: `1px solid ${selected ? designTokens.accentBorder : designTokens.border}`,
                cursor: 'pointer',
                font: 'inherit',
                transition: 'all 120ms ease',
                '&:hover': {
                  borderColor: selected
                    ? designTokens.accentBorder
                    : designTokens.borderStrong,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: designTokens.fontMono,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: selected ? designTokens.accentDeep : designTokens.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {id}
              </Typography>
            </Box>
          );
        })}

        <Button
          type='button'
          onClick={() => onSelect(null)}
          startIcon={<AddRounded sx={{ fontSize: 14 }} />}
          sx={{
            mt: 0.75,
            justifyContent: 'flex-start',
            px: 1.5,
            py: 1.125,
            borderRadius: '7px',
            border: `1px dashed ${selectedId === null ? designTokens.accent : designTokens.borderStrong}`,
            background:
              selectedId === null ? designTokens.accentSoft : 'transparent',
            color:
              selectedId === null
                ? designTokens.accentDeep
                : designTokens.textMuted,
            fontSize: 12.5,
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              background:
                selectedId === null
                  ? designTokens.accentSoft
                  : designTokens.surfaceMuted,
              borderColor: designTokens.accent,
            },
          }}
        >
          New dictionary
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Pair list editor (shared chrome) ───────────────

function PairRows({
  pairs,
  onRemove,
}: {
  pairs: Pair[];
  onRemove: (word: string) => void;
}) {
  if (pairs.length === 0) {
    return (
      <Typography sx={{ fontSize: 12.5, color: designTokens.textFaint }}>
        No mappings yet. Add a word and its root above.
      </Typography>
    );
  }
  return (
    <Stack spacing={0.5}>
      {pairs.map((p) => (
        <Stack
          key={p.word}
          direction='row'
          sx={{
            alignItems: 'center',
            gap: 1,
            px: 1.25,
            py: 0.75,
            background: designTokens.surfaceMuted,
            border: `1px solid ${designTokens.border}`,
            borderRadius: '6px',
          }}
        >
          <Typography
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 12.5,
              color: designTokens.text,
              minWidth: 0,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {p.word}
          </Typography>
          <ArrowForwardRounded
            sx={{ fontSize: 13, color: designTokens.textFaint, flexShrink: 0 }}
          />
          <Typography
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 12.5,
              fontWeight: 600,
              color: designTokens.accentDeep,
              minWidth: 0,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {p.root}
          </Typography>
          <Box
            component='span'
            onClick={() => onRemove(p.word)}
            sx={{
              color: designTokens.textFaint,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: 1,
              flexShrink: 0,
              '&:hover': { color: designTokens.danger },
            }}
          >
            ×
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function AddPairRow({ onAdd }: { onAdd: (pair: Pair) => void }) {
  const [word, setWord] = useState('');
  const [root, setRoot] = useState('');

  const commit = () => {
    const w = word.trim().toLowerCase();
    const r = root.trim().toLowerCase();
    if (!w || !r) return;
    onAdd({ word: w, root: r });
    setWord('');
    setRoot('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  const inputSx = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    fontSize: 12.5,
    fontFamily: designTokens.fontMono,
    background: 'transparent',
    color: designTokens.text,
  } as const;

  return (
    <Stack
      direction='row'
      sx={{
        p: 1,
        border: `1px dashed ${designTokens.borderStrong}`,
        borderRadius: '7px',
        background: designTokens.surfaceTinted,
        alignItems: 'center',
        gap: 1,
        mb: 1.75,
      }}
    >
      <Box
        component='input'
        value={word}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setWord(e.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder='word (e.g. apples)'
        sx={inputSx}
      />
      <ArrowForwardRounded
        sx={{ fontSize: 14, color: designTokens.textFaint, flexShrink: 0 }}
      />
      <Box
        component='input'
        value={root}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRoot(e.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder='root (e.g. apple)'
        sx={inputSx}
      />
      <Button
        size='small'
        variant='contained'
        disableElevation
        onClick={commit}
        disabled={!word.trim() || !root.trim()}
        sx={{
          ...primaryButtonSx,
          height: 26,
          fontSize: 12,
          px: 1.5,
          minWidth: 'auto',
          flexShrink: 0,
        }}
      >
        Add
      </Button>
    </Stack>
  );
}

// ─── Editor: existing dictionary ────────────────────

function DictionaryEditor({ id }: { id: string }) {
  const toast = useAsyncToast();
  const dialog = useDialog();
  const [client, clusterId] = useTypesenseClient();

  const { data, isLoading } = useQuery({
    queryKey: stemmingQueryKeys.dictionary(clusterId, id),
    queryFn: () => client.stemming.dictionaries(id).retrieve(),
  });

  const [pairs, setPairs] = useState<Pair[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (data?.words) setPairs(data.words);
  }, [data]);

  const filteredPairs = filter
    ? pairs.filter(
        (p) =>
          p.word.toLowerCase().includes(filter.toLowerCase()) ||
          p.root.toLowerCase().includes(filter.toLowerCase()),
      )
    : pairs;

  const saveMutation = useMutation({
    mutationFn: (words: Pair[]) =>
      client.stemming.dictionaries().upsert(id, words),
    onMutate: () => {
      toast.loading(`saving ${id}`, { id: 'save-stemming' });
    },
    onSuccess: () => {
      toast.success(`${id} saved`, { id: 'save-stemming' });
    },
    onError: (err) => {
      toast.error(err.message || 'save failed', { id: 'save-stemming' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: stemmingQueryKeys.all(clusterId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => client.stemming.dictionaries(id).delete(),
    onMutate: () => {
      toast.loading(`deleting ${id}`, { id: 'del-stemming' });
    },
    onSuccess: () => {
      toast.success(`${id} deleted`, { id: 'del-stemming' });
    },
    onError: (err) => {
      toast.error(err.message || 'delete failed', { id: 'del-stemming' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: stemmingQueryKeys.all(clusterId),
      });
    },
  });

  const handleAdd = (pair: Pair) => {
    setPairs((prev) => [...prev.filter((p) => p.word !== pair.word), pair]);
  };

  const handleRemove = (word: string) => {
    setPairs((prev) => prev.filter((p) => p.word !== word));
  };

  const handleDelete = async () => {
    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Delete dictionary "${id}"?`,
        description:
          'THIS ACTION CANNOT BE UNDONE. Fields referencing this dictionary via stem_dictionary will no longer have their mappings applied.',
        slotProps: { dialog: { maxWidth: 'sm' } },
      });
      deleteMutation.mutate();
    } catch {
      // cancelled
    }
  };

  return (
    <Box
      sx={{
        background: designTokens.surface,
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Stack
        direction='row'
        sx={{
          px: 2.25,
          py: 1.75,
          borderBottom: `1px solid ${designTokens.border}`,
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 14,
              fontWeight: 600,
              color: designTokens.text,
            }}
          >
            {id}
          </Typography>
          <Typography
            sx={{ fontSize: 11.5, color: designTokens.textMuted, mt: 0.25 }}
          >
            {pairs.length} mapping{pairs.length === 1 ? '' : 's'}
          </Typography>
        </Box>
        <Button
          variant='outlined'
          size='small'
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          startIcon={<DeleteOutlineRounded sx={{ fontSize: 14 }} />}
          sx={dangerButtonSx}
        >
          Delete
        </Button>
        <Button
          variant='contained'
          size='small'
          disableElevation
          onClick={() => saveMutation.mutate(pairs)}
          disabled={saveMutation.isPending || isLoading}
          sx={primaryButtonSx}
        >
          Save
        </Button>
      </Stack>

      {/* Filter bar */}
      <Stack
        direction='row'
        sx={{
          px: 2.25,
          py: 1.25,
          borderBottom: `1px solid ${designTokens.border}`,
          alignItems: 'center',
          gap: 1.25,
          background: designTokens.surfaceTinted,
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: 280,
            height: 30,
            border: `1px solid ${designTokens.border}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            px: 1.25,
            gap: 1,
            background: designTokens.surface,
          }}
        >
          <SearchRounded sx={{ fontSize: 14, color: designTokens.textFaint }} />
          <Box
            component='input'
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilter(e.target.value)
            }
            placeholder='Filter mappings…'
            sx={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 12.5,
              fontFamily: 'inherit',
              background: 'transparent',
              color: designTokens.text,
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 11.5, color: designTokens.textFaint }}>
          {pairs.length} mapping{pairs.length === 1 ? '' : 's'}
        </Typography>
      </Stack>

      {/* Add row + mappings */}
      <Box sx={{ px: 2.25, py: 2 }}>
        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 3 }}>
            <CircularProgress size={20} />
          </Stack>
        ) : (
          <>
            <AddPairRow onAdd={handleAdd} />
            <PairRows pairs={filteredPairs} onRemove={handleRemove} />
          </>
        )}
      </Box>

      {/* Footer */}
      <Stack
        direction='row'
        sx={{
          px: 2.25,
          py: 1.25,
          borderTop: `1px solid ${designTokens.border}`,
          background: designTokens.surfaceTinted,
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: 11.5, color: designTokens.textFaint }}>
          Reference this dictionary from a field via{' '}
          <Box
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              color: designTokens.textMuted,
            }}
          >
            stem_dictionary
          </Box>{' '}
          in the collection schema.
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── New dictionary panel ───────────────────────────

function NewDictionaryPanel({ onCreated }: { onCreated: (id: string) => void }) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const [id, setId] = useState('');
  const [pairs, setPairs] = useState<Pair[]>([]);

  const mutation = useMutation({
    mutationFn: ({ dictId, words }: { dictId: string; words: Pair[] }) =>
      client.stemming.dictionaries().upsert(dictId, words),
    onMutate: () => {
      toast.loading('creating dictionary', { id: 'save-stemming' });
    },
    onSuccess: (_data, variables) => {
      toast.success(`${variables.dictId} created`, { id: 'save-stemming' });
      onCreated(variables.dictId);
    },
    onError: (err) => {
      toast.error(err.message || 'create failed', { id: 'save-stemming' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: stemmingQueryKeys.all(clusterId),
      });
    },
  });

  const handleAdd = (pair: Pair) => {
    setPairs((prev) => [...prev.filter((p) => p.word !== pair.word), pair]);
  };

  const handleRemove = (word: string) => {
    setPairs((prev) => prev.filter((p) => p.word !== word));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dictId = id.trim();
    if (!dictId || pairs.length === 0) return;
    mutation.mutate({ dictId, words: pairs });
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit}
      sx={{
        background: designTokens.surface,
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        p: 2.5,
        maxWidth: 520,
      }}
    >
      <Typography
        sx={{ fontSize: 14, fontWeight: 600, color: designTokens.text, mb: 0.5 }}
      >
        New stemming dictionary
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          lineHeight: 1.5,
          mb: 1.5,
        }}
      >
        Maps inflected words to a shared root so they match at search time (e.g.
        apples → apple).
      </Typography>

      <Typography sx={fieldLabelSx}>Dictionary ID</Typography>
      <MuiTextField
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder='e.g. plurals'
        fullWidth
        size='small'
        required
        sx={compactMonoInputSx}
      />

      <Typography sx={fieldLabelSx}>Mappings</Typography>
      <AddPairRow onAdd={handleAdd} />
      <PairRows pairs={pairs} onRemove={handleRemove} />

      <Button
        type='submit'
        variant='contained'
        fullWidth
        disableElevation
        disabled={mutation.isPending || !id.trim() || pairs.length === 0}
        startIcon={<AddRounded sx={{ fontSize: 14 }} />}
        sx={{ ...primaryButtonSx, height: 36, mt: 2 }}
      >
        Create dictionary
      </Button>
    </Box>
  );
}
