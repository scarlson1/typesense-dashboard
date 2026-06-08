import { collectionQueryKeys } from '@/constants';
import { useTypesenseClient } from '@/hooks';
import { uiStore } from '@/utils';
import { designTokens } from '@/theme/themePrimitives';
import {
  ArrowForwardRounded,
  CheckRounded,
  CloseRounded,
  DatasetRounded,
  KeyboardArrowUpRounded,
  SearchRounded,
} from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { MOBILE_BOTTOM_NAV_HEIGHT } from './MobileBottomNav';

interface MobileCollectionScopeStripProps {
  currentCollectionId: string;
  bottomOffset?: number;
}

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toLocaleString();
};

export function MobileCollectionScopeStrip({
  currentCollectionId,
  bottomOffset = MOBILE_BOTTOM_NAV_HEIGHT,
}: MobileCollectionScopeStripProps) {
  const [client, clusterId] = useTypesenseClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const collapsed = uiStore((s) => s.mobileCollectionScopeCollapsed);
  const setCollapsed = uiStore((s) => s.setMobileCollectionScopeCollapsed);

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

  const current = collections?.find((c) => c.name === currentCollectionId);
  const docCount = current?.num_documents ?? 0;

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

  return (
    <>
      <Box
        sx={{
          display: { xs: collapsed ? 'flex' : 'block', md: 'none' },
          position: 'fixed',
          left: '14px',
          right: '14px',
          bottom: bottomOffset,
          zIndex: (theme) => theme.zIndex.appBar,
          pb: 0.5,
          pt: 0.75,
          pointerEvents: 'none',
          justifyContent: 'flex-end',
        }}
      >
        {collapsed ? (
          <IconButton
            onClick={() => setCollapsed(false)}
            sx={{
              pointerEvents: 'auto',
              width: 44,
              height: 44,
              backgroundColor: 'background.paper',
              border: `1px solid ${designTokens.border}`,
              boxShadow: designTokens.shadowScope,
              color: designTokens.textMuted,
              '&:hover': { borderColor: designTokens.borderStrong },
            }}
          >
            <DatasetRounded sx={{ fontSize: 20 }} />
          </IconButton>
        ) : (
          <Stack
            direction='row'
            onClick={() => setOpen(true)}
            sx={{
              pointerEvents: 'auto',
              alignItems: 'center',
              gap: 0.75,
              pl: 0.5,
              pr: 1.5,
              py: 0.5,
              backgroundColor: 'background.paper',
              border: `1px solid ${designTokens.border}`,
              borderRadius: '999px',
              boxShadow: designTokens.shadowScope,
              cursor: 'pointer',
              '&:hover': { borderColor: designTokens.borderStrong },
            }}
          >
            <IconButton
              size='small'
              aria-label='Collapse collection scope'
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(true);
              }}
              sx={{
                width: 28,
                height: 28,
                color: designTokens.textMuted,
                '&:hover': { color: designTokens.text },
              }}
            >
              <CloseRounded sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: designTokens.textFaint,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Collection
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: designTokens.success,
                flexShrink: 0,
              }}
            />
            <Typography
              noWrap
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: designTokens.text,
                fontFamily: designTokens.fontMono,
                flex: 1,
                minWidth: 0,
              }}
            >
              {currentCollectionId}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: designTokens.textFaint,
                fontFamily: designTokens.fontMono,
                flexShrink: 0,
              }}
            >
              {formatCount(docCount)} docs
            </Typography>
            <KeyboardArrowUpRounded
              sx={{ fontSize: 18, color: designTokens.textFaint, flexShrink: 0 }}
            />
          </Stack>
        )}
      </Box>

      <Drawer
        anchor='bottom'
        open={open}
        onClose={() => {
          setOpen(false);
          setSearch('');
        }}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '88vh',
              backgroundImage: 'none',
              backgroundColor: 'background.paper',
            },
          },
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: designTokens.border,
            mx: 'auto',
            mt: 1,
            mb: 1,
          }}
        />
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
          <SearchRounded
            sx={{ fontSize: 16, color: designTokens.textFaint }}
          />
          <InputBase
            placeholder='Switch collection...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              // 16px keeps iOS Safari from auto-zooming on focus
              '& .MuiInputBase-input': { fontSize: 16 },
            }}
          />
          <Typography
            sx={{
              fontSize: 10,
              color: designTokens.textFaint,
              border: `1px solid ${designTokens.border}`,
              borderRadius: '4px',
              px: 0.625,
              py: 0.2,
              lineHeight: 1.4,
            }}
          >
            esc
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: designTokens.textFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            px: 1.5,
            pt: 1.25,
            pb: 0.5,
          }}
        >
          Recent
        </Typography>

        <Box sx={{ overflowY: 'auto', flex: 1, pb: 0.5 }}>
          {filtered.map((c) => {
            const isSelected = c.name === currentCollectionId;
            return (
              <Stack
                key={c.name}
                direction='row'
                onClick={() => handleSelect(c.name)}
                sx={{
                  px: 1.5,
                  py: 1.125,
                  cursor: 'pointer',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { background: designTokens.surfaceMuted },
                  ...(isSelected && {
                    background: designTokens.accentSoft,
                  }),
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
                    noWrap
                    sx={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: designTokens.text,
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

        <Box
          onClick={() => {
            setOpen(false);
            navigate({ to: '/collections' });
          }}
          sx={{
            px: 1.5,
            py: 1.5,
            borderTop: `1px solid ${designTokens.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            pb: 'calc(env(safe-area-inset-bottom) + 12px)',
          }}
        >
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 500,
              color: designTokens.textMuted,
            }}
          >
            All collections
          </Typography>
          <ArrowForwardRounded
            sx={{ fontSize: 14, color: designTokens.textFaint }}
          />
        </Box>
      </Drawer>
    </>
  );
}
