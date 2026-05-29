import { CollectionProvider } from '@/components/CollectionProvider';
import { InstantSearch } from '@/components/InstantSearch';
import {
  Badge,
  CollectionTabBar,
  MOBILE_BOTTOM_NAV_HEIGHT,
  MobileCollectionScopeStrip,
  PageHeader,
  primaryButtonSx,
} from '@/components/redesign';
import { SearchSlotsProvider } from '@/components/search/SearchSlotsProvider';
import {
  useCollectionSearchPreset,
  useDefaultIndexParams,
  useTypesenseClient,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { AddRounded, GridViewRounded, MapRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Outlet,
  Link as RouterLink,
  useLocation,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router';
import { Suspense, useCallback, useState, type MouseEvent } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search',
)({
  component: SearchLayout,
  staticData: { crumb: 'Search' },
});

function SearchLayout() {
  const { collectionId } = Route.useParams();
  const [client, clusterId] = useTypesenseClient();
  const matchRoute = useMatchRoute();
  const isMapRoute = Boolean(
    matchRoute({
      to: '/collections/$collectionId/documents/search/map',
      params: { collectionId },
    }),
  );

  const { getStoredPreset, getStoredDisplayOptions } =
    useCollectionSearchPreset(clusterId, collectionId);

  const initialPreset = getStoredPreset();
  const storedDisplay = getStoredDisplayOptions();

  const initialSlotProps = storedDisplay
    ? {
        hit: {
          ...(storedDisplay.displayFields !== undefined && {
            displayFields: storedDisplay.displayFields,
          }),
          ...(storedDisplay.imgField !== undefined && {
            imgField: storedDisplay.imgField,
          }),
        },
        hitImg: storedDisplay.backgroundSize
          ? { sx: { backgroundSize: storedDisplay.backgroundSize } }
          : undefined,
        hitWrapper: storedDisplay.columns
          ? { size: 12 / storedDisplay.columns }
          : undefined,
      }
    : {};

  return (
    <CollectionProvider
      client={client}
      collectionId={collectionId}
      clusterId={clusterId}
    >
      <InstantSearch<DocumentSchema>
        key={`instant-search-${collectionId}`}
        collectionId={collectionId}
        client={client}
        clusterId={clusterId}
        initialPreset={initialPreset}
      >
        <SearchSlotsProvider
          key={`search-slots-${collectionId}`}
          collectionId={collectionId}
          slots={{
            hits: Grid,
            hitWrapper: Grid,
          }}
          slotProps={{
            stats: { color: 'text.secondary', sx: { fontSize: '0.7rem' } },
            hits: { container: true, spacing: 2 },
            hitActions: {
              sx: {
                position: 'absolute',
                right: '8px',
                top: '8px',
                bgcolor: 'background.paper',
                opacity: 0.9,
                backdropFilter: 'blur(8px) opacity(0.87)',
                border: `1px solid ${designTokens.border}`,
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(10,37,64,.12)',
              },
            },
            pageSize: {
              label: '',
            },
            ...initialSlotProps,
          }}
        >
          <Stack
            sx={{
              minWidth: 0,
              height: {
                xs: isMapRoute
                  ? '100dvh'
                  : `calc(100dvh - ${MOBILE_BOTTOM_NAV_HEIGHT}px - env(safe-area-inset-bottom))`,
                md: 'calc(100dvh - 48px)',
              },
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flexShrink: 0 }}>
              <Suspense
                fallback={
                  <CollectionPageHeader
                    collectionId={collectionId}
                    numDocs={0}
                  />
                }
              >
                <CollectionPageHeaderConnected collectionId={collectionId} />
              </Suspense>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <CollectionTabBar collectionId={collectionId} />
            </Box>
            <Box
              sx={{
                flex: 1,
                px: { xs: 2.5, md: 3.5 },
                py: 2.5,
                background: designTokens.surfaceTinted,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Outlet />
            </Box>
            <MobileCollectionScopeStrip currentCollectionId={collectionId} />
          </Stack>
        </SearchSlotsProvider>
      </InstantSearch>
    </CollectionProvider>
  );
}

function CollectionPageHeaderConnected({
  collectionId,
}: {
  collectionId: string;
}) {
  const [client, clusterId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clusterId, 'collection', collectionId, 'meta'],
    queryFn: () => client.collections(collectionId).retrieve(),
    staleTime: 1000 * 60,
  });
  return (
    <CollectionPageHeader
      collectionId={collectionId}
      numDocs={data.num_documents ?? 0}
      numFields={data.fields?.length}
    />
  );
}

function CollectionPageHeader({
  collectionId,
  numDocs,
  numFields,
}: {
  collectionId: string;
  numDocs: number;
  numFields?: number;
}) {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const activeTab = matchRoute({
    to: '/collections/$collectionId/synonyms',
    params: { collectionId },
  })
    ? 'Synonyms'
    : matchRoute({
          to: '/collections/$collectionId/curation',
          params: { collectionId },
        })
      ? 'Curation'
      : matchRoute({
            to: '/collections/$collectionId/config',
            params: { collectionId },
          })
        ? 'Schema'
        : matchRoute({
              to: '/collections/$collectionId/documents/new',
              params: { collectionId },
            })
          ? 'Documents'
          : 'Search';

  const tabs = ['Search', 'Documents', 'Schema', 'Synonyms', 'Curation'];

  return (
    <PageHeader
      title={
        <Box
          component='span'
          sx={{ fontFamily: designTokens.fontMono, fontSize: 20 }}
        >
          {collectionId}
        </Box>
      }
      badges={
        <>
          <Badge tone='indigo'>
            <strong style={{ fontWeight: 600 }}>
              {numDocs.toLocaleString()}
            </strong>
            &nbsp;documents
          </Badge>
          {numFields !== undefined ? (
            <Badge tone='neutral'>{numFields} fields</Badge>
          ) : null}
          <Badge tone='success'>healthy</Badge>
        </>
      }
      actions={
        <>
          <ViewToggleButtons />
          <Button
            variant='contained'
            size='small'
            startIcon={<AddRounded sx={{ fontSize: 14 }} />}
            sx={primaryButtonSx}
            component={RouterLink as React.ElementType}
            to='/collections/$collectionId/documents/new'
            params={{ collectionId }}
          >
            <Box
              component='span'
              sx={{ display: { xs: 'none', sm: 'inline' } }}
            >
              Add documents
            </Box>
            <Box
              component='span'
              sx={{ display: { xs: 'inline', sm: 'none' } }}
            >
              Add
            </Box>
          </Button>
        </>
      }
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(t) => {
        const routes: Record<string, string> = {
          Search: '/collections/$collectionId/documents/search',
          Documents: '/collections/$collectionId/documents/new',
          Schema: '/collections/$collectionId/config',
          Synonyms: '/collections/$collectionId/synonyms',
          Curation: '/collections/$collectionId/curation',
        };
        navigate({
          to: routes[t] as never,
          params: { collectionId } as never,
        });
      }}
    />
  );
}

