import { Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/alias')({
  component: RouteComponent,
  staticData: {
    crumb: 'Aliases',
  },
});

function RouteComponent() {
  return <Typography variant='h3'>Aliases</Typography>;
}
