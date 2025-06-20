import { Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/config'
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Config',
  },
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <>
      <Typography variant='h3'>Collection Settings</Typography>
      <Typography>{`Collection: ${collectionId}`}</Typography>
    </>
  );
}
