import {
  Badge,
  dangerButtonSx,
  PageHeader,
  primaryButtonSx,
  smallButtonSx,
} from '@/components/redesign';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import {
  AddRounded,
  DeleteOutlineRounded,
  OpenInNewRounded,
  SearchRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import type { StopwordCreateSchema } from 'typesense/lib/Typesense/Stopwords';

export const Route = createFileRoute('/_dashboard/stopwords')({
  component: RouteComponent,
  staticData: { crumb: 'Stopwords' },
});

function RouteComponent() {
  const [client, clusterId] = useTypesenseClient();
  const { data: stopwordSets } = useQuery({
    queryKey: [clusterId, 'stopwords'],
    queryFn: async () => {
      const res = await client.stopwords().retrieve();
      return res.stopwords;
    },
  });

  const sets: StopwordSetDescriptor[] = useMemo(
    () =>
      (stopwordSets ?? []).map((s) => {
        const words = Array.isArray(s.stopwords)
          ? s.stopwords
          : (s.stopwords?.stopwords ?? []);
        return {
          id: s.id,
          locale: s.locale ?? '',
          words,
          count: words.length,
        };
      }),
    [stopwordSets],
  );

  const totalWords = useMemo(
    () => sets.reduce((sum, s) => sum + s.count, 0),
    [sets],
  );

  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (selectedId === undefined && sets.length > 0) {
      setSelectedId(sets[0].id);
    }
    if (selectedId && !sets.find((s) => s.id === selectedId)) {
      setSelectedId(sets[0]?.id ?? null);
    }
  }, [sets, selectedId]);

  const selectedSet = selectedId
    ? (sets.find((s) => s.id === selectedId) ?? null)
    : null;

  const badgeText =
    sets.length > 0
      ? `${sets.length} set${sets.length === 1 ? '' : 's'} · ${totalWords} words`
      : 'removed at query time';

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Stopwords'
        badges={<Badge tone='neutral'>{badgeText}</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/stopwords.html'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            When to use stopwords
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
        {/* Left: sets sidebar */}
        <SetsSidebar
          sets={sets}
          selectedId={selectedId ?? null}
          onSelect={setSelectedId}
        />

        {/* Right: editor */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {selectedSet ? (
            <StopwordEditor key={selectedSet.id} set={selectedSet} />
          ) : (
            <NewSetPanel onCreated={(id) => setSelectedId(id)} />
          )}
        </Box>
      </Box>
    </Stack>
  );
}

// ─── Types ──────────────────────────────────────────

interface StopwordSetDescriptor {
  id: string;
  locale: string;
  words: string[];
  count: number;
}

// ─── Sidebar ────────────────────────────────────────

