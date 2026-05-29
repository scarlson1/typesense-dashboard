import { collectionQueryKeys } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import { DeleteRounded, EditRounded, SearchRounded, SwapHorizRounded, TrendingFlatRounded } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type {
  SynonymItemSchema,
  SynonymSetSchema,
} from 'typesense/lib/Typesense/SynonymSets';

type SynonymRow = SynonymItemSchema & { setName: string };

export interface SynonymRowForEdit {
  setName: string;
  synonyms: string;
  root: string;
  symbols_to_index: string;
  locale: string;
}

interface SynonymsGridV30Props {
  onEdit?: (row: SynonymRowForEdit) => void;
}

type TypeFilter = 'all' | 'multi-way' | 'one-way';

const colHeaderSx = {
  fontSize: 11,
  fontWeight: 600,
  color: designTokens.textFaint,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  px: 1.5,
  py: 1,
  userSelect: 'none' as const,
};

function TypeBadge({ isOneWay }: { isOneWay: boolean }) {
  return (
    <Box
      component='span'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        px: '7px',
        py: '3px',
        borderRadius: '6px',
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        background: designTokens.surfaceMuted,
        border: `1px solid ${designTokens.border}`,
        color: designTokens.textMuted,
      }}
    >
      {isOneWay ? (
        <TrendingFlatRounded sx={{ fontSize: 12 }} />
      ) : (
        <SwapHorizRounded sx={{ fontSize: 12 }} />
      )}
      {isOneWay ? 'one-way' : 'multi-way'}
    </Box>
  );
}

function TermChip({ term, isRoot = false }: { term: string; isRoot?: boolean }) {
  return (
    <Box
      component='span'
      sx={{
        fontFamily: designTokens.fontMono,
        fontSize: 11.5,
        px: '6px',
        py: '2px',
        borderRadius: '5px',
        border: `1px solid ${isRoot ? designTokens.borderStrong : designTokens.border}`,
        background: isRoot ? designTokens.surfaceMuted : 'transparent',
        color: designTokens.text,
        whiteSpace: 'nowrap',
      }}
    >
      {term}
    </Box>
  );
}

