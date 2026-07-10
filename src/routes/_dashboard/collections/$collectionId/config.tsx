import { ErrorFallback } from '@/components';
import { BulkDocumentOpsCard } from '@/components/BulkDocumentOps';
import {
  Badge,
  CollectionTabBar,
  dangerButtonSx,
  MobileCollectionScopeStrip,
  PageHeader,
  primaryButtonSx,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { SchemaCardView } from '@/components/SchemaCardView';
import { SchemaFieldEditDialog } from '@/components/SchemaFieldEditDialog';
import { SchemaTableView } from '@/components/SchemaTableView';
import { COLLECTION_SCHEMA, DEFAULT_MONACO_OPTIONS } from '@/constants';
import {
  useAsyncToast,
  useDeleteCollection,
  useDialog,
  useSchema,
  useTruncateCollection,
  useUpdateCollection,
} from '@/hooks';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { designTokens } from '@/theme/themePrimitives';
import { getCollectionUpdates } from '@/utils/getCollectionUpdates';
import type { EditorProps, OnMount } from '@monaco-editor/react';
import {
  AddRounded,
  CheckRounded,
  ContentCopyRounded,
  LockOutlineRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  type ButtonProps,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import type { editor } from 'monaco-editor';
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
import type {
  CollectionFieldSchema,
  CollectionUpdateSchema,
} from 'typesense/lib/Typesense/Collection';

const JsonEditor = lazy(() => import('../../../../components/JsonEditor'));

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/config',
)({
  component: CollectionSettings,
  staticData: { crumb: 'Config' },
});

type SchemaView = 'table' | 'json';

function CollectionSettings() {
  const { collectionId } = Route.useParams();
  const toast = useAsyncToast();
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const [options, setOptions] = useState<EditorProps['options']>(
    DEFAULT_MONACO_OPTIONS,
  );
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const [view, setView] = useState<SchemaView>('table');
  const [editingField, setEditingField] =
    useState<CollectionFieldSchema | null>(null);
  const [addingField, setAddingField] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dialog = useDialog();

  const { data } = useSchema(collectionId);

  const mutation = useUpdateCollection({
    // toastEnabled: false,
    // onMutate: (vars, ctx) => {
    //   toast.loading('saving...', { id: 'update-schema' });
    // },
    // onSuccess: (data, vars, result, ctx) => {
    //     toast.success(`collection updated`, { id: 'update-schema' });
    // },
    // onError(err, vars, result, ctx) {
    //   console.log('ERROR: ', err);
    //   const msg = err.message ?? 'failed to update collection schema';
    //   toast.error(msg, { id: 'update-schema' });
    // },
    onSettled: () => {
      setOptions((o) => ({ ...o, readOnly: false }));
    },
  });

  const fieldEditMutation = useUpdateCollection({
    onSuccess: () => {
      setEditingField(null);
      setAddingField(false);
    },
  });

  const handleSaveField = useCallback(
    (updated: CollectionFieldSchema) => {
      fieldEditMutation.mutate({
        colName: collectionId,
        updates: {
          fields: [{ name: updated.name, drop: true }, updated],
        },
      });
    },
    [collectionId, fieldEditMutation],
  );

  const handleCreateField = useCallback(
    (created: CollectionFieldSchema) => {
      fieldEditMutation.mutate({
        colName: collectionId,
        updates: { fields: [created] },
      });
    },
    [collectionId, fieldEditMutation],
  );

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
  }, [mutation, data, markers, dialog, collectionId, fullScreen, toast]);

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
            {view === 'table' ? (
              <Button
                variant='contained'
                size='small'
                startIcon={<AddRounded sx={{ fontSize: 16 }} />}
                sx={{
                  ...primaryButtonSx,
                  // display: { xs: 'inline-flex', md: 'none' },
                }}
                onClick={() => setAddingField(true)}
              >
                Field
              </Button>
            ) : null}
          </>
        }
      />
      <CollectionTabBar collectionId={collectionId} />

      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 300px',
            lg: '1fr 400px',
            xl: '1fr 460px',
          },
          gap: 2,
          minHeight: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <SectionCard noBodyPadding>
            <SchemaViewTabs
              view={view}
              onChange={setView}
              onCopyJSON={handleCopyJSON}
              isPending={mutation.isPending}
              saveDisabled={Boolean(markers.length)}
              updateSchema={handleUpdateSchema}
            />
            <Box
              sx={{
                borderRadius: 0,
                overflow: 'hidden',
                display: view === 'json' ? 'block' : 'none',
              }}
            >
              <Suspense fallback={<Skeleton variant='rounded' height='70vh' />}>
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
            {view === 'table' ? (
              <>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <SchemaTableView
                    fields={data.fields ?? []}
                    onEditField={setEditingField}
                  />
                </Box>
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <SchemaCardView
                    fields={data.fields ?? []}
                    onEditField={setEditingField}
                  />
                </Box>
              </>
            ) : null}
          </SectionCard>
        </Box>

        <SchemaFieldEditDialog
          field={editingField}
          creating={addingField}
          availableFields={data.fields ?? []}
          onClose={() => {
            setEditingField(null);
            setAddingField(false);
          }}
          onSave={handleSaveField}
          onCreate={handleCreateField}
          saving={fieldEditMutation.isPending}
        />

        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          <CollectionSettingsCard collectionId={collectionId} />

          <IndexingHealthCard totalDocs={data.num_documents} />
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <BulkDocumentOpsCard collectionId={collectionId} />
          </ErrorBoundary>
          <SchemaUpdateGuideCard />
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <DangerZoneCard />
          </ErrorBoundary>
        </Stack>
      </Box>
      <MobileCollectionScopeStrip currentCollectionId={collectionId} />
    </Stack>
  );
}

