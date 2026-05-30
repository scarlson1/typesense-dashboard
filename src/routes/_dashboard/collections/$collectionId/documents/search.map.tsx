import GeoSearch from '@/components/GeoSearch';
import { MOBILE_BOTTOM_NAV_HEIGHT } from '@/components/redesign';
import {
  ContextHits,
  CtxPageSize,
  CtxPagination,
  CtxSearchError,
  DashboardDisplayOptions,
  SearchBox,
} from '@/components/search';
import { useDefaultIndexParams, useHits, useSchema, useSearch } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseFieldType } from '@/types';
import {
  CloseRounded,
  KeyboardArrowUpRounded,
  OpenInNewRounded,
  SearchRounded,
  SettingsRounded,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Drawer,
  Fade,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  type SelectChangeEvent,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search/map',
)({
  component: RouteComponent,
  staticData: { crumb: 'Map' },
});

const sectionLabelSx = {
  fontSize: 10.5,
  fontWeight: 700,
  color: designTokens.textFaint,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.07em',
  mb: 0.75,
};

const sectionBoxSx = {
  border: `1px solid ${designTokens.border}`,
  borderRadius: '8px',
  p: '10px',
};

const rowSelectSx = {
  '& .MuiSelect-select': {
    py: '6px !important',
    px: '10px !important',
    fontSize: 12.5,
    fontFamily: designTokens.fontMono,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: designTokens.border,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: designTokens.borderStrong,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: designTokens.accent,
    borderWidth: 1,
  },
  backgroundColor: designTokens.surface,
  borderRadius: '6px',
};

