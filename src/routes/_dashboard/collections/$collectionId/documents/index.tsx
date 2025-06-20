import { Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/'
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Documents',
  },
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <>
      <Typography variant='h3'>Documents</Typography>
      <Typography>{`Collection: ${collectionId}`}</Typography>
    </>
  );
}
