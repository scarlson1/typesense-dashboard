import { Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/collections/')({
  component: RouteComponent,
  staticData: {
    crumb: 'Collections',
  },
});

function RouteComponent() {
  return <Typography variant='h3'>Collections</Typography>;
}
