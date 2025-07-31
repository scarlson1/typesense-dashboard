import { DEFAULT_MONACO_OPTIONS } from '@/constants';
import {
  useAsyncToast,
  useCollectionEditorDialog,
  useImportDocuments,
  useSchema,
  type MultiDocImportRes,
} from '@/hooks';
import type { TypesenseFieldType } from '@/types';
import { typesenseStore } from '@/utils';
import type { OnMount } from '@monaco-editor/react';
import {
  ClearRounded,
  CloseRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { editor } from 'monaco-editor';
import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DocumentImportParameters } from 'typesense/lib/Typesense/Documents';
import { useStore } from 'zustand';

const JsonEditor = lazy(() => import('../../../../../components/JsonEditor'));

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
    <Box sx={{ maxWidth: 920 }}>
      <Box sx={{ py: 2 }}>
        <Typography variant='h3' gutterBottom>
          Add Documents
        </Typography>
        <Typography variant='h6' color='primary' gutterBottom>
          Option 1: Typesense client libraries
        </Typography>
        <Typography component='div'>
          Use one of Typesense's client libraries to import data into your
          collection.{' '}
          <Link
            href='https://typesense.org/docs/29.0/api/documents.html#index-a-single-document'
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
        {/* <Paper sx={{ p: { xs: 1.5, sm: 2 }, my: 2 }}>
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
        </Paper> */}
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
        <SchemaWarningAlert />
        <Box>
          <NewDocumentEditor />
        </Box>
      </Box>
    </Box>
  );
}

const DEFAULT_VIEW_OPTIONS = { ...DEFAULT_MONACO_OPTIONS, readOnly: true };

function SchemaWarningAlert() {
  const collectionId = Route.useParams({
    select: ({ collectionId }) => collectionId,
  });
  const [open, setOpen] = useState(true);

  const { data } = useSchema(collectionId);

  const viewSchema = useCollectionEditorDialog({
    initialOptions: DEFAULT_VIEW_OPTIONS,
  });

  const handleClick = useCallback(() => {
    viewSchema({
      title: `${collectionId} Schema`,
      value: JSON.stringify(data, null, 2),
    });
  }, [viewSchema, data]);

  const handleDismiss = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Collapse in={open}>
      <Alert
        severity='warning'
        sx={{ my: 1, maxWidth: 1000 }}
        action={
          <Stack direction='row' spacing={1}>
            <Box>
              <Button color='inherit' size='small' onClick={handleClick}>
                View&nbsp;Schema
              </Button>
            </Box>

            <Box>
              <IconButton size='small' onClick={() => handleDismiss()}>
                <CloseRounded fontSize='inherit' />
              </IconButton>
            </Box>
          </Stack>
        }
      >
        The prefilled schema is derived from the collection schema. Expect
        imperfections, especially for nested fields and "auto" schemas.
      </Alert>
    </Collapse>
  );
}

// BUG: opening schema in dialog editor disrupts new doc schema validation
// pass ID to editor ?? ref issue ??
// https://stackoverflow.com/questions/77135467/different-monaco-editor-components-sharing-same-schema

