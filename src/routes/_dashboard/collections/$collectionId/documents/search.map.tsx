import GeoSearch from '@/components/GeoSearch';
import {
  ContextHits,
  CtxPageSize,
  CtxPagination,
  CtxSearchError,
  CtxSearchStats,
  DashboardDisplayOptions,
  SearchBox,
} from '@/components/search';
import { useDefaultIndexParams, useHits, useSchema } from '@/hooks';
import { typesenseFieldType } from '@/types';
import { OpenInNewRounded, SettingsRounded } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  ClickAwayListener,
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
  type SelectChangeEvent,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';

const SwipeableEdgeDrawer = lazy(
  () => import('@/components/SwipeableEdgeDrawer')
);

// TODO: filter / display settings for mobile (number of results, pagination, etc.)

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search/map'
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
    () => geoFieldOptions[0] || null
  );

  const hits = useHits();
  const hitCount = useMemo(() => hits?.found, [hits]);

  const { collectionId } = Route.useParams();
  const schema = useSchema(collectionId);

  // TODO: support geopoint[] layer type ??
  let isGeopoint = useMemo(() => {
    if (!geoFieldName) return true;
    let field = schema.data.fields.find((f) => f.name === geoFieldName);
    return field?.type === 'geopoint';
  }, [schema]);

  if (!isGeopoint)
    throw new Error(
      `only "geopoint" field type is supported in the current version`
    );

  let enableMap = Boolean(geoFieldOptions.length);

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
        position: 'fixed',
        top: { xs: 128, md: 100 },
        left: { xs: 0, md: 240 },
        right: 0,
        bottom: 0,
        display: 'flex',
      }}
    >
      {mobile ? (
        <Suspense>
          <SwipeableEdgeDrawer
            tabContent={
              hitCount !== undefined ? (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>
                  {`${hitCount} results`}
                </Typography>
              ) : null
            }
          >
            {/* <Alert severity='warning' sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
              <AlertTitle>Swipeable Drawer Bug</AlertTitle>
              Touch scroll issue when rendered above map:{' '}
              <Link
                href='https://github.com/mui/material-ui/issues/37814'
                target='_blank'
                rel='noopener noreferrer'
                // sx={{ ml: 0.25 }}
              >
                https://github.com/mui/material-ui/issues/37814{' '}
                <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
              </Link>
            </Alert> */}
            <ContextHits hitWrapperProps={{ size: 12 }} />
            <Box sx={{ py: 1, mx: 'auto' }}>
              <CtxPagination />
            </Box>
          </SwipeableEdgeDrawer>
        </Suspense>
      ) : null}

      <Box sx={{ flex: '1 1 auto', height: '100%' }}>
        {geoFieldName ? (
          <Paper
            sx={{
              height: '100%',
              position: 'relative',
            }}
          >
            <GeoSearch geoFieldName={geoFieldName} />
          </Paper>
        ) : (
          <Typography>Select geography field to get started</Typography>
        )}
      </Box>

      {!mobile ? (
        <Box
          sx={{
            flex: { sm: '0 0 280px', lg: '0 0 340px' },
            minWidth: 0,
            height: '100%',
            px: 2,
            // overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            direction='column'
            spacing={{ xs: 0.5, sm: 1, md: 2 }}
            sx={{ flex: '1 1 auto', overflowY: 'auto' }}
          >
            <Box
              sx={{
                bgcolor: 'background.default',
                pb: 1,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <Stack
                direction='row'
                spacing={1}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  my: 1,
                }}
              >
                <SearchBox sx={{ mb: 1 }} />
                <DisplayOptionsButton
                  setGeoFieldName={setGeoFieldName}
                  geoFieldName={geoFieldName || ''}
                  geoFieldOptions={geoFieldOptions}
                />
              </Stack>

              <CtxSearchStats />
              <CtxSearchError />
            </Box>

            <ContextHits hitWrapperProps={{ size: 12 }} />
          </Stack>

          <Box sx={{ py: 1, mx: 'auto' }}>
            <CtxPagination />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

interface DashboardDisplayOptionsProps {
  setGeoFieldName: (field: string) => void;
  geoFieldName: string;
  geoFieldOptions: string[];
}

function DisplayOptionsButton({
  setGeoFieldName,
  geoFieldName,
  geoFieldOptions,
}: DashboardDisplayOptionsProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (e: Event | React.SyntheticEvent) => {
    if (anchorRef.current?.contains(e.target as HTMLElement)) return;
    setOpen(false);
  };

  const handleGeoFieldChange = useCallback((event: SelectChangeEvent) => {
    setGeoFieldName(event.target.value);
  }, []);

  return (
    <>
      <IconButton
        ref={anchorRef}
        size='small'
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleToggle}
      >
        <SettingsRounded fontSize='inherit' />
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement='bottom-end'
        role={undefined}
      >
        <ClickAwayListener onClickAway={handleClose} mouseEvent='onMouseUp'>
          <Paper
            ref={paperRef}
            sx={{
              width: 500,
              maxWidth: '90vw',
              py: { xs: 2, sm: 3 },
              px: 1.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              zIndex: 1200,
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', pb: 2 }}>
              <Typography sx={{ textAlign: 'right', flex: '0 0 25%', mr: 2 }}>
                Geo field
              </Typography>
              <FormControl
                sx={{ minWidth: 120, flex: '1 1 auto' }}
                size='small'
              >
                <InputLabel id='geo-field-label'>Geo field</InputLabel>
                <Select
                  labelId='geo-field-label'
                  id='geo-field-select'
                  value={geoFieldName || ''}
                  label='Geo field'
                  onChange={handleGeoFieldChange}
                >
                  {geoFieldOptions.map((o, i) => (
                    <MenuItem value={o} key={`${o}-${i}`}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', pb: 2 }}>
              <Typography sx={{ textAlign: 'right', flex: '0 0 25%', mr: 2 }}>
                Hits limit
              </Typography>
              <CtxPageSize />
            </Box>

            <DashboardDisplayOptions />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