const VIEW_TABS: { value: SchemaView; label: string }[] = [
  { value: 'table', label: 'Table' },
  { value: 'json', label: 'JSON' },
];

function SchemaViewTabs({
  view,
  onChange,
  onCopyJSON,
  isPending,
  saveDisabled,
  updateSchema,
}: {
  view: SchemaView;
  onChange: (next: SchemaView) => void;
  onCopyJSON: () => void;
  isPending: boolean;
  saveDisabled: boolean;
  updateSchema: () => void;
}) {
  return (
    <Stack
      direction='row'
      sx={{
        gap: 0.5,
        px: 1.25,
        pt: 0.5,
        borderBottom: `1px solid ${designTokens.border}`,
        background: designTokens.surface,
        alignItems: 'center',
      }}
    >
      {VIEW_TABS.map((t) => {
        const active = t.value === view;
        return (
          <Box
            key={t.value}
            onClick={() => onChange(t.value)}
            sx={{
              px: 1.5,
              py: 1,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? designTokens.text : designTokens.textMuted,
              cursor: 'pointer',
              borderBottom: active
                ? `2px solid ${designTokens.accent}`
                : '2px solid transparent',
              mb: '-1px',
              transition: 'color 120ms ease',
              '&:hover': {
                color: designTokens.text,
              },
            }}
          >
            {t.label}
          </Box>
        );
      })}
      <Box sx={{ flex: 1 }} />

      {view === 'json' ? (
        <Button
          variant='contained'
          size='small'
          startIcon={<CheckRounded sx={{ fontSize: 14 }} />}
          sx={{
            ...primaryButtonSx,
            height: 28,
            // display: {
            //   xs: view === 'json' ? 'inline-flex' : 'none',
            //   md: 'inline-flex',
            // },
          }}
          onClick={() => updateSchema()}
          loading={isPending}
          disabled={Boolean(saveDisabled)}
        >
          Save schema
        </Button>
      ) : null}

      <Tooltip title='Copy as JSON'>
        <IconButton
          size='small'
          onClick={onCopyJSON}
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            color: designTokens.textFaint,
            border: `1px solid ${designTokens.border}`,
            background: designTokens.surface,
            display: { xs: 'inline-flex', md: 'none' },
            '&:hover': {
              color: designTokens.text,
              borderColor: designTokens.borderStrong,
            },
          }}
        >
          <ContentCopyRounded sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
      <Button
        variant='outlined'
        size='small'
        startIcon={<ContentCopyRounded sx={{ fontSize: 13 }} />}
        onClick={onCopyJSON}
        sx={{
          ...smallButtonSx,
          height: 28,
          fontSize: 12,
          display: { xs: 'none', md: 'inline-flex' },
        }}
      >
        Copy as JSON
      </Button>
    </Stack>
  );
}

