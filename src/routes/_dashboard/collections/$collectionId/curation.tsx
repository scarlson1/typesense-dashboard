import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { CurationList } from '../../../../components';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/curation'
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Curation',
  },
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <>
      <Typography variant='h3' gutterBottom>
        Curation
      </Typography>
      <Typography>
        Curation allows you to pin certain records at particular positions or
        hide results, for a given search query.{' '}
        <Link
          href='https://typesense.org/docs/29.0/api/curation.html'
          target='_blank'
          rel='noopener noreferrer'
        >
          Docs
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
        </Link>
      </Typography>
      <Box sx={{ py: { xs: 1.5, md: 2 }, maxWidth: 800 }}>
        <CurationList collectionId={collectionId} />
      </Box>
    </>
  );
}
