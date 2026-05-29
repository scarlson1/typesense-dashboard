import { collectionQueryKeys } from '@/constants';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import {
  AppsRounded,
  ArrowForwardRounded,
  CheckRounded,
  KeyboardArrowDownRounded,
  SearchRounded,
} from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  InputBase,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CollectionSwitcherProps {
  currentCollectionId: string;
}

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toLocaleString();
};

export const CollectionSwitcher = ({
  currentCollectionId,
}: CollectionSwitcherProps) => {
  const [client, clusterId] = useTypesenseClient();
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: collections } = useQuery({
    queryKey: collectionQueryKeys.list(clusterId, {}),
    queryFn: () => client.collections().retrieve(),
    staleTime: 1000 * 60,
  });

  const filtered = useMemo(() => {
    if (!collections) return [];
    if (!search) return collections;
    const lower = search.toLowerCase();
    return collections.filter((c) => c.name.toLowerCase().includes(lower));
  }, [collections, search]);

  const currentCollection = collections?.find(
    (c) => c.name === currentCollectionId,
  );
  const docCount = currentCollection?.num_documents ?? 0;

  const handleSelect = useCallback(
    (name: string) => {
      setOpen(false);
      setSearch('');
      navigate({
        to: '/collections/$collectionId/documents/search',
        params: { collectionId: name },
      });
    },
    [navigate],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      <Box
        ref={anchorRef}
        onClick={() => setOpen(!open)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          borderRadius: '6px',
          border: `1px solid ${designTokens.border}`,
          background: designTokens.surface,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { borderColor: designTokens.borderStrong },
        }}
      >
        <AppsRounded sx={{ fontSize: 14, color: designTokens.textMuted }} />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: designTokens.text,
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentCollectionId}
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            color: designTokens.textFaint,
            whiteSpace: 'nowrap',
          }}
        >
          · {formatCount(docCount)}
        </Typography>
        <KeyboardArrowDownRounded
          sx={{
            fontSize: 16,
            color: designTokens.textFaint,
            transition: 'transform 150ms',
            transform: open ? 'rotate(180deg)' : undefined,
          }}
        />
      </Box>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement='bottom-start'
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener
          onClickAway={() => {
            setOpen(false);
            setSearch('');
          }}
        >
          <Paper
            sx={{
              width: 340,
              maxWidth: '92vw',
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,.1)',
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: `1px solid ${designTokens.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <SearchRounded
                sx={{ fontSize: 16, color: designTokens.textFaint }}
              />
              <InputBase
                placeholder='Switch collection...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                sx={{ flex: 1, fontSize: 13 }}
              />
              <Typography
                sx={{
                  fontSize: 10,
                  color: designTokens.textFaint,
                  border: `1px solid ${designTokens.border}`,
                  borderRadius: '4px',
                  px: 0.5,
                  py: 0.15,
                  lineHeight: 1.4,
                }}
              >
                esc
              </Typography>
            </Box>

            {/* Section header */}
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: designTokens.textFaint,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                px: 1.5,
                pt: 1,
                pb: 0.5,
              }}
            >
              Recent
            </Typography>

            {/* Collection list */}
            <Box sx={{ maxHeight: 320, overflowY: 'auto', pb: 0.5 }}>
              {filtered.map((c) => {
                const isSelected = c.name === currentCollectionId;
                return (
                  <Stack
                    key={c.name}
                    direction='row'
                    onClick={() => handleSelect(c.name)}
                    sx={{
                      px: 1.5,
                      py: 1,
                      cursor: 'pointer',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { background: designTokens.surfaceMuted },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: designTokens.success,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: designTokens.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.name.replace(/_/g, ' ')}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          color: designTokens.textFaint,
                          fontFamily: designTokens.fontMono,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.name}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: designTokens.textMuted,
                        fontFamily: designTokens.fontMono,
                        flexShrink: 0,
                      }}
                    >
                      {(c.num_documents ?? 0).toLocaleString()}
                    </Typography>
                    {isSelected && (
                      <CheckRounded
                        sx={{
                          fontSize: 16,
                          color: designTokens.accent,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Stack>
                );
              })}
              {filtered.length === 0 && (
                <Typography
                  sx={{
                    px: 1.5,
                    py: 2,
                    fontSize: 13,
                    color: designTokens.textFaint,
                    textAlign: 'center',
                  }}
                >
                  No collections found
                </Typography>
              )}
            </Box>

            {/* All collections link */}
            <Box
              onClick={() => {
                setOpen(false);
                navigate({ to: '/collections' });
              }}
              sx={{
                px: 1.5,
                py: 1.25,
                borderTop: `1px solid ${designTokens.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': { background: designTokens.surfaceMuted },
              }}
            >
              <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
                <AppsRounded
                  sx={{ fontSize: 14, color: designTokens.textMuted }}
                />
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: designTokens.textMuted,
                  }}
                >
                  All collections
                </Typography>
              </Stack>
              <ArrowForwardRounded
                sx={{ fontSize: 14, color: designTokens.textFaint }}
              />
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
