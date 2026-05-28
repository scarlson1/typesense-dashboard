import GeoSearch from '@/components/GeoSearch';
import {
  ContextHits,
  CtxPageSize,
  CtxPagination,
  CtxSearchError,
  DashboardDisplayOptions,
  SearchBox,
} from '@/components/search';
import { designTokens } from '@/theme/themePrimitives';
import { useDefaultIndexParams, useHits, useSearch, useSchema } from '@/hooks';
import { typesenseFieldType } from '@/types';
import {
  CloseRounded,
  OpenInNewRounded,
  SearchRounded,
  SettingsRounded,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  ClickAwayListener,
  Drawer,
  Fade,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Popper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  type PopperProps,
  type SelectChangeEvent,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useRef, useState } from 'react';

// Height of MobileCollectionScopeStrip — keep in sync with that component
const SCOPE_STRIP_HEIGHT = 52;

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search/map',
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Map',
  },
});

function RouteComponent() {
  const mobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { geoFieldOptions } = useDefaultIndexParams();
  const [geoFieldName, setGeoFieldName] = useState<string | null>(
    () => geoFieldOptions[0] || null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hits = useHits();
  const hitCount = useMemo(() => hits?.found, [hits]);

  const { collectionId } = Route.useParams();
  const schema = useSchema(collectionId);

  const isGeopoint = useMemo(() => {
    if (!geoFieldName) return true;
    const field = schema.data.fields.find((f) => f.name === geoFieldName);
    return field?.type === 'geopoint';
  }, [schema, geoFieldName]);

  if (!isGeopoint)
    throw new Error(
      `only "geopoint" field type is supported in the current version`,
    );

  const enableMap = Boolean(geoFieldOptions.length);

  if (!enableMap)
    return (
      <Alert severity='warning' sx={{ my: 5, mx: 'auto', maxWidth: 600 }}>
        <AlertTitle>Geo field required</AlertTitle>
        {`Collection must have at least one '${typesenseFieldType.enum.geopoint}' or '${typesenseFieldType.enum['geopoint[]']}' field in the collection in order for geosearch to work.`}{' '}
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
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        // Cancel the parent content-area padding so the map is edge-to-edge
        m: -2.5,
      }}
    >
      {/* ── Mobile: search bar pinned above the map ── */}
      {mobile && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            py: 0.875,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'background.paper',
            borderBottom: `1px solid ${designTokens.border}`,
            zIndex: 2,
          }}
        >
          <SearchRounded
            sx={{ fontSize: 18, color: designTokens.textFaint, flexShrink: 0 }}
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

      {/* ── Map ── */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, position: 'relative' }}>
        {geoFieldName ? (
          <Paper
            sx={{
              height: '100%',
              position: 'relative',
              borderRadius: { xs: 0, sm: 1 },
            }}
          >
            <GeoSearch geoFieldName={geoFieldName} />
          </Paper>
        ) : (
          <Typography sx={{ p: 3 }}>
            Select a geography field to get started
          </Typography>
        )}
      </Box>

      {/* ── Mobile: results strip below map (inline, no portal) ── */}
      {mobile && (
        <Box
          sx={{
            flexShrink: 0,
            backgroundColor: 'background.paper',
            borderTop: `1px solid ${designTokens.border}`,
            // Pad the bottom so scope strip doesn't cover results
            pb: `${SCOPE_STRIP_HEIGHT}px`,
          }}
        >
          <Stack
            direction='row'
            sx={{
              px: 2,
              py: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: 13, color: designTokens.textMuted }}>
              {hitCount !== undefined
                ? `${hitCount.toLocaleString()} results`
                : ''}
            </Typography>
            <IconButton
              size='small'
              onClick={() => setSettingsOpen(true)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                border: `1px solid ${designTokens.border}`,
                color: designTokens.textFaint,
                background: designTokens.surface,
                '&:hover': {
                  color: designTokens.text,
                  borderColor: designTokens.borderStrong,
                },
              }}
            >
              <SettingsRounded sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
          <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
            <Box sx={{ px: 2, pb: 1.5 }}>
              <ContextHits hitWrapperProps={{ size: 12 }} />
            </Box>
          </Box>
        </Box>
      )}

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
            {/* Search bar card */}
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
                top: 0,
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
              <DisplayOptionsButton
                setGeoFieldName={setGeoFieldName}
                geoFieldName={geoFieldName || ''}
                geoFieldOptions={geoFieldOptions}
              />
            </Box>
            <CtxSearchError />
            <ContextHits hitWrapperProps={{ size: 12 }} />
          </Stack>
          <Box sx={{ py: 1, mx: 'auto' }}>
            <CtxPagination />
          </Box>
        </Box>
      )}

      {/* ── Mobile: settings drawer ── */}
      <Drawer
        anchor='bottom'
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '88vh',
              backgroundColor: 'background.paper',
              backgroundImage: 'none',
            },
          },
        }}
      >
        {/* Grab handle */}
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
        <Box
          sx={{
            overflow: 'auto',
            px: 2.5,
            pb: 'calc(env(safe-area-inset-bottom) + 24px)',
            pt: 1,
          }}
        >
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{ mb: 1.5 }}
          >
            <Typography
              sx={{
                fontSize: 16,
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

          <FormControl fullWidth size='small' sx={{ mb: 2 }}>
            <InputLabel id='geo-field-label-drawer'>Geo field</InputLabel>
            <Select
              labelId='geo-field-label-drawer'
              value={geoFieldName || ''}
              label='Geo field'
              onChange={(e: SelectChangeEvent) => setGeoFieldName(e.target.value)}
            >
              {geoFieldOptions.map((o, i) => (
                <MenuItem value={o} key={`${o}-${i}`}>
                  {o}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction='row' sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography sx={{ fontSize: 13, color: designTokens.text, whiteSpace: 'nowrap' }}>
              Hits per page
            </Typography>
            <CtxPageSize />
          </Stack>

          <Box sx={{ pt: 1.5, borderTop: `1px solid ${designTokens.border}` }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: designTokens.text,
                mb: 1,
              }}
            >
              Display fields
            </Typography>
            <DashboardDisplayOptions />
          </Box>
        </Box>
      </Drawer>
    </Box>
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
          {data.search_time_ms !== undefined ? ` · ${data.search_time_ms}ms` : ''}
        </Typography>
      ) : null}
      <Fade in={isLoading || isFetching}>
        <CircularProgress size={10} />
      </Fade>
    </Stack>
  );
}