function RouteComponent() {
  const mobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { geoFieldOptions } = useDefaultIndexParams();
  const [geoFieldName, setGeoFieldName] = useState<string | null>(
    () => geoFieldOptions[0] || null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [selectedHitId, setSelectedHitId] = useState<string | null>(null);
  const suppressNextDrawerClose = useRef(false);

  const handlePinClick = useCallback(
    (id: string) => {
      setSelectedHitId(id);
      if (mobile) {
        suppressNextDrawerClose.current = true;
        setResultsOpen(true);
      }
    },
    [mobile],
  );

  useEffect(() => {
    if (!selectedHitId) return;
    const delay = mobile ? 350 : 0;
    const timer = setTimeout(() => {
      document
        .querySelector(`[data-hit-id="${selectedHitId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, delay);
    return () => clearTimeout(timer);
  }, [selectedHitId, mobile]);

  const hits = useHits();
  const hitCount = useMemo(() => hits?.found, [hits]);

  const { collectionId } = Route.useParams();
  const schema = useSchema(collectionId);

  const isGeopoint = useMemo(() => {
    if (!geoFieldName) return true;
    const field = schema.data.fields.find((f) => f.name === geoFieldName);
    return field?.type === 'geopoint';
  }, [schema, geoFieldName]);

  if (!Boolean(import.meta.env.VITE_MAPBOX_TOKEN)) {
    return (
      <Box sx={{ maxWidth: 500, p: 2, mx: 'auto', my: 6 }}>
        <Alert severity='warning' sx={{ borderRadius: 0 }}>
          <AlertTitle>No API key configured</AlertTitle>
          This cluster is connected without a Typesense API key. Add
          VITE_MAPBOX_TOKEN to environment variables to enable geo search.
        </Alert>
      </Box>
    );
  }

  if (!isGeopoint)
    throw new Error(
      `only "geopoint" field type is supported in the current version`,
    );

  const enableMap = Boolean(geoFieldOptions.length);

  if (!enableMap)
    return (
      <Alert severity='warning' sx={{ my: 5, mx: 'auto', maxWidth: 600 }}>
        <AlertTitle>Geo field required</AlertTitle>
        {`Collection must have at least one '${typesenseFieldType.enum.geopoint}' or '${typesenseFieldType.enum['geopoint[]']}' field.`}{' '}
        <Link
          href='https://typesense.org/docs/29.0/api/geosearch.html#geosearch'
          target='_blank'
          rel='noopener noreferrer'
        >
          Documentation{' '}
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
        </Link>
      </Alert>
    );

  return (
    <>
      {/* Outer wrapper: flex-1 so it fills the Outlet container, m:-2.5 cancels parent padding */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          flex: '1 1 0',
          minHeight: 0,
          m: -2.5,
        }}
      >
        {/* ── Mobile search bar ── */}
        {mobile && (
          <Box
            sx={{
              flexShrink: 0,
              px: 2,
              py: 0.5, // 0.875,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'background.paper',
              borderBottom: `1px solid ${designTokens.border}`,
              zIndex: 2,
            }}
          >
            <SearchRounded
              sx={{
                fontSize: 18,
                color: designTokens.textFaint,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <SearchBox
                placeholder='Search…'
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
            <MapCompactStats />
          </Box>
        )}

        {/* ── Map (fills remaining flex space) ── */}
        <Box sx={{ flex: '1 1 0', minHeight: 0, position: 'relative' }}>
          {geoFieldName ? (
            <Paper
              sx={{
                height: '100%',
                position: 'relative',
                borderRadius: { xs: 0, sm: 1 },
              }}
            >
              <GeoSearch
                geoFieldName={geoFieldName}
                onPinClick={handlePinClick}
              />
            </Paper>
          ) : (
            <Typography sx={{ p: 3 }}>
              Select a geography field to get started ⛭
            </Typography>
          )}
        </Box>

        {/* ── Desktop: side panel ── */}
        {!mobile && (
          <Box
            sx={{
              flex: { sm: '0 0 280px', lg: '0 0 340px' },
              minWidth: 0,
              height: '100%',
              px: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack
              direction='column'
              spacing={1}
              sx={{ flex: '1 1 auto', overflowY: 'auto' }}
            >
              {/* Search bar */}
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  border: `1px solid ${designTokens.border}`,
                  borderRadius: 1,
                  px: 1.25,
                  py: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  position: 'sticky',
                  top: 8,
                  zIndex: 10,
                }}
              >
                <SearchRounded
                  sx={{
                    fontSize: 16,
                    color: designTokens.textFaint,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <SearchBox
                    placeholder='Search…'
                    variant='standard'
                    size='small'
                    sx={{
                      my: 0,
                      '& .MuiInput-root': {
                        fontSize: 13,
                        '&:before, &:after': { display: 'none' },
                      },
                      '& .MuiFormHelperText-root': { display: 'none' },
                    }}
                  />
                </Box>
                <MapCompactStats />
                {/* Settings gear — opens the side drawer */}
                <IconButton
                  size='small'
                  onClick={() => setSettingsOpen(true)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    color: settingsOpen
                      ? designTokens.text
                      : designTokens.textFaint,
                    border: `1px solid ${settingsOpen ? designTokens.borderStrong : designTokens.border}`,
                    background: settingsOpen
                      ? designTokens.surfaceMuted
                      : designTokens.surface,
                    flexShrink: 0,
                    '&:hover': {
                      color: designTokens.text,
                      borderColor: designTokens.borderStrong,
                    },
                  }}
                >
                  <SettingsRounded sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
              <CtxSearchError />
              <ContextHits
                hitWrapperProps={{ size: 12 }}
                selectedHitId={selectedHitId}
              />
            </Stack>
            <Box sx={{ py: 1, mx: 'auto' }}>
              <CtxPagination />
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Mobile: floating action buttons (fixed above scope strip) ── */}
      {mobile && (
        <Stack
          direction='row'
          spacing={1}
          sx={{
            position: 'fixed',
            alignItems: 'center',
            bottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT + 56}px + env(safe-area-inset-bottom))`,
            right: 12,
            zIndex: (theme) => theme.zIndex.appBar + 50,
          }}
        >
          {hitCount !== undefined && (
            <Box
              component='button'
              onClick={() => setResultsOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.375,
                fontSize: 12,
                fontWeight: 600,
                color: 'white',
                background: 'rgba(10,20,40,0.65)',
                backdropFilter: 'blur(4px)',
                borderRadius: '100px',
                pl: 1.5,
                pr: 1,
                py: 0.5,
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {hitCount.toLocaleString()} results
              <KeyboardArrowUpRounded sx={{ fontSize: 16, opacity: 0.8 }} />
            </Box>
          )}
          <IconButton
            size='small'
            onClick={() => setSettingsOpen(true)}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              color: designTokens.textMuted,
              '&:hover': { color: designTokens.text },
            }}
          >
            <SettingsRounded sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      )}

      {/* ── Mobile: results drawer (bottom sheet) ── */}
      <Drawer
        anchor='bottom'
        open={resultsOpen}
        onClose={() => {
          if (suppressNextDrawerClose.current) {
            suppressNextDrawerClose.current = false;
            return;
          }
          setResultsOpen(false);
        }}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '70vh',
              backgroundColor: 'background.paper',
              backgroundImage: 'none',
              display: 'flex',
              flexDirection: 'column',
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
            mb: 0.5,
            flexShrink: 0,
          }}
        />
        <Stack
          direction='row'
          sx={{
            px: 2.5,
            pb: 1,
            flexShrink: 0,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: designTokens.text,
              letterSpacing: '-0.01em',
            }}
          >
            {hitCount !== undefined
              ? `${hitCount.toLocaleString()} results`
              : 'Results'}
          </Typography>
          <IconButton size='small' onClick={() => setResultsOpen(false)}>
            <CloseRounded sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
        <Box sx={{ flex: 1, overflowY: 'auto', px: 0.5 }}>
          <ContextHits
            hitWrapperProps={{ size: 12 }}
            selectedHitId={selectedHitId}
          />
        </Box>
        <Box
          sx={{
            py: 1,
            mx: 'auto',
            flexShrink: 0,
            pb: 'calc(env(safe-area-inset-bottom) + 8px)',
          }}
        >
          <CtxPagination />
        </Box>
      </Drawer>

      {/* ── Settings: side drawer (used by both mobile & desktop) ── */}
      <Drawer
        anchor='right'
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '85vw', sm: 320 },
              backgroundColor: 'background.paper',
              backgroundImage: 'none',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Stack
          direction='row'
          sx={{
            px: 2,
            py: 1.5,
            flexShrink: 0,
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${designTokens.border}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: designTokens.text,
              letterSpacing: '-0.01em',
            }}
          >
            Map settings
          </Typography>
          <IconButton size='small' onClick={() => setSettingsOpen(false)}>
            <CloseRounded sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 2,
            pb: 'calc(env(safe-area-inset-bottom) + 16px)',
          }}
        >
          <MapSettingsContent
            geoFieldName={geoFieldName || ''}
            geoFieldOptions={geoFieldOptions}
            onGeoFieldChange={setGeoFieldName}
          />
        </Box>
      </Drawer>
    </>
  );
}