function CollectionSettingsCard({ collectionId }: { collectionId: string }) {
  const { data } = useSchema(collectionId);
  const settings = useMemo(
    () => [
      {
        label: 'Default sorting field',
        value: data.default_sorting_field || '—',
        locked: true,
      },
      {
        label: 'Token separators',
        value: data.token_separators?.length
          ? data.token_separators.join(' ')
          : '—',
        locked: true,
      },
      {
        label: 'Symbols to index',
        value: data.symbols_to_index?.length
          ? data.symbols_to_index.join(' ')
          : '—',
        locked: true,
      },
      {
        label: 'Nested fields',
        value: data.enable_nested_fields ? 'enabled' : 'disabled',
        accent: !!data.enable_nested_fields,
        locked: true,
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
          <Stack
            direction='row'
            sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}
          >
            {s.locked ? (
              <LockOutlineRounded
                titleAccess='Fixed at creation'
                sx={{ fontSize: 11, color: designTokens.textFaint }}
              />
            ) : null}
            <Box
              component='span'
              sx={{ color: designTokens.textMuted, fontSize: 12.5 }}
            >
              {s.label}
            </Box>
          </Stack>
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

function SchemaUpdateGuideCard() {
  return (
    <SectionCard title='How schema updates work'>
      <Typography
        sx={{
          fontSize: 12.5,
          color: designTokens.textMuted,
          lineHeight: 1.55,
        }}
      >
        When you click <strong>Save schema</strong>, only changes to{' '}
        <Box
          component='code'
          sx={{
            fontFamily: designTokens.fontMono,
            fontSize: 11.5,
            px: 0.5,
            py: 0.1,
            borderRadius: 0.5,
            background: designTokens.codeSurface,
            color: designTokens.codeText,
          }}
        >
          fields
        </Box>{' '}
        and{' '}
        <Box
          component='code'
          sx={{
            fontFamily: designTokens.fontMono,
            fontSize: 11.5,
            px: 0.5,
            py: 0.1,
            borderRadius: 0.5,
            background: designTokens.codeSurface,
            color: designTokens.codeText,
          }}
        >
          metadata
        </Box>{' '}
        are diffed against the current schema and submitted to Typesense.
      </Typography>

      <Stack sx={{ gap: 0.5 }}>
        <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
          <Badge tone='success'>updatable</Badge>
          <Typography
            sx={{
              fontSize: 12,
              color: designTokens.textMuted,
              fontWeight: 500,
            }}
          >
            Fields only
          </Typography>
        </Stack>
        <Box
          component='ul'
          sx={{
            m: 0,
            pl: 2.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            fontSize: 12,
            color: designTokens.textMuted,
            lineHeight: 1.5,
          }}
        >
          <li>Add new fields</li>
          <li>Remove existing fields</li>
          <li>
            Change a field’s type or attributes — applied as a drop + re-add,
            which re-indexes that field
          </li>
        </Box>
      </Stack>

      <Stack sx={{ gap: 0.5 }}>
        <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
          <Badge tone='warn'>fixed at creation</Badge>
        </Stack>
        <Box
          component='ul'
          sx={{
            m: 0,
            pl: 2.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            fontSize: 12,
            color: designTokens.textMuted,
            lineHeight: 1.5,
          }}
        >
          <li>Collection name</li>
          <li>
            <Box
              component='code'
              sx={{ fontFamily: designTokens.fontMono, fontSize: 11.5 }}
            >
              default_sorting_field
            </Box>
          </li>
          <li>
            <Box
              component='code'
              sx={{ fontFamily: designTokens.fontMono, fontSize: 11.5 }}
            >
              token_separators
            </Box>{' '}
            and{' '}
            <Box
              component='code'
              sx={{ fontFamily: designTokens.fontMono, fontSize: 11.5 }}
            >
              symbols_to_index
            </Box>
          </li>
          <li>
            Reference fields (
            <Box
              component='code'
              sx={{ fontFamily: designTokens.fontMono, fontSize: 11.5 }}
            >
              reference
            </Box>{' '}
            cannot be added via alter)
          </li>
        </Box>
      </Stack>

      <Box
        sx={{
          mt: 0.25,
          p: 1.25,
          borderRadius: 0.75,
          background: designTokens.accentSoft,
          border: `1px solid ${designTokens.accentBorder}`,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: designTokens.accentDeep,
            mb: 0.4,
          }}
        >
          Need to change something fixed?
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            color: designTokens.textMuted,
            lineHeight: 1.55,
          }}
        >
          Create a new collection with the desired schema, reindex your data
          into it, then point a{' '}
          <Link
            href='/aliases'
            sx={{
              color: designTokens.accentDeep,
              fontWeight: 500,
              textDecorationColor: designTokens.accentBorder,
            }}
          >
            Collection Alias
          </Link>{' '}
          at the new collection for an atomic, zero-downtime cutover.
        </Typography>
        <Link
          href='https://typesense.org/docs/latest/api/collections.html#update-or-alter-a-collection'
          target='_blank'
          rel='noopener noreferrer'
          sx={{
            mt: 0.75,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            fontSize: 11.5,
            fontWeight: 500,
            color: designTokens.accentDeep,
            textDecorationColor: designTokens.accentBorder,
          }}
        >
          Typesense docs
          <OpenInNewRounded sx={{ fontSize: 12 }} />
        </Link>
      </Box>
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
        backgroundColor: 'background.paper',
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
        Truncate deletes every document but keeps the schema. Delete drops the
        collection entirely. Neither action can be undone.
      </Typography>
      <Stack sx={{ gap: 1 }}>
        <TruncateCollectionButton sx={{ width: '100%', ...dangerButtonSx }} />
        <DeleteCollectionButton sx={{ width: '100%', ...dangerButtonSx }}>
          Delete collection
        </DeleteCollectionButton>
      </Stack>
    </Box>
  );
}

function TruncateCollectionButton({ sx, ...props }: ButtonProps) {
  const { collectionId } = Route.useParams();
  const { openConfirmDelete } = useConfirmDelete({
    title: `Truncate "${collectionId}"`,
    description: `THIS ACTION CANNOT BE UNDONE. Every document in "${collectionId}" will be deleted; the schema is kept. Type the collection name to confirm.`,
  });

  const truncateMutation = useTruncateCollection();

  const handleTruncate = useCallback(async () => {
    try {
      await openConfirmDelete(collectionId);
      truncateMutation.mutate(collectionId);
    } catch (err) {
      console.log(err);
    }
  }, [collectionId, truncateMutation, openConfirmDelete]);

  return (
    <Button
      variant='outlined'
      sx={sx}
      {...props}
      onClick={() => void handleTruncate()}
      loading={truncateMutation.isPending}
    >
      Truncate collection
    </Button>
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
