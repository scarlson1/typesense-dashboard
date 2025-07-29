import { CollectionProvider } from '@/components/CollectionProvider';
import { InstantSearch } from '@/components/InstantSearch';
import { CtxRefinements } from '@/components/search';
import { SearchSlotsProvider } from '@/components/search/SearchSlotsProvider';
import { useDefaultIndexParams, useTypesenseClient } from '@/hooks';
import { GridViewRounded, MapRounded } from '@mui/icons-material';
import {
  Box,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useCallback, useState, type MouseEvent } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search'
)({
  component: SearchLayout,
  staticData: {
    crumb: 'Search',
  },
});

function SearchLayout() {
  const { collectionId } = Route.useParams();
  const [client, clusterId] = useTypesenseClient();

  return (
    <>
      <CollectionProvider
        client={client}
        collectionId={collectionId}
        clusterId={clusterId}
      >
        <InstantSearch<DocumentSchema>
          collectionId={collectionId}
          client={client}
          clusterId={clusterId}
        >
          <SearchSlotsProvider
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
                  // backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                  bgcolor: 'background.paper',
                  opacity: 0.8,
                  backdropFilter: 'blur(8px) opacity(0.87)',
                },
              },
            }}
          >
            {/* <Box sx={{ height: 'calc(100vh - 56px)' }}> */}
            <Box>
              <Stack
                direction='row'
                spacing={2}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: { xs: 0.5, md: 1 },
                }}
              >
                <Typography
                  variant='h3'
                  // gutterBottom
                  sx={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {collectionId}
                </Typography>

                <Stack direction='row' spacing={{ xs: 1, sm: 2 }}>
                  <ViewToggleButtons />

                  <CtxRefinements />
                </Stack>
              </Stack>

              <Outlet />
            </Box>
          </SearchSlotsProvider>
        </InstantSearch>
      </CollectionProvider>
    </>
  );
}

function ViewToggleButtons() {
  const navigate = Route.useNavigate();
  const location = useLocation();
  const [view, setView] = useState(() =>
    location.pathname.includes('map') ? 'map' : 'grid'
  );

  const { geoFieldOptions } = useDefaultIndexParams();
  const enableMap = Boolean(geoFieldOptions.length);

  // useEffect not necessary ?? explicitly navigate below ??
  // better to use useEffect (only rely on url state) ??
  // useEffect(() => {
  //   // console.log(location);
  //   let newView = location.pathname.includes('map') ? 'map' : 'grid';
  //   setView(newView);
  // }, [location?.pathname]);

  const handleViewChange = useCallback(
    (_: MouseEvent<HTMLElement>, nextView: string) => {
      setView(nextView);
      let nextPath = nextView === 'map' ? 'map' : '.';
      navigate({ to: nextPath });
    },
    [navigate]
  );

  return (
    <ToggleButtonGroup
      value={view}
      size='small'
      aria-label='search view'
      exclusive
      onChange={handleViewChange}
    >
      <ToggleButton value='grid' aria-label='grid view'>
        <GridViewRounded fontSize='inherit' />
      </ToggleButton>
      <ToggleButton value='map' aria-label='map view' disabled={!enableMap}>
        <MapRounded fontSize='inherit' />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