interface DisplayOptionsButtonProps extends Omit<PopperProps, 'open' | 'anchorEl'> {
  setGeoFieldName: (field: string) => void;
  geoFieldName: string;
  geoFieldOptions: string[];
}

function DisplayOptionsButton({
  setGeoFieldName,
  geoFieldName,
  geoFieldOptions,
  ...props
}: DisplayOptionsButtonProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const handleClose = (e: Event | React.SyntheticEvent) => {
    if (anchorRef.current?.contains(e.target as HTMLElement)) return;
    setOpen(false);
  };

  const handleGeoFieldChange = useCallback((event: SelectChangeEvent) => {
    setGeoFieldName(event.target.value);
  }, [setGeoFieldName]);

  return (
    <>
      <IconButton
        ref={anchorRef}
        size='small'
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          color: designTokens.textFaint,
          border: `1px solid ${designTokens.border}`,
          background: designTokens.surface,
          flexShrink: 0,
          '&:hover': {
            color: designTokens.text,
            borderColor: designTokens.borderStrong,
          },
        }}
      >
        <SettingsRounded sx={{ fontSize: 14 }} />
      </IconButton>
      <Popper open={open} anchorEl={anchorRef.current} placement='bottom-end' {...props}>
        <ClickAwayListener onClickAway={handleClose} mouseEvent='onMouseUp'>
          <Paper
            sx={{
              width: 400,
              maxWidth: '90vw',
              p: 2,
              bgcolor: 'background.paper',
              border: `1px solid ${designTokens.border}`,
              zIndex: 2200,
              maxHeight: '70vh',
              overflowY: 'auto',
              borderRadius: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.06)',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: designTokens.text, mb: 1.5 }}>
              Map settings
            </Typography>
            <Stack spacing={1.5}>
              <FormControl fullWidth size='small'>
                <InputLabel id='geo-field-label'>Geo field</InputLabel>
                <Select
                  labelId='geo-field-label'
                  value={geoFieldName || ''}
                  label='Geo field'
                  onChange={handleGeoFieldChange}
                >
                  {geoFieldOptions.map((o, i) => (
                    <MenuItem value={o} key={`${o}-${i}`}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction='row' sx={{ alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: designTokens.text, whiteSpace: 'nowrap' }}>
                  Hits per page
                </Typography>
                <CtxPageSize />
              </Stack>
              <Box sx={{ pt: 1.5, borderTop: `1px solid ${designTokens.border}` }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: designTokens.text, mb: 1 }}>
                  Display fields
                </Typography>
                <DashboardDisplayOptions />
              </Box>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