function NewDocumentEditor() {
  const collectionId = Route.useParams({
    select: ({ collectionId }) => collectionId,
  });
  const toast = useAsyncToast();
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const [action, setAction] =
    useState<DocumentImportParameters['action']>('create');
  const [dirtyValues, setDirtyValues] =
    useState<DocumentImportParameters['dirty_values']>();
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  const { data } = useSchema(collectionId);

  const value = useMemo(() => {
    let schema = data?.fields.reduce((acc, cur) => {
      let placeholder = getFieldPlaceholderValue(cur.type);
      return placeholder !== null ? { ...acc, [cur.name]: placeholder } : acc;
    }, {});

    return JSON.stringify([schema], null, 2);
  }, [data?.fields]);

  const [mutation, results, clearResults] = useImportDocuments();

  const handleUpdateMethod = useCallback((e: SelectChangeEvent) => {
    setAction(e.target.value as DocumentImportParameters['action']);
  }, []);

  const handleDirtyValues = useCallback((e: SelectChangeEvent) => {
    setDirtyValues(e.target.value as DocumentImportParameters['dirty_values']);
  }, []);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const handleSubmit = useCallback(() => {
    const val = editorRef.current?.getValue();

    if (markers.length)
      return toast.warn('Invalid JSON', { id: 'monaco-validation' });
    if (!val) return toast.warn(`value required`);

    let formatted = toJsonLinesString(JSON.parse(val));

    mutation.mutate({
      collectionId,
      documents: formatted,
      options: { action, dirty_values: dirtyValues, return_id: true },
    });
  }, [collectionId, markers, action, dirtyValues]);

  return (
    <Box sx={{ py: 2, borderRadius: 1, overflow: 'hidden' }}>
      <Suspense fallback={<Skeleton variant='rounded' height={'50vh'} />}>
        <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <JsonEditor
            height='50vh'
            onMount={handleMount}
            options={DEFAULT_MONACO_OPTIONS}
            value={value}
            onValidate={(m) => {
              setMarkers(m);
            }}
            // schema={{}}
            schema={undefined}
          />
        </Paper>
      </Suspense>
      <Stack
        direction='row'
        spacing={2}
        sx={{
          my: 2,
          display: 'flex',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
        useFlexGap
      >
        <FormControl size='small' fullWidth sx={{ maxWidth: 190 }}>
          <InputLabel id='action-select-label'>Action Mode</InputLabel>
          <Select
            label='Action Mode'
            value={action}
            onChange={handleUpdateMethod}
            labelId='action-select-label'
            id='action-select'
            size='small'
          >
            <MenuItem value={'create'}>create</MenuItem>
            <MenuItem value={'upsert'}>upsert</MenuItem>
            <MenuItem value={'update'}>update</MenuItem>
            <MenuItem value={'emplace'}>emplace</MenuItem>
          </Select>
          <FormHelperText component='div'>
            <Link
              href='https://typesense.org/docs/28.0/api/documents.html#index-multiple-documents'
              target='_blank'
              rel='noopener noreferrer'
            >
              Action mode insert docs{' '}
              <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
            </Link>
          </FormHelperText>
        </FormControl>
        <FormControl size='small' fullWidth sx={{ maxWidth: 190 }}>
          <InputLabel id='dirty-values-select-label'>
            Dirty Values Behavior
          </InputLabel>
          <Select
            label='Dirty Values Behavior'
            value={dirtyValues || ''}
            onChange={handleDirtyValues}
            labelId='dirty-values-select-label'
            id='dirty-values-select'
            size='small'
          >
            <MenuItem value={''}></MenuItem>
            <MenuItem value={'coerce_or_reject'}>coerce_or_reject</MenuItem>
            <MenuItem value={'coerce_or_drop'}>coerce_or_drop</MenuItem>
            <MenuItem value={'drop'}>drop</MenuItem>
            <MenuItem value={'reject'}>reject</MenuItem>
          </Select>
          <FormHelperText component='div'>
            <Link
              href='https://typesense.org/docs/28.0/api/documents.html#dealing-with-dirty-data'
              target='_blank'
              rel='noopener noreferrer'
            >
              Dirty values docs{' '}
              <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
            </Link>
          </FormHelperText>
        </FormControl>
        <Button
          onClick={() => handleSubmit()}
          disabled={Boolean(markers.length)}
          variant='contained'
        >
          Add
        </Button>
      </Stack>
      <MultiDocImportResult results={results} clearResults={clearResults} />
    </Box>
  );
}

function MultiDocImportResult({
  results,
  clearResults,
}: {
  results: MultiDocImportRes[];
  clearResults: () => void;
}) {
  const [open, setOpen] = useState(true);

  const handleOpen = useCallback(() => {
    setOpen((o) => !o);
  }, []);

  const handleClearResults = useCallback(() => {
    clearResults();
  }, []);

  return (
    <>
      {Boolean(results.length) ? (
        <Stack
          direction='row'
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center', py: 1 }}
        >
          <Button
            size='small'
            onClick={handleOpen}
            endIcon={
              open ? (
                <ExpandLessRounded fontSize='small' />
              ) : (
                <ExpandMoreRounded fontSize='small' />
              )
            }
          >
            {open ? 'hide results' : 'show results'}
          </Button>
          <Button
            size='small'
            onClick={handleClearResults}
            sx={{ mb: 1 }}
            endIcon={<ClearRounded fontSize='small' />}
          >
            Clear results
          </Button>
        </Stack>
      ) : null}
      <Collapse in={open && Boolean(results?.length)}>
        {results.map((r) => (
          <Alert
            key={r.id}
            severity={r.success ? 'success' : 'error'}
            sx={{
              maxWidth: 760,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >{`[ID: ${r.id}] - ${(r.error as string) || `import success: ${r.success}`}`}</Alert>
        ))}
      </Collapse>
    </>
  );
}

function toJsonLinesString(jsonArray: any[]) {
  return jsonArray.map((obj) => JSON.stringify(obj)).join('\n');
}

function getFieldPlaceholderValue(fieldType: TypesenseFieldType) {
  switch (fieldType) {
    case 'auto':
      return null;
    case 'bool':
      return false;
    case 'bool[]':
      return [true, false];
    case 'float':
      return 3.14159;
    case 'float[]':
      return [3.12159];
    case 'geopoint':
      return [34.0549, 118.2426]; // ['LAT','LNG']
    case 'geopoint[]':
      return [
        [34.0549, 118.2426],
        [35.4792, 117.2389],
      ];
    case 'geopolygon':
      return [34.0549, 35.4792, 118.2426, 117.2389];
    case 'image':
      return 'base64 encoded string of an image';
    case 'int32':
      return 0;
    case 'int32[]':
      return [0, 1];
    case 'int64':
      return 0;
    case 'int64[]':
      return [0, 1];
    case 'object':
      return {
        key: 'value',
      };
    case 'object[]':
      return [{ key: 'value' }];
    case 'string':
      return 'string value';
    case 'string*':
      return 'string or string[]';
    case 'string[]':
      return ['string value'];
    default:
      return null;
  }
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
