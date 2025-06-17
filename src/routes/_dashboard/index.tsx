import { Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/')({
  component: HomeComponent,
});

function HomeComponent() {
  return <Typography variant='h3'>Home</Typography>;
}
