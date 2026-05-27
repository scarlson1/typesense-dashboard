import { MOBILE_BOTTOM_NAV_HEIGHT, SectionCard } from '@/components/redesign';
import {
  ConfigurePanel,
  ContextHits,
  CtxPageSize,
  CtxPagination,
  CtxRefinements,
  CtxSearchError,
  DashboardDisplayOptions,
  SearchBox,
} from '@/components/search';
import { CtxFacetOptions } from '@/components/search/FacetOptions';
import { CtxSortBy } from '@/components/search/SortBy';
import { UpdateSearchParameters } from '@/components/UpdateSearchParameters';
import { designTokens } from '@/theme/themePrimitives';
import { useSearch } from '@/hooks';
import {
  ClearRounded,
  CloseRounded,
  KeyboardArrowUpRounded,
  SearchRounded,
  TuneRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Fade,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  type Theme,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useMemo, useState } from 'react';

const SCOPE_STRIP_HEIGHT = 52;

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search/',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { collectionId } = Route.useParams();
  const mobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [configTab, setConfigTab] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { params } = useSearch();

  const filterCount = useMemo(() => {
    if (!params?.filter_by) return 0;
    return params.filter_by
      .split('&&')
      .map((f) => f.trim())
      .filter(Boolean).length;
  }, [params?.filter_by]);

  const perPage = useMemo(() => {
    if (!params?.per_page) return undefined;
    return typeof params.per_page === 'string'
      ? parseInt(params.per_page, 10)
      : params.per_page;
  }, [params?.per_page]);

  const configPanel = (
    <ConfigurePanel
      tab={configTab}
      onTabChange={setConfigTab}
      filterCount={filterCount}
      refineContent={<RefineTabContent />}
      paramsContent={
        <Suspense
          fallback={
            <Box sx={{ height: 200, background: designTokens.surfaceMuted }} />
          }
        >
          <UpdateSearchParameters
            key={`update-search-${collectionId}`}
            collectionId={collectionId}
          />
        </Suspense>
      }
      displayContent={
        <DashboardDisplayOptions key={`display-opts-${collectionId}`} />
      }
    />
  );

  return (
    <Box sx={{ pb: mobile ? `${SCOPE_STRIP_HEIGHT + 8}px` : 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 2.5 },
          alignItems: 'flex-start',
        }}
      >
        {/* ── Main content (left) ── */}
        <Stack sx={{ flex: 1, minWidth: 0, gap: 2, width: '100%' }}>
          {/* Search bar */}
          <Box
            sx={{
              backgroundColor: 'background.paper',
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1,
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SearchRounded
              sx={{ fontSize: 18, color: designTokens.textFaint, flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <SearchBox
                placeholder='Search...'
                variant='standard'
                size='small'
                sx={{
                  my: 0,
                  '& .MuiInput-root': {
                    fontSize: 14,
                    '&:before, &:after': { display: 'none' },
                  },
                  '& .MuiFormHelperText-root': { display: 'none' },
                }}
              />
            </Box>
            {/* Inline stats: desktop (md+) only */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
              }}
            >
              <CompactStats />
            </Box>
            {/* Refinements filter icon: mobile (xs/sm) only */}
            <Box sx={{ display: { xs: 'contents', md: 'none' } }}>
              <CtxRefinements />
            </Box>
          </Box>

          {/* ── Stats line + sort indicator ── */}
          <Stack
            direction='row'
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.5,
              mt: -1,
            }}
          >
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <CompactStatsLine />
            </Box>
            <Box sx={{ flex: 1 }} />
            <SortIndicator />
          </Stack>

          {/* ── Filter chips ── */}
          <ActiveFilterChips />

          <CtxSearchError />
          <ContextHits />

          {/* ── Pagination ── */}
          <Stack
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-end', md: 'center' },
              gap: 1.5,
            }}
          >
            <ResultsCount />
            <Stack
              direction='row'
              spacing={2}
              sx={{
                flex: '1 1 auto',
                justifyContent: { xs: 'space-between', md: 'flex-end' },
                alignItems: 'center',
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <CtxPageSize />
              <CtxPagination />
            </Stack>
          </Stack>
        </Stack>

        {/* ── Desktop sidebar (md+) ── */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: { md: 340, lg: 380 },
            flexShrink: 0,
            position: 'sticky',
            top: 16,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
          }}
        >
          <SectionCard noBodyPadding>{configPanel}</SectionCard>
        </Box>
      </Box>

      {/* ── Mobile bottom bar + drawer ── */}
      {mobile && (
        <>
          <MobileConfigureBar
            filterCount={filterCount}
            perPage={perPage}
            onOpen={() => setDrawerOpen(true)}
          />
          <Drawer
            anchor='bottom'
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            slotProps={{
              paper: {
                sx: {
                  maxHeight: '88vh',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                },
              },
            }}
          >
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
              <Stack
                direction='row'
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
                  <TuneRounded
                    sx={{ fontSize: 18, color: designTokens.textMuted }}
                  />
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: designTokens.text,
                    }}
                  >
                    Configure
                  </Typography>
                </Stack>
                <IconButton
                  onClick={() => setDrawerOpen(false)}
                  size='small'
                  sx={{
                    width: 32,
                    height: 32,
                    color: designTokens.textMuted,
                  }}
                >
                  <CloseRounded sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Box>
            <Box sx={{ overflowY: 'auto', flex: 1 }}>{configPanel}</Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}