function SetsSidebar({
  sets,
  selectedId,
  onSelect,
}: {
  sets: StopwordSetDescriptor[];
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
        Sets
      </Typography>
      <Stack spacing={0.5}>
        {sets.map((s) => {
          const selected = selectedId === s.id;
          return (
            <Box
              key={s.id}
              component='button'
              type='button'
              onClick={() => onSelect(s.id)}
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
              <Stack
                direction='row'
                sx={{ alignItems: 'center', gap: 0.75, mb: 0.5 }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: designTokens.fontMono,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: selected
                      ? designTokens.accentDeep
                      : designTokens.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.id}
                </Typography>
                {s.locale ? (
                  <Box
                    component='span'
                    sx={{
                      fontFamily: designTokens.fontMono,
                      fontSize: 10.5,
                      color: designTokens.textFaint,
                      px: 0.75,
                      py: '1px',
                      background: designTokens.surface,
                      border: `1px solid ${designTokens.border}`,
                      borderRadius: '4px',
                    }}
                  >
                    {s.locale}
                  </Box>
                ) : null}
              </Stack>
              <Typography
                sx={{ fontSize: 11.5, color: designTokens.textMuted }}
              >
                {s.count} words
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
          New set
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Editor: word chips ─────────────────────────────

function StopwordEditor({ set }: { set: StopwordSetDescriptor }) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const [words, setWords] = useState<string[]>(set.words);
  const [addInput, setAddInput] = useState('');
  const [filter, setFilter] = useState('');

  const filteredWords = filter
    ? words.filter((w) => w.toLowerCase().includes(filter.toLowerCase()))
    : words;

  const saveMutation = useMutation({
    mutationFn: (params: StopwordCreateSchema) =>
      client.stopwords().upsert(set.id, params),
    onMutate: () => {
      toast.loading(`saving ${set.id}`, { id: 'save-stopwords' });
    },
    onSuccess: () => {
      toast.success(`${set.id} saved`, { id: 'save-stopwords' });
    },
    onError: (err) => {
      toast.error(err.message || 'save failed', { id: 'save-stopwords' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [clusterId, 'stopwords'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => client.stopwords(set.id).delete(),
    onMutate: () => {
      toast.loading(`deleting ${set.id}`, { id: 'del-stopwords' });
    },
    onSuccess: () => {
      toast.success(`${set.id} deleted`, { id: 'del-stopwords' });
    },
    onError: (err) => {
      toast.error(err.message || 'delete failed', { id: 'del-stopwords' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [clusterId, 'stopwords'] });
    },
  });

  const handleAdd = () => {
    const newWords = addInput
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w && !words.includes(w));
    if (newWords.length) {
      setWords((prev) => [...prev, ...newWords]);
    }
    setAddInput('');
  };

  const handleRemove = (word: string) => {
    setWords((prev) => prev.filter((w) => w !== word));
  };

  const handleSave = () => {
    saveMutation.mutate({
      stopwords: words,
      locale: set.locale || undefined,
    });
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
            {set.id}
          </Typography>
          <Typography
            sx={{ fontSize: 11.5, color: designTokens.textMuted, mt: 0.25 }}
          >
            {set.count} words
            {set.locale ? ` · locale ${set.locale}` : ''}
          </Typography>
        </Box>
        <Button
          variant='outlined'
          size='small'
          onClick={() => deleteMutation.mutate()}
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
          onClick={handleSave}
          disabled={saveMutation.isPending}
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
            placeholder='Filter words…'
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
        <Typography
          sx={{
            fontSize: 11.5,
            color: designTokens.textFaint,
          }}
        >
          {words.length} words
        </Typography>
      </Stack>

      {/* Add input + chips */}
      <Box sx={{ px: 2.25, py: 2 }}>
        {/* Add row */}
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
          <AddRounded sx={{ fontSize: 14, color: designTokens.textFaint }} />
          <Box
            component='input'
            value={addInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAddInput(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder='Add words separated by space or comma…'
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
          <Button
            size='small'
            variant='contained'
            disableElevation
            onClick={handleAdd}
            sx={{
              ...primaryButtonSx,
              height: 26,
              fontSize: 12,
              px: 1.5,
              minWidth: 'auto',
            }}
          >
            Add
          </Button>
        </Stack>

        {/* Word chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {filteredWords.map((word) => (
            <Box
              key={word}
              component='span'
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 12,
                px: 1.25,
                py: '4px',
                background: designTokens.surfaceMuted,
                border: `1px solid ${designTokens.border}`,
                borderRadius: '5px',
                color: designTokens.text,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              {word}
              <Box
                component='span'
                onClick={() => handleRemove(word)}
                sx={{
                  color: designTokens.textFaint,
                  cursor: 'pointer',
                  fontSize: 11.5,
                  lineHeight: 1,
                  '&:hover': { color: designTokens.danger },
                }}
              >
                ×
              </Box>
            </Box>
          ))}
          {filteredWords.length === 0 && (
            <Typography sx={{ fontSize: 12.5, color: designTokens.textFaint }}>
              {filter ? 'No matching words.' : 'No words yet. Add some above.'}
            </Typography>
          )}
        </Box>
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
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: 11.5, color: designTokens.textFaint }}>
          Stopwords are ignored at query time on fields listed in{' '}
          <Box
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              color: designTokens.textMuted,
            }}
          >
            query_by
          </Box>
          .
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── New set panel ──────────────────────────────────

function NewSetPanel({ onCreated }: { onCreated: (id: string) => void }) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const [id, setId] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [wordDraft, setWordDraft] = useState('');
  const [locale, setLocale] = useState('');

  const mutation = useMutation({
    mutationFn: ({
      stopwordId,
      params,
    }: {
      stopwordId: string;
      params: StopwordCreateSchema;
    }) => client.stopwords().upsert(stopwordId, params),
    onMutate: () => {
      toast.loading('creating stopword set', { id: 'save-stopwords' });
    },
    onSuccess: (data) => {
      toast.success(`${data.id} created`, { id: 'save-stopwords' });
      onCreated(data.id);
    },
    onError: (err) => {
      toast.error(err.message || 'create failed', { id: 'save-stopwords' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [clusterId, 'stopwords'] });
    },
  });

  const flushDraft = () => {
    const newWords = wordDraft
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w && !words.includes(w));
    if (newWords.length) setWords((prev) => [...prev, ...newWords]);
    setWordDraft('');
  };

  const handleWordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/[,\s]/.test(val.slice(-1))) {
      const newWords = val
        .split(/[,\s]+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w && !words.includes(w));
      if (newWords.length) setWords((prev) => [...prev, ...newWords]);
      setWordDraft('');
    } else {
      setWordDraft(val);
    }
  };

  const handleWordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      flushDraft();
    }
    if (e.key === 'Backspace' && !wordDraft && words.length) {
      setWords((prev) => prev.slice(0, -1));
    }
  };

  const removeWord = (word: string) => {
    setWords((prev) => prev.filter((w) => w !== word));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    const finalWords = [...words];
    const trailing = wordDraft
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w && !finalWords.includes(w));
    finalWords.push(...trailing);
    mutation.mutate({
      stopwordId: id.trim(),
      params: { stopwords: finalWords, locale: locale || undefined },
    });
  };

  const compactInputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: designTokens.surface,
      fontSize: 12.5,
      fontFamily: designTokens.fontMono,
      minHeight: 32,
      borderRadius: '6px',
      '& fieldset': { borderColor: designTokens.border },
      '&:hover fieldset': { borderColor: designTokens.borderStrong },
      '&.Mui-focused fieldset': {
        borderColor: designTokens.accent,
        borderWidth: 1,
      },
      '& input': {
        fontSize: 12.5,
        fontFamily: designTokens.fontMono,
        padding: '6px 10px !important',
      },
    },
  };

  const labelSx = {
    fontSize: 10.5,
    fontWeight: 700,
    color: designTokens.textFaint,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    mb: 0.75,
    mt: 1.5,
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
        maxWidth: 480,
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: designTokens.text,
          mb: 0.5,
        }}
      >
        New stopword set
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          lineHeight: 1.5,
          mb: 1.5,
        }}
      >
        Stopwords are ignored at query time on fields listed in query_by.
      </Typography>

      <Typography sx={labelSx}>Set ID</Typography>
      <MuiTextField
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder='e.g. english_common'
        fullWidth
        size='small'
        required
        sx={compactInputSx}
      />

      <Typography sx={labelSx}>Words</Typography>
      <Box
        sx={{
          border: `1px solid ${designTokens.border}`,
          borderRadius: '6px',
          background: designTokens.surface,
          p: 0.875,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.625,
          alignItems: 'center',
          minHeight: 34,
          cursor: 'text',
          transition: 'border-color 120ms ease',
          '&:focus-within': {
            borderColor: designTokens.accent,
          },
        }}
        onClick={(e) => {
          const input = (e.currentTarget as HTMLElement).querySelector('input');
          input?.focus();
        }}
      >
        {words.map((w) => (
          <Box
            key={w}
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 12,
              px: 1,
              py: '3px',
              background: designTokens.surfaceMuted,
              border: `1px solid ${designTokens.border}`,
              borderRadius: '5px',
              color: designTokens.text,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.625,
            }}
          >
            {w}
            <Box
              component='span'
              onClick={(e) => {
                e.stopPropagation();
                removeWord(w);
              }}
              sx={{
                color: designTokens.textFaint,
                cursor: 'pointer',
                fontSize: 11,
                lineHeight: 1,
                '&:hover': { color: designTokens.danger },
              }}
            >
              ×
            </Box>
          </Box>
        ))}
        <Box
          component='input'
          value={wordDraft}
          onChange={handleWordInputChange}
          onKeyDown={handleWordKeyDown}
          onBlur={flushDraft}
          placeholder={
            words.length === 0 ? 'type words, press space or comma…' : ''
          }
          sx={{
            flex: 1,
            minWidth: 120,
            border: 'none',
            outline: 'none',
            fontSize: 12.5,
            fontFamily: designTokens.fontMono,
            background: 'transparent',
            color: designTokens.text,
            py: '2px',
          }}
        />
      </Box>

      <Typography sx={labelSx}>Locale</Typography>
      <MuiTextField
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        placeholder='en (optional)'
        fullWidth
        size='small'
        sx={compactInputSx}
      />

      <Button
        type='submit'
        variant='contained'
        fullWidth
        disableElevation
        disabled={mutation.isPending || !id.trim()}
        startIcon={<AddRounded sx={{ fontSize: 14 }} />}
        sx={{ ...primaryButtonSx, height: 36, mt: 2 }}
      >
        Create set
      </Button>
    </Box>
  );
}
