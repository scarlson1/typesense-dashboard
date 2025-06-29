import { OpenInNewRounded } from '@mui/icons-material';
import { Link, Paper, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useStore } from 'zustand';
import { typesenseStore } from '../../../../../utils';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/export'
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Export',
  },
});

function RouteComponent() {
  const { collectionId } = Route.useParams();
  const creds = useStore(typesenseStore, (state) => state.credentials);
  const currKey = useStore(typesenseStore, (state) => state.currentCredsKey);

  let credentials = currKey ? creds[currKey] : null;
  let protocol = credentials?.protocol || '[PROTOCOL]';
  let node = credentials?.node || '[YOUR_NODE]';
  let port = protocol === 'http' ? credentials?.port || '[PORT]' : '';
  let collection = collectionId || '[COLLECTION_NAME]';

  return (
    <>
      <Typography variant='h3' gutterBottom>
        Export Documents
      </Typography>
      <Typography sx={{ pb: 3 }}>
        Export documents from your collection using any of the following
        options.
      </Typography>
      <Typography variant='h6' gutterBottom color='primary'>
        Option 1: Use one of our client libraries
      </Typography>
      <Typography sx={{ pb: 3 }}>
        Use a Typesense client library to export data from your collection using
        any programming language of your choice.{' '}
        <Link
          href='https://typesense.org/docs/28.0/api/documents.html#export-documents'
          target='_blank'
          rel='noopener'
        >
          Read the documentation{' '}
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
        </Link>{' '}
        for more information.
      </Typography>
      <Typography variant='h6' gutterBottom color='primary'>
        Option 2: Download a JSONL file via curl
      </Typography>
      <Typography gutterBottom>
        Run the following commands in your terminal:
      </Typography>
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, my: 2 }}>
        <Typography
          variant='body2'
          color='textSecondary'
          component='pre'
          sx={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'keep-all',
            whiteSpace: 'pre-wrap',
          }}
        >
          <code>{`export TYPESENSE_API_KEY=YOUR_API_KEY`}</code>
          <br />
          <br />
          <code>{`curl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\`}</code>
          <br />
          <code
            style={{ paddingLeft: '24px' }}
          >{`"${protocol}://${node}${port}/collections/${collection}/documents/export" > documents-export-${collection}-6-25-2025--10-40-28-AM.jsonl`}</code>
        </Typography>
      </Paper>
    </>
  );
}