// ── Refine tab content ──

const RefineTabContent = () => (
  <Stack spacing={2.5}>
    <Box>
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 600,
          color: designTokens.textFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 1,
        }}
      >
        Sort by
      </Typography>
      <Box sx={{ '& .MuiFormControl-root': { width: '100%' } }}>
        <CtxSortBy />
      </Box>
    </Box>
    <CtxFacetOptions />
  </Stack>
);

// ── Compact stats inside the search bar (right side, desktop) ──

const CompactStats = () => {
  const { data, isLoading, isFetching } = useSearch();
  if (!data?.found && !isLoading && !isFetching) return null;

  return (
    <Stack
      direction='row'
      spacing={0.75}
      sx={{
        alignItems: 'center',
        flexShrink: 0,
        fontSize: 12,
        color: designTokens.textFaint,
        fontFamily: designTokens.fontMono,
        whiteSpace: 'nowrap',
      }}
    >
      {data?.found !== undefined ? (
        <Typography
          component='span'
          sx={{
            fontSize: 12,
            color: designTokens.textMuted,
            fontFamily: 'inherit',
          }}
        >
          {data.found.toLocaleString()} results
          {data.search_time_ms !== undefined
            ? ` · ${data.search_time_ms}ms`
            : ''}
        </Typography>
      ) : null}
      <Fade in={isLoading || isFetching}>
        <CircularProgress size={12} />
      </Fade>
    </Stack>
  );
};

// ── Stats line below the search bar (mobile) ──

const CompactStatsLine = () => {
  const { data, isLoading, isFetching } = useSearch();

  return (
    <Stack
      direction='row'
      spacing={0.5}
      sx={{ alignItems: 'center', lineHeight: 1 }}
    >
      <Typography sx={{ fontSize: 12, color: designTokens.textMuted }}>
        {data?.found !== undefined ? (
          <>
            <Box
              component='span'
              sx={{ fontWeight: 600, color: designTokens.text }}
            >
              {data.found.toLocaleString()}
            </Box>{' '}
            results
            {data.search_time_ms !== undefined ? (
              <Box component='span' sx={{ color: designTokens.textFaint }}>
                {' · '}
                {data.search_time_ms}ms
              </Box>
            ) : null}
          </>
        ) : null}
      </Typography>
      <Fade in={isLoading || isFetching}>
        <CircularProgress size={10} />
      </Fade>
    </Stack>
  );
};

// ── Sort indicator ──