interface MapSettingsContentProps {
  geoFieldName: string;
  geoFieldOptions: string[];
  onGeoFieldChange: (v: string) => void;
}

function MapSettingsContent({
  geoFieldName,
  geoFieldOptions,
  onGeoFieldChange,
}: MapSettingsContentProps) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={sectionLabelSx}>Map</Typography>
        <Box sx={sectionBoxSx}>
          <Stack spacing={0.75}>
            <Stack direction='row' sx={{ gap: 1.25, alignItems: 'center' }}>
              <Typography
                sx={{
                  fontSize: 12,
                  color: designTokens.textMuted,
                  flexShrink: 0,
                  width: 64,
                }}
              >
                Geo field
              </Typography>
              <Select
                fullWidth
                size='small'
                value={geoFieldName}
                onChange={(e: SelectChangeEvent) =>
                  onGeoFieldChange(e.target.value)
                }
                sx={rowSelectSx}
              >
                {geoFieldOptions.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Stack direction='row' sx={{ gap: 1.25, alignItems: 'center' }}>
              <Typography
                sx={{
                  fontSize: 12,
                  color: designTokens.textMuted,
                  flexShrink: 0,
                  width: 64,
                }}
              >
                Per page
              </Typography>
              <CtxPageSize />
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box>
        <Typography sx={sectionLabelSx}>Display</Typography>
        <Box sx={sectionBoxSx}>
          <DashboardDisplayOptions compact />
        </Box>
      </Box>
    </Stack>
  );
}

function MapCompactStats() {
  const { data, isLoading, isFetching } = useSearch();
  if (!data?.found && !isLoading && !isFetching) return null;

  return (
    <Stack
      direction='row'
      spacing={0.5}
      sx={{ alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      {data?.found !== undefined ? (
        <Typography
          component='span'
          sx={{
            fontSize: 11.5,
            color: designTokens.textFaint,
            fontFamily: designTokens.fontMono,
          }}
        >
          {data.found.toLocaleString()}
          {data.search_time_ms !== undefined
            ? ` · ${data.search_time_ms}ms`
            : ''}
        </Typography>
      ) : null}
      <Fade in={isLoading || isFetching}>
        <CircularProgress size={10} />
      </Fade>
    </Stack>
  );
}
