import { PresetsList } from '@/components/PresetsList';
import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/presets')({
  component: RouteComponent,
  staticData: {
    crumb: 'Presets',
  },
});

function RouteComponent() {
  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant='h3' gutterBottom>
        Presets
      </Typography>
      <Typography sx={{ textAlign: 'justify' }} gutterBottom>
        Presets allow you to manage search parameters in Typesense, and
        reference just the preset name in your application. This way, you can
        change search parameters without having to make code changes.{' '}
        <Link
          href='https://typesense.org/docs/29.0/api/search.html#presets'
          target='_blank'
          rel='noopener noreferrer'
        >
          Read the documentation
          <OpenInNewRounded fontSize='inherit' />
        </Link>{' '}
        for more information on available options.
      </Typography>

      <Box sx={{ py: 2 }}>
        <PresetsList />
      </Box>
    </Box>
  );
}