const SortIndicator = () => {
  const { params } = useSearch();
  const sortBy = params?.sort_by;
  if (!sortBy) return null;

  return (
    <Typography
      sx={{
        fontSize: 12.5,
        color: designTokens.textMuted,
        fontFamily: designTokens.fontMono,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Box component='span' sx={{ color: designTokens.textFaint }}>
        Sort:
      </Box>{' '}
      {sortBy} ↓
    </Typography>
  );
};

// ── Active filter chips ──

const ActiveFilterChips = () => {
  const { params, setParams } = useSearch();
  const filterBy = params?.filter_by;
  if (!filterBy) return null;

  const filters = filterBy
    .split('&&')
    .map((f) => f.trim())
    .filter(Boolean);
  if (!filters.length) return null;

  const handleRemoveFilter = (index: number) => {
    const updated = filters.filter((_, i) => i !== index).join(' && ');
    setParams({ filter_by: updated || undefined });
  };

  const handleClearAll = () => {
    setParams({ filter_by: undefined });
  };

  return (
    <Stack
      direction='row'
      sx={{ gap: 0.75, flexWrap: 'wrap', alignItems: 'center', mt: -0.5 }}
    >
      <Typography
        sx={{ fontSize: 12, color: designTokens.textFaint, mr: 0.25 }}
      >
        Filters:
      </Typography>
      {filters.map((f, i) => (
        <Chip
          key={`${f}-${i}`}
          label={f}
          size='small'
          onDelete={() => handleRemoveFilter(i)}
          deleteIcon={<ClearRounded sx={{ fontSize: 14 }} />}
          sx={{
            height: 26,
            fontFamily: designTokens.fontMono,
            fontSize: 11.5,
            background: designTokens.accentSoft,
            color: designTokens.accentDeep,
            border: `1px solid ${designTokens.accentBorder}`,
            borderRadius: '6px',
            '& .MuiChip-deleteIcon': {
              color: designTokens.accentDeep,
              fontSize: 14,
              '&:hover': { color: designTokens.text },
            },
          }}
        />
      ))}
      <Button
        size='small'
        onClick={handleClearAll}
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          textTransform: 'none',
          minWidth: 'auto',
          px: 0.75,
          '&:hover': { color: designTokens.text },
        }}
      >
        Clear all
      </Button>
    </Stack>
  );
};

// ── "Showing X-Y of Z results" ──

const ResultsCount = () => {
  const { data } = useSearch();
  if (!data?.found) return null;

  const page = data.page ?? 1;
  const perPage = data.request_params?.per_page ?? 10;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, data.found);

  return (
    <Typography sx={{ fontSize: 12.5, color: designTokens.textMuted }}>
      Showing{' '}
      <Box component='span' sx={{ fontWeight: 600, color: designTokens.text }}>
        {start}–{end}
      </Box>{' '}
      of{' '}
      <Box component='span' sx={{ fontWeight: 600, color: designTokens.text }}>
        {data.found.toLocaleString()}
      </Box>{' '}
      results
    </Typography>
  );
};

// ── Mobile bottom configure bar ──

const MobileConfigureBar = ({
  filterCount,
  perPage,
  onOpen,
}: {
  filterCount: number;
  perPage?: number;
  onOpen: () => void;
}) => {
  const summary = [
    filterCount > 0 ? `${filterCount} filter${filterCount > 1 ? 's' : ''}` : null,
    perPage ? `per_page ${perPage}` : null,
    'unsaved',
  ]
    .filter(Boolean)
    .join(' · ');

  const bottomPos = MOBILE_BOTTOM_NAV_HEIGHT + SCOPE_STRIP_HEIGHT + 4;

  return (
    <Stack
      direction='row'
      onClick={onOpen}
      sx={{
        position: 'fixed',
        bottom: bottomPos,
        left: 12,
        right: 12,
        zIndex: (theme) => theme.zIndex.appBar,
        backgroundColor: 'background.paper',
        border: `1px solid ${designTokens.border}`,
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(10,37,64,.1)',
        px: 1.75,
        py: 1,
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
      }}
    >
      <TuneRounded sx={{ fontSize: 18, color: designTokens.textMuted }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 13, fontWeight: 600, color: designTokens.text }}
        >
          Configure
        </Typography>
        {summary && (
          <Typography
            noWrap
            sx={{
              fontSize: 11.5,
              color: designTokens.textFaint,
              fontFamily: designTokens.fontMono,
            }}
          >
            {summary}
          </Typography>
        )}
      </Box>
      {filterCount > 0 && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 22,
            height: 22,
            borderRadius: '11px',
            fontSize: 12,
            fontWeight: 600,
            px: 0.5,
            backgroundColor: designTokens.accent,
            color: designTokens.onAccent,
          }}
        >
          {filterCount}
        </Box>
      )}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        size='small'
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: designTokens.text,
          color: designTokens.surface,
          '&:hover': { backgroundColor: designTokens.text, opacity: 0.9 },
        }}
      >
        <KeyboardArrowUpRounded sx={{ fontSize: 20 }} />
      </IconButton>
    </Stack>
  );
};
