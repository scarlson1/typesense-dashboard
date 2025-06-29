import { Editor } from '@monaco-editor/react';
import { OpenInNewRounded } from '@mui/icons-material';
import { Alert, Box, Link, Paper, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import { JsonEditor } from '../../../../../components';
import {
  collectionQueryKeys,
  DEFAULT_MONACO_OPTIONS,
} from '../../../../../constants';
import { useTypesenseClient } from '../../../../../hooks';
import { typesenseStore } from '../../../../../utils';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/new'
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Add Documents',
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
      <Box sx={{ py: 2 }}>
        <Typography variant='h3'>Add Documents</Typography>
        <Typography variant='overline'>{collectionId}</Typography>
        <Typography variant='h6' color='primary' gutterBottom>
          Option 1: Typesense client libraries
        </Typography>
        <Typography component='div'>
          Use one of Typesense's client libraries to import data into your
          collection.{' '}
          <Link
            href='https://typesense.org/docs/28.0/api/documents.html#index-a-single-document'
            target='_blank'
            rel='noopener noreferrer'
          >
            Read the documentation{' '}
            <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
          </Link>{' '}
          for more information. Here are some{' '}
          <Link
            href='https://typesense.org/docs/guide/syncing-data-into-typesense.html#tips-when-importing-data'
            target='_blank'
            rel='noopener noreferrer'
          >
            tips <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
          </Link>{' '}
          from Typesense to successfully import large volumes of data.
        </Typography>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant='h6' color='primary' gutterBottom>
          Option 2: Upload a JSONL file via curl
        </Typography>
        <Typography>
          Create a file named documents.jsonl with your documents and then run
          the following commands in your terminal:
        </Typography>
        <Code>
          <code>{`export TYPESENSE_API_KEY=YOUR_API_KEY`}</code>
          <br />
          <br />
          <code>{`curl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\`}</code>
          <br />
          <code style={{ paddingLeft: '24px' }}>{`-X POST \\`}</code>
          <br />
          <code style={{ paddingLeft: '24px' }}>{`-T documents.jsonl \\`}</code>
          <br />
          {/* <code
              style={{ paddingLeft: '24px' }}
            >{`"https://qby6512jgsvrwim7p-1.a1.typesense.net/collections/orders/documents/import?action=create"`}</code> */}
          <code
            style={{ paddingLeft: '24px' }}
          >{`"${protocol}://${node}${port ? `:${port}` : ''}/collections/${collection}/documents/import?action=create"`}</code>
        </Code>
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, my: 2 }}>
          <Editor
            language='shell'
            height='150px'
            options={{
              ...DEFAULT_MONACO_OPTIONS,
              readOnly: true,
              scrollBeyondLastLine: false,
            }}
            value={`jq -c '.[]' documents.json > documents.jsonl\n\nexport TYPESENSE_API_KEY=YOUR_API_KEY\n\ncurl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\\n\t-T documents.jsonl \\\n\t"${protocol}://${node}${port ? `:${port}` : ''}/collections/${collection}/documents/import?action=create"`}
            // style={{ backgroundColor: 'inherit'}}
            className='editor-container'
          />
        </Paper>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant='h6' color='primary' gutterBottom>
          Option 3: Upload a JSON file
        </Typography>
        <Typography>
          Create a file named documents.json with your documents as a JSON array
          and then run the following commands in your terminal:
        </Typography>

        <Code>
          <code>{`# Convert from JSON to JSONL before importing.`}</code>
          <br />
          <code>{`# Make sure you have \`jq\` installed.`}</code>
          <br />
          <br />
          <code>{`jq -c '.[]' documents.json > documents.jsonl`}</code>
          <br />
          <br />
          <code>{`export TYPESENSE_API_KEY=YOUR_API_KEY`}</code>
          <br />
          <br />
          <code>{`curl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\`}</code>
          <br />
          <code style={{ paddingLeft: '24px' }}>{`-X POST \\`}</code>
          <br />
          <code style={{ paddingLeft: '24px' }}>{`-T documents.jsonl \\`}</code>
          <br />
          <code
            style={{ paddingLeft: '24px' }}
          >{`"${protocol}://${node}${port ? `:${port}` : ''}/collections/${collection}/documents/import?action=create"`}</code>
        </Code>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant='h6' color='primary' gutterBottom>
          Option 4: Upload a CSV file
        </Typography>
        <Typography>
          Create a file named documents.csv with your documents (including a
          header row) and run the following commands in your terminal
        </Typography>

        <Code>
          <code>{`# Convert from JSON to JSONL before importing.`}</code>
          <br />
          <code>{`# Make sure you have miller installed: https://github.com/johnkerl/miller`}</code>
          <br />
          <br />
          <code>{`mlr --icsv --ojsonl cat documents.csv > documents.jsonl`}</code>
          <br />
          <br />
          <code>{`export TYPESENSE_API_KEY=YOUR_API_KEY`}</code>
          <br />
          <br />
          <code>{`curl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\`}</code>
          <br />
          <code style={{ paddingLeft: '24px' }}>{`-X POST \\`}</code>
          <br />
          <code style={{ paddingLeft: '24px' }}>{`-T documents.jsonl \\`}</code>
          <br />
          <code
            style={{ paddingLeft: '24px' }}
          >{`"${protocol}://${node}${port ? `:${port}` : ''}/collections/${collection}/documents/import?action=create"`}</code>
        </Code>
      </Box>

      <Box sx={{ py: 2 }}>
        <Typography variant='h6' color='primary' gutterBottom>
          Option 5: Use the document editor below
        </Typography>
        <Typography>
          Edit the template documents below and click on Add at the bottom of
          the editor.
        </Typography>
        <Box>
          <NewDocumentEditor />
        </Box>
      </Box>
    </>
  );
}

function NewDocumentEditor() {
  const collectionId = Route.useParams({
    select: ({ collectionId }) => collectionId,
  });
  const [client, clusterId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: collectionQueryKeys.schema(clusterId, collectionId),
    queryFn: () => client.collections(collectionId).retrieve(),
  });

  return (
    <>
      <Alert severity='warning'>
        TODO: monaco editor with prefilled schema
      </Alert>
      <Box sx={{ py: 2, borderRadius: 1, overflow: 'hidden' }}>
        <JsonEditor
          height='50vh'
          // schema={COLLECTION_SCHEMA}
          options={DEFAULT_MONACO_OPTIONS}
          value={JSON.stringify(data)}
        />
      </Box>
    </>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
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
        {children}
      </Typography>
    </Paper>
  );
}
