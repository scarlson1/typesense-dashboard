import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, Skeleton, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const NewApiKeyEditor = lazy(() => import('../../components/NewApiKeyEditor'));
const ApiKeyGrid = lazy(() => import('@/components/ApiKeyGrid'));

export const Route = createFileRoute('/_dashboard/keys')({
  component: RouteComponent,
  staticData: {
    crumb: 'API Keys',
  },
});

function RouteComponent() {
  return (
    <>
      <Typography variant='h3' gutterBottom>
        API Keys
      </Typography>
      <Typography component='div'>
        API Keys can be used to control access to the data you index in
        Typesense. You can restrict access to particular collections or actions
        using parent API keys. You can also control access to records or even
        fields using{' '}
        <Link
          href='https://typesense.org/docs/29.0/api/api-keys.html#generate-scoped-search-key'
          target='_blank'
          rel='noopener noreferrer'
        >
          Scoped Search API Keys
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.5 }} />
        </Link>
        {'.'}
      </Typography>
      <Typography sx={{ py: 1 }}>
        Use the template below to create a new API key.
      </Typography>
      <Box sx={{ py: 2 }}>
        <Suspense fallback={<Skeleton variant='rounded' height={260} />}>
          <NewApiKeyEditor />
        </Suspense>
      </Box>
      <Box sx={{ py: 1 }}>
        <Suspense fallback={<Skeleton variant='rounded' height={300} />}>
          <ApiKeyGrid />
        </Suspense>
      </Box>
    </>
  );
}