function TermsDisplay({ synonyms, root }: { synonyms: string[]; root?: string }) {
  const isOneWay = !!root;
  const Arrow = isOneWay ? TrendingFlatRounded : SwapHorizRounded;

  if (isOneWay) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
        <TermChip term={root} isRoot />
        {synonyms.map((term) => (
          <Box key={term} sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Arrow sx={{ fontSize: 13, color: designTokens.textFaint }} />
            <TermChip term={term} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
      {synonyms.map((term, i) => (
        <Box key={term} sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {i > 0 && <Arrow sx={{ fontSize: 13, color: designTokens.textFaint }} />}
          <TermChip term={term} />
        </Box>
      ))}
    </Box>
  );
}

export const SynonymsGridV30 = ({ onEdit }: SynonymsGridV30Props) => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: collectionQueryKeys.synonymSets(clusterId),
    queryFn: () => client.synonymSets().retrieve(),
  });

  const rows = useMemo<SynonymRow[]>(
    () =>
      data?.flatMap((set) =>
        set.items.map((item) => ({ ...item, setName: set.name })),
      ) ?? [],
    [data],
  );

  const mutation = useMutation({
    mutationFn: (setName: string) => client.synonymSets(setName).delete(),
    onMutate: async (setName) => {
      await queryClient.cancelQueries({
        queryKey: collectionQueryKeys.synonymSets(clusterId),
      });

      const prev = queryClient.getQueryData<SynonymSetSchema[]>(
        collectionQueryKeys.synonymSets(clusterId),
      );

      queryClient.setQueryData(
        collectionQueryKeys.synonymSets(clusterId),
        (old: SynonymSetSchema[]) => old.filter((s) => s.name !== setName),
      );

      toast.loading(`deleting [${setName}]...`, { id: 'delete-synonym' });

      return { setName, prev };
    },
    onSuccess: (_, setName) => {
      toast.success(`synonym deleted [${setName}]`, { id: 'delete-synonym' });
    },
    onError: (err, _, ctx) => {
      const msg = err.message || 'failed to delete synonym';
      toast.error(msg, { id: 'delete-synonym' });
      if (ctx?.prev) {
        queryClient.setQueryData(
          collectionQueryKeys.synonymSets(clusterId),
          ctx.prev,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.synonymSets(clusterId),
      });
    },
  });

  const filtered = useMemo(() => {
    let list = rows;
    if (typeFilter !== 'all') {
      list = list.filter((r) =>
        typeFilter === 'one-way' ? !!r.root : !r.root,
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.setName?.toLowerCase().includes(q) ||
          r.synonyms?.some((s) => s.toLowerCase().includes(q)) ||
          r.root?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [rows, typeFilter, search]);

  const paginated = useMemo(
    () => filtered.slice(page * pageSize, (page + 1) * pageSize),
    [filtered, page, pageSize],
  );

  const totalPages = Math.ceil(filtered.length / pageSize);

  if (isError)
    return <Typography>{error.message || 'something went wrong'}</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Filter bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${designTokens.border}`,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            border: `1px solid ${designTokens.border}`,
            borderRadius: '6px',
            px: 1,
            py: '5px',
            background: designTokens.surface,
            maxWidth: 260,
            '&:focus-within': { borderColor: designTokens.accent },
          }}
        >
          <SearchRounded sx={{ fontSize: 13, color: designTokens.textFaint, flexShrink: 0 }} />
          <Box
            component='input'
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder='Filter rules...'
            sx={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 12.5,
              color: designTokens.text,
              '&::placeholder': { color: designTokens.textFaint, opacity: 1 },
            }}
          />
        </Box>

        <Select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as TypeFilter);
            setPage(0);
          }}
          size='small'
          sx={{
            fontSize: 12,
            height: 30,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: designTokens.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: designTokens.borderStrong },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: designTokens.accent },
            '& .MuiSelect-select': { py: '4px', px: 1 },
          }}
          renderValue={(v) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12 }}>
              <SwapHorizRounded sx={{ fontSize: 13 }} />
              <span>Type</span>
              {v !== 'all' && (
                <>
                  <Box component='span' sx={{ color: designTokens.textFaint, mx: 0.25 }}>·</Box>
                  <span>{v}</span>
                </>
              )}
            </Box>
          )}
        >
          <MenuItem value='all' sx={{ fontSize: 12 }}>All</MenuItem>
          <MenuItem value='multi-way' sx={{ fontSize: 12 }}>Multi-way</MenuItem>
          <MenuItem value='one-way' sx={{ fontSize: 12 }}>One-way</MenuItem>
        </Select>

        <Box sx={{ ml: 'auto', fontSize: 12, color: designTokens.textFaint, whiteSpace: 'nowrap' }}>
          {isLoading ? '...' : `${filtered.length} of ${rows.length}`}
        </Box>
      </Box>

      {/* Table header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '140px 100px 1fr 70px 64px',
          borderBottom: `1px solid ${designTokens.border}`,
          background: designTokens.bg,
        }}
      >
        {['ID', 'TYPE', 'TERMS', 'LOCALE', ''].map((col) => (
          <Box key={col} sx={colHeaderSx}>{col}</Box>
        ))}
      </Box>

      {/* Table body */}
      {isLoading ? (
        <Box sx={{ px: 1.5, py: 3, color: designTokens.textFaint, fontSize: 13 }}>
          Loading…
        </Box>
      ) : paginated.length === 0 ? (
        <Box sx={{ px: 1.5, py: 3, color: designTokens.textFaint, fontSize: 13 }}>
          {rows.length === 0 ? 'No synonym rules yet.' : 'No results match your filter.'}
        </Box>
      ) : (
        paginated.map((row) => {
          const isOneWay = !!row.root;
          return (
            <Box
              key={`${row.setName}::${row.id}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: '140px 100px 1fr 70px 64px',
                borderBottom: `1px solid ${designTokens.border}`,
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { background: designTokens.surfaceTinted },
                '& .row-actions': { opacity: 0 },
                '&:hover .row-actions': { opacity: 1 },
              }}
            >
              {/* ID */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  fontFamily: designTokens.fontMono,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: designTokens.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {row.setName}
              </Box>

              {/* TYPE */}
              <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'flex-start', pt: 1.5 }}>
                <TypeBadge isOneWay={isOneWay} />
              </Box>

              {/* TERMS */}
              <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center' }}>
                <TermsDisplay synonyms={row.synonyms ?? []} root={row.root} />
              </Box>

              {/* LOCALE */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  fontSize: 12.5,
                  color: designTokens.textMuted,
                  fontFamily: designTokens.fontMono,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {row.locale || '—'}
              </Box>

              {/* ACTIONS */}
              <Box
                className='row-actions'
                sx={{
                  px: 0.5,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 0.25,
                  transition: 'opacity 120ms ease',
                }}
              >
                {onEdit && (
                  <Tooltip title='Edit' placement='top'>
                    <IconButton
                      size='small'
                      onClick={() =>
                        onEdit({
                          setName: row.setName,
                          synonyms: row.synonyms?.join(', ') ?? '',
                          root: row.root ?? '',
                          symbols_to_index: row.symbols_to_index?.join(', ') ?? '',
                          locale: row.locale ?? '',
                        })
                      }
                      sx={{ color: designTokens.textFaint, '&:hover': { color: designTokens.text } }}
                    >
                      <EditRounded sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title='Delete' placement='top'>
                  <IconButton
                    size='small'
                    onClick={() => mutation.mutate(row.setName)}
                    disabled={mutation.isPending}
                    sx={{ color: designTokens.textFaint, '&:hover': { color: designTokens.danger } }}
                  >
                    <DeleteRounded sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          );
        })
      )}

      {/* Pagination */}
      {!isLoading && rows.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            px: 1.5,
            py: 1,
            borderTop: `1px solid ${designTokens.border}`,
            fontSize: 12.5,
            color: designTokens.textMuted,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>Rows per page:</span>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              size='small'
              sx={{
                fontSize: 12.5,
                height: 26,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: designTokens.border },
                '& .MuiSelect-select': { py: '2px', px: '8px' },
              }}
            >
              {[5, 10, 20].map((n) => (
                <MenuItem key={n} value={n} sx={{ fontSize: 12.5 }}>{n}</MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ fontSize: 12.5, minWidth: 64, textAlign: 'center' }}>
            {filtered.length === 0
              ? '0–0 of 0'
              : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)} of ${filtered.length}`}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <IconButton
              size='small'
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              sx={{ color: designTokens.textMuted }}
            >
              <Box component='span' sx={{ fontSize: 16, lineHeight: 1 }}>‹</Box>
            </IconButton>
            <IconButton
              size='small'
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              sx={{ color: designTokens.textMuted }}
            >
              <Box component='span' sx={{ fontSize: 16, lineHeight: 1 }}>›</Box>
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};
