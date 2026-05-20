import {
  Badge,
  PageHeader,
  primaryButtonSx,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { DEFAULT_MONACO_OPTIONS } from '@/constants';
import {
  useAsyncToast,
  useImportDocuments,
  useSchema,
  type MultiDocImportRes,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import type { TypesenseFieldType } from '@/types';
import { typesenseStore } from '@/utils';
import type { OnMount } from '@monaco-editor/react';
import {
  ClearRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
  TerminalRounded,
  CodeRounded,
  EditRounded,
  UploadFileRounded,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
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
} from 'react';
import type { DocumentImportParameters } from 'typesense/lib/Typesense/Documents';
import { useStore } from 'zustand';

const JsonEditor = lazy(() => import('../../../../../components/JsonEditor'));

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/new',
)({
  component: RouteComponent,
  staticData: { crumb: 'Add documents' },
});

type ImportMethod = 'editor' | 'jsonl' | 'curl' | 'sdk';

function RouteComponent() {
  const { collectionId } = Route.useParams();
  const [method, setMethod] = useState<ImportMethod>('editor');

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Add documents'
        badges={
          <Badge tone='neutral'>
            <Box
              component='span'
              sx={{ fontFamily: designTokens.fontMono }}
            >
              {collectionId}
            </Box>
          </Badge>
        }
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/documents.html#index-a-single-document'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            API docs
          </Button>
        }
      />

      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
          gap: 2,
          minHeight: 0,
        }}
      >
        <Stack sx={{ gap: 1.75, minWidth: 0 }}>
          <SectionCard title='Choose a method'>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 1,
              }}
            >
              {(
                [
                  {
                    id: 'editor',
                    label: 'Use editor',
                    sub: 'Paste / edit JSON',
                    icon: <EditRounded sx={{ fontSize: 14 }} />,
                  },
                  {
                    id: 'jsonl',
                    label: 'Upload JSONL',
                    sub: 'curl import',
                    icon: <UploadFileRounded sx={{ fontSize: 14 }} />,
                  },
                  {
                    id: 'curl',
                    label: 'cURL import',
                    sub: 'Via Typesense API',
                    icon: <TerminalRounded sx={{ fontSize: 14 }} />,
                  },
                  {
                    id: 'sdk',
                    label: 'SDK example',
                    sub: 'JS, Python, Go, Ruby',
                    icon: <CodeRounded sx={{ fontSize: 14 }} />,
                  },
                ] as const
              ).map((o) => {
                const active = method === o.id;
                return (
                  <Box
                    key={o.id}
                    onClick={() => setMethod(o.id)}
                    role='button'
                    tabIndex={0}
                    sx={{
                      px: 1.75,
                      py: 1.5,
                      borderRadius: 0.875,
                      textAlign: 'left',
                      background: active
                        ? designTokens.accentSoft
                        : 'background.paper',
                      border: `1px solid ${
                        active
                          ? designTokens.accentBorder
                          : designTokens.border
                      }`,
                      cursor: 'pointer',
                    }}
                  >
                    <Stack
                      direction='row'
                      sx={{ alignItems: 'center', gap: 1, mb: 0.625 }}
                    >
                      <Box
                        sx={{
                          color: active
                            ? designTokens.accent
                            : designTokens.textFaint,
                          display: 'flex',
                        }}
                      >
                        {o.icon}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: active
                            ? designTokens.accentDeep
                            : designTokens.text,
                        }}
                      >
                        {o.label}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{ fontSize: 11.5, color: designTokens.textMuted }}
                    >
                      {o.sub}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </SectionCard>

          {method === 'editor' ? <NewDocumentEditor /> : (
            <CodeSnippetCard
              method={method}
              collectionId={collectionId}
            />
          )}
        </Stack>

        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          <SchemaPreviewCard collectionId={collectionId} />
          <CurlSampleCard collectionId={collectionId} />
        </Stack>
      </Box>
    </Stack>
  );
}

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
    const schema = data?.fields.reduce((acc, cur) => {
      const placeholder = getFieldPlaceholderValue(cur.type);
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

  const handleMount: OnMount = useCallback((ed) => {
    editorRef.current = ed;
  }, []);

  const handleSubmit = useCallback(() => {
    const val = editorRef.current?.getValue();
    if (markers.length)
      return toast.warn('Invalid JSON', { id: 'monaco-validation' });
    if (!val) return toast.warn('value required');

    const formatted = toJsonLinesString(JSON.parse(val));

    mutation.mutate({
      collectionId,
      documents: formatted,
      options: { action, dirty_values: dirtyValues, return_id: true },
    });
  }, [collectionId, markers, action, dirtyValues, mutation, toast]);

  return (
    <SectionCard
      title={
        <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
          Document editor
          <Badge tone='warn'>⚠ Prefilled from schema · expect imperfections</Badge>
        </Stack>
      }
      footer={
        <>
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel id='action-select-label'>Action</InputLabel>
            <Select
              label='Action'
              value={action}
              onChange={handleUpdateMethod}
              labelId='action-select-label'
              id='action-select'
            >
              <MenuItem value='create'>create</MenuItem>
              <MenuItem value='upsert'>upsert</MenuItem>
              <MenuItem value='update'>update</MenuItem>
              <MenuItem value='emplace'>emplace</MenuItem>
            </Select>
            <FormHelperText>
              <Link
                href='https://typesense.org/docs/28.0/api/documents.html#index-multiple-documents'
                target='_blank'
                rel='noopener noreferrer'
                sx={{ color: designTokens.accent }}
              >
                Action mode docs
              </Link>
            </FormHelperText>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel id='dirty-values-select-label'>
              Dirty values
            </InputLabel>
            <Select
              label='Dirty values'
              value={dirtyValues || ''}
              onChange={handleDirtyValues}
              labelId='dirty-values-select-label'
              id='dirty-values-select'
            >
              <MenuItem value=''>(default)</MenuItem>
              <MenuItem value='coerce_or_reject'>coerce_or_reject</MenuItem>
              <MenuItem value='coerce_or_drop'>coerce_or_drop</MenuItem>
              <MenuItem value='drop'>drop</MenuItem>
              <MenuItem value='reject'>reject</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleSubmit}
            disabled={Boolean(markers.length)}
            variant='contained'
            sx={primaryButtonSx}
          >
            Add documents
          </Button>
        </>
      }
      noBodyPadding
    >
      <Suspense fallback={<Skeleton variant='rounded' height={'50vh'} />}>
        <JsonEditor
          height='50vh'
          onMount={handleMount}
          options={DEFAULT_MONACO_OPTIONS}
          value={value}
          onValidate={(m) => setMarkers(m)}
          schema={undefined}
        />
      </Suspense>
      <Box sx={{ px: 2.25, py: 1.5 }}>
        <MultiDocImportResult results={results} clearResults={clearResults} />
      </Box>
    </SectionCard>
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

  const handleOpen = useCallback(() => setOpen((o) => !o), []);
  const handleClearResults = useCallback(() => clearResults(), [clearResults]);

  if (!results.length) return null;

  return (
    <>
      <Stack
        direction='row'
        spacing={1}
        sx={{ justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}
      >
        <Button
          size='small'
          onClick={handleOpen}
          sx={smallButtonSx}
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
          sx={smallButtonSx}
          endIcon={<ClearRounded fontSize='small' />}
        >
          Clear
        </Button>
      </Stack>
      <Collapse in={open}>
        <Stack sx={{ gap: 0.5, mt: 1 }}>
          {results.map((r) => (
            <Alert
              key={r.id}
              severity={r.success ? 'success' : 'error'}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >{`[ID: ${r.id}] - ${(r.error as string) || `import success: ${r.success}`}`}</Alert>
          ))}
        </Stack>
      </Collapse>
    </>
  );
}

function CodeSnippetCard({
  method,
  collectionId,
}: {
  method: ImportMethod;
  collectionId: string;
}) {
  const creds = useStore(typesenseStore, (state) => state.credentials);
  const currKey = useStore(typesenseStore, (state) => state.currentCredsKey);
  const credentials = currKey ? creds[currKey] : null;
  const protocol = credentials?.protocol || '[PROTOCOL]';
  const node = credentials?.node || '[YOUR_NODE]';
  const port = protocol === 'http' ? credentials?.port || '[PORT]' : '';
  const collection = collectionId || '[COLLECTION_NAME]';

  const url = `${protocol}://${node}${port ? `:${port}` : ''}/collections/${collection}/documents/import?action=create`;

  let title = '';
  let snippet = '';
  if (method === 'jsonl') {
    title = 'Upload JSONL via cURL';
    snippet = `export TYPESENSE_API_KEY=YOUR_API_KEY

curl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\
  -X POST \\
  -T documents.jsonl \\
  "${url}"`;
  } else if (method === 'curl') {
    title = 'Convert JSON → JSONL, then import';
    snippet = `jq -c '.[]' documents.json > documents.jsonl

export TYPESENSE_API_KEY=YOUR_API_KEY

curl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\
  -X POST \\
  -T documents.jsonl \\
  "${url}"`;
  } else {
    title = 'JavaScript SDK';
    snippet = `import Typesense from 'typesense';
const client = new Typesense.Client({
  nodes: [{ host: '${node}', port: ${port || 443}, protocol: '${protocol}' }],
  apiKey: 'YOUR_API_KEY',
});
await client.collections('${collection}').documents()
  .import(documents, { action: 'create' });`;
  }

  return (
    <SectionCard title={title}>
      <Box
        component='pre'
        sx={{
          m: 0,
          background: designTokens.codeSurface,
          color: designTokens.codeText,
          borderRadius: 1,
          p: 2,
          fontFamily: designTokens.fontMono,
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {snippet}
      </Box>
    </SectionCard>
  );
}

function SchemaPreviewCard({ collectionId }: { collectionId: string }) {
  const { data } = useSchema(collectionId);
  const fields = data?.fields?.slice(0, 6) ?? [];
  const total = data?.fields?.length ?? 0;

  return (
    <SectionCard
      title='Schema preview'
      description={`${total} fields available on this collection.`}
    >
      {fields.map((f) => (
        <Box
          key={f.name}
          sx={{
            px: 1.25,
            py: 1,
            background: designTokens.surfaceTinted,
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 12,
              color: designTokens.text,
              fontWeight: 500,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {f.name}
          </Box>
          <Box
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 10.5,
              color: designTokens.textMuted,
            }}
          >
            {f.type}
          </Box>
          {!f.optional ? (
            <Box
              component='span'
              sx={{
                fontSize: 9.5,
                fontWeight: 700,
                color: designTokens.danger,
                letterSpacing: '0.05em',
              }}
            >
              REQ
            </Box>
          ) : null}
        </Box>
      ))}
      {total > 6 ? (
        <Typography
          sx={{ fontSize: 11.5, color: designTokens.textFaint, mt: 0.5 }}
        >
          +{total - 6} more fields…
        </Typography>
      ) : null}
    </SectionCard>
  );
}

function CurlSampleCard({ collectionId }: { collectionId: string }) {
  const creds = useStore(typesenseStore, (state) => state.credentials);
  const currKey = useStore(typesenseStore, (state) => state.currentCredsKey);
  const credentials = currKey ? creds[currKey] : null;
  const protocol = credentials?.protocol || '[PROTOCOL]';
  const node = credentials?.node || '[YOUR_NODE]';
  const port = protocol === 'http' ? credentials?.port || '[PORT]' : '';

  return (
    <Box
      sx={{
        background: designTokens.codeSurface,
        borderRadius: 1,
        p: 1.75,
        color: designTokens.codeText,
      }}
    >
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 600,
          color: designTokens.textFaint,
          mb: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Equivalent cURL
      </Typography>
      <Box
        component='pre'
        sx={{
          m: 0,
          fontFamily: designTokens.fontMono,
          fontSize: 11,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {`curl -H "X-TYPESENSE-API-KEY: $KEY" \\
  -X POST \\
  -T docs.jsonl \\
  "${protocol}://${node}${port ? `:${port}` : ''}/collections/`}
        <Box component='span' sx={{ color: '#9bc5ff' }}>
          {collectionId}
        </Box>
        {`/documents/import?action=`}
        <Box component='span' sx={{ color: '#9bc5ff' }}>
          create
        </Box>
        {'"'}
      </Box>
    </Box>
  );
}

function toJsonLinesString(jsonArray: unknown[]) {
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
      return [34.0549, 118.2426];
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
      return { key: 'value' };
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
