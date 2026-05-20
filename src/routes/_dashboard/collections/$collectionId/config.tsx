import { ErrorFallback } from '@/components';
import {
  Badge,
  dangerButtonSx,
  PageHeader,
  primaryButtonSx,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { COLLECTION_SCHEMA, DEFAULT_MONACO_OPTIONS } from '@/constants';
import {
  useAsyncToast,
  useDeleteCollection,
  useDialog,
  useSchema,
  useUpdateCollection,
} from '@/hooks';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { designTokens } from '@/theme/themePrimitives';
import { getCollectionUpdates } from '@/utils/getCollectionUpdates';
import type { EditorProps, OnMount } from '@monaco-editor/react';
import { CheckRounded, ContentCopyRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  type ButtonProps,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import { editor } from 'monaco-editor';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';

const JsonEditor = lazy(() => import('../../../../components/JsonEditor'));

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/config',
)({
  component: CollectionSettings,
  staticData: { crumb: 'Config' },
});

function CollectionSettings() {
  const { collectionId } = Route.useParams();
  const toast = useAsyncToast();
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const [options, setOptions] = useState<EditorProps['options']>(
    DEFAULT_MONACO_OPTIONS,
  );
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dialog = useDialog();

  const { data } = useSchema(collectionId);

  const mutation = useUpdateCollection({
    onSettled: () => {
      setOptions((o) => ({ ...o, readOnly: false }));
    },
  });

  const handleUpdateSchema = useCallback(async () => {
    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }

    const value = editorRef.current?.getValue();
    if (!value) return;
    const { fields, metadata } = JSON.parse(value);

    setOptions((o) => ({ ...o, readOnly: true }));

    const fieldUpdates = getCollectionUpdates(data.fields, fields);

    if (!fieldUpdates.length) {
      toast.info(`no field changes made`);
      setOptions((o) => ({ ...o, readOnly: false }));
      return;
    }

    const updates: CollectionUpdateSchema = { fields: fieldUpdates };
    if (metadata) updates.metadata = metadata;

    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Confirm updates to ${collectionId} schema`,
        content: (
          <Suspense fallback={<Skeleton variant='rounded' height='50vh' />}>
            <JsonEditor
              height='50vh'
              options={{ ...DEFAULT_MONACO_OPTIONS, readOnly: true }}
              value={JSON.stringify(updates, null, 2)}
              schema={{}}
            />
          </Suspense>
        ),
        slotProps: {
          dialog: { fullScreen, maxWidth: 'sm', fullWidth: true },
          cancelButton: { children: 'cancel' },
          acceptButton: { children: 'confirm' },
        },
      });

      mutation.mutate({ colName: collectionId, updates });
    } catch (err) {
      console.log('cancelled schema update', err);
    }
  }, [mutation, data, markers, dialog]);

  const handleEditorDidMount: OnMount = (ed) => {
    editorRef.current = ed;
  };

  useEffect(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, [data]);

  const handleCopyJSON = useCallback(() => {
    const value = editorRef.current?.getValue() ?? JSON.stringify(data);
    void navigator.clipboard.writeText(value);
    toast.success('Schema copied');
  }, [data, toast]);

  const fieldsCount = data.fields?.length ?? 0;

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Schema'
        badges={
          <>
            <Badge tone='neutral'>{fieldsCount} fields</Badge>
            {data.enable_nested_fields ? (
              <Badge tone='indigo'>nested fields enabled</Badge>
            ) : null}
            <Badge tone='success'>in sync</Badge>
          </>
        }
        actions={
          <>
            <Button
              variant='outlined'
              size='small'
              startIcon={<ContentCopyRounded sx={{ fontSize: 14 }} />}
              sx={smallButtonSx}
              onClick={handleCopyJSON}
            >
              Copy as JSON
            </Button>
            <Button
              variant='contained'
              size='small'
              startIcon={<CheckRounded sx={{ fontSize: 14 }} />}
              sx={primaryButtonSx}
              onClick={() => handleUpdateSchema()}
              loading={mutation.isPending}
              disabled={Boolean(markers.length)}
            >
              Save schema
            </Button>
          </>
        }
      />

      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' },
          gap: 2,
          minHeight: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <SectionCard noBodyPadding>
            <Box sx={{ borderRadius: 0, overflow: 'hidden' }}>
              <Suspense
                fallback={<Skeleton variant='rounded' height='70vh' />}
              >
                <JsonEditor
                  height='70vh'
                  schema={COLLECTION_SCHEMA}
                  options={options}
                  value={JSON.stringify(data)}
                  onMount={handleEditorDidMount}
                  onValidate={(m) => setMarkers(m)}
                />
              </Suspense>
            </Box>
          </SectionCard>
        </Box>

        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          <CollectionSettingsCard collectionId={collectionId} />
          <IndexingHealthCard
            totalDocs={data.num_documents}
          />
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <DangerZoneCard />
          </ErrorBoundary>
        </Stack>
      </Box>
    </Stack>
  );
}

function CollectionSettingsCard({
  collectionId,
}: {
  collectionId: string;
}) {
  const { data } = useSchema(collectionId);
  const settings = useMemo(
    () => [
      {
        label: 'Default sorting field',
        value: data.default_sorting_field || '—',
      },
      {
        label: 'Token separators',
        value: data.token_separators?.length
          ? data.token_separators.join(' ')
          : '—',
      },
      {
        label: 'Symbols to index',
        value: data.symbols_to_index?.length
          ? data.symbols_to_index.join(' ')
          : '—',
      },
      {
        label: 'Nested fields',
        value: data.enable_nested_fields ? 'enabled' : 'disabled',
        accent: !!data.enable_nested_fields,
      },
      {
        label: 'Created',
        value: data.created_at
          ? new Date(data.created_at * 1000).toLocaleString()
          : '—',
      },
    ],
    [data],
  );

  return (
    <SectionCard title='Collection settings'>
      {settings.map((s) => (
        <Stack
          key={s.label}
          direction='row'
          sx={{
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box
            component='span'
            sx={{ color: designTokens.textMuted, fontSize: 12.5 }}
          >
            {s.label}
          </Box>
          <Box
            component='span'
            sx={{
              fontFamily: s.accent ? undefined : designTokens.fontMono,
              fontSize: 12,
              color: s.accent ? designTokens.accentDeep : designTokens.text,
              fontWeight: 500,
            }}
          >
            {s.value}
          </Box>
        </Stack>
      ))}
    </SectionCard>
  );
}

function IndexingHealthCard({ totalDocs }: { totalDocs?: number }) {
  return (
    <SectionCard title='Indexing health'>
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          lineHeight: 1.5,
        }}
      >
        {totalDocs !== undefined ? (
          <>
            All <strong>{totalDocs.toLocaleString()}</strong> documents are
            indexed and queryable.
          </>
        ) : (
          'Schema in sync with cluster.'
        )}
      </Typography>
      <Box
        sx={{
          height: 5,
          background: designTokens.surfaceMuted,
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: designTokens.success,
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          color: designTokens.textFaint,
          fontFamily: designTokens.fontMono,
        }}
      >
        100% · 1 shard · 0 replicas
      </Typography>
    </SectionCard>
  );
}

function DangerZoneCard() {
  return (
    <Box
      sx={{
        background: 'background.paper',
        border: `1px solid color-mix(in srgb, ${designTokens.danger} 20%, transparent)`,
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: designTokens.danger,
          mb: 0.75,
        }}
      >
        Danger zone
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          lineHeight: 1.5,
          mb: 1.25,
        }}
      >
        Drop this collection and all of its documents. This action cannot be
        undone.
      </Typography>
      <DeleteCollectionButton sx={{ width: '100%', ...dangerButtonSx }}>
        Delete collection
      </DeleteCollectionButton>
    </Box>
  );
}

type DeleteCollectionButtonProps = ButtonProps;

function DeleteCollectionButton({
  children = 'Delete collection',
  sx,
  ...props
}: DeleteCollectionButtonProps) {
  const navigate = Route.useNavigate();
  const { collectionId } = Route.useParams();
  const { openConfirmDelete } = useConfirmDelete();

  const deleteMutation = useDeleteCollection({
    onSuccess: () => {
      navigate({ to: '/collections' });
    },
  });

  const handleDeleteCollection = useCallback(async () => {
    try {
      await openConfirmDelete(collectionId);
      deleteMutation.mutate(collectionId);
    } catch (err) {
      console.log(err);
    }
  }, [collectionId, deleteMutation, openConfirmDelete]);

  return (
    <Button
      variant='outlined'
      sx={sx}
      {...props}
      onClick={() => handleDeleteCollection()}
      loading={deleteMutation.isPending}
    >
      {children}
    </Button>
  );
}
