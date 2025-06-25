import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Card, Link, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/search'
)({
  component: SearchCollection,
});

function SearchCollection() {
  const { collectionId } = Route.useParams();

  return (
    <>
      <Typography variant='h3' gutterBottom>
        {collectionId}
      </Typography>
      <Box sx={{ minHeight: 200 }}>TODO: search</Box>
      <Typography variant='h5' gutterBottom>
        Search Parameters
      </Typography>
      <Typography component='div'>
        These settings control ranking, relevance and search fine-tuning. Use a
        preset to save your configuration, and recall in your application.{' '}
        <Link
          href='https://typesense.org/docs/28.0/api/search.html#search-parameters'
          target='_blank'
          rel='noopener noreferrer'
        >
          Docs
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.5 }} />
        </Link>
      </Typography>

      <Card>
        <SearchParameters />
      </Card>
    </>
  );
}

function SearchParameters() {
  // const [client, clusterId] = useTypesenseClient();

  return (
    <Box>
      <Typography>Query By</Typography>
      <Typography>Facet & Filter By</Typography>
      <Typography>Sort By</Typography>
      <Typography>Group By</Typography>
      <Typography>Additional Search Parameters</Typography>
    </Box>
  );
}
