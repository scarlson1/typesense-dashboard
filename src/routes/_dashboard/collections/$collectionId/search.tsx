import { Typography } from '@mui/material';
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
      <Typography variant='h3'>Search</Typography>
      <Typography>{`Collection: ${collectionId}`}</Typography>
    </>
  );
}