function ViewToggleButtons() {
  const navigate = Route.useNavigate();
  const location = useLocation();
  const [view, setView] = useState(() =>
    location.pathname.includes('map') ? 'map' : 'grid',
  );

  const { geoFieldOptions } = useDefaultIndexParams();
  const enableMap = Boolean(geoFieldOptions.length);

  const handleViewChange = useCallback(
    (_: MouseEvent<HTMLElement>, nextView: string) => {
      if (!nextView) return;
      setView(nextView);
      navigate({ to: nextView === 'map' ? 'map' : '.' });
    },
    [navigate],
  );

  return (
    <ToggleButtonGroup
      value={view}
      size='small'
      aria-label='search view'
      exclusive
      onChange={handleViewChange}
      sx={{
        height: 32,
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          px: 1.5,
          height: 32,
          borderColor: designTokens.border,
          color: designTokens.textMuted,
          fontSize: 12.5,
          '&.Mui-selected': {
            backgroundColor: 'background.paper',
            color: designTokens.text,
            fontWeight: 500,
            boxShadow: '0 1px 1px rgba(0,0,0,.06)',
          },
        },
      }}
    >
      <ToggleButton value='grid' aria-label='grid view'>
        <GridViewRounded fontSize='inherit' sx={{ mr: 0.5 }} />{' '}
        <Typography
          component='span'
          variant='body2'
          sx={{
            display: { xs: 'none', lg: 'block' },
            fontSize: '0.675rem',
            fontWeight: 600,
          }}
        >
          Grid
        </Typography>
      </ToggleButton>
      <ToggleButton value='map' aria-label='map view' disabled={!enableMap}>
        <MapRounded fontSize='inherit' sx={{ mr: 0.5 }} />
        <Typography
          component='span'
          variant='body2'
          sx={{
            display: { xs: 'none', lg: 'block' },
            fontSize: '0.675rem',
            fontWeight: 600,
          }}
        >
          Map
        </Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
