import { Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/keys')({
  component: RouteComponent,
  staticData: {
    crumb: 'API Keys',
  },
});

function RouteComponent() {
  return <Typography variant='h3'>API Keys</Typography>;
}
