import { CollectionProvider } from '@/components/CollectionProvider';
import { InstantSearch } from '@/components/InstantSearch';
import { SearchSlotsProvider } from '@/components/search/SearchSlotsProvider';
import { useTypesenseClient } from '@/hooks';
import { Box, Grid, Typography } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';
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
              stats: { color: 'text.secondary' },
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
            <Box sx={{ height: 'calc(100vh - 40px)' }}>
              <Typography variant='h3' gutterBottom>
                {collectionId}
              </Typography>
              <Outlet />
            </Box>
          </SearchSlotsProvider>
        </InstantSearch>
      </CollectionProvider>
    </>
  );
}
