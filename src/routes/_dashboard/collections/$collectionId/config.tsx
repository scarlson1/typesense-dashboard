import { ErrorFallback } from '@/components';
import { COLLECTION_SCHEMA, DEFAULT_MONACO_OPTIONS } from '@/constants';
import {
  useAsyncToast,
  useDeleteCollection,
  useSchema,
  useUpdateCollection,
} from '@/hooks';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { getCollectionUpdates } from '@/utils/getCollectionUpdates';
import type { EditorProps, OnMount } from '@monaco-editor/react';
import {
  Box,
  Button,
  Skeleton,
  Stack,
  Typography,
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
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';

const JsonEditor = lazy(() => import('../../../../components/JsonEditor'));

// TODO: confirm collection updates

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/config'
)({
  component: CollectionSettings,
  staticData: {
    crumb: 'Config',
  },
});

function CollectionSettings() {
  const { collectionId } = Route.useParams();
  const toast = useAsyncToast();
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const [options, setOptions] = useState<EditorProps['options']>(
    DEFAULT_MONACO_OPTIONS
  );
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  const { data } = useSchema(collectionId);

  const mutation = useUpdateCollection({
    onSettled: () => {
      setOptions((o) => ({ ...o, readOnly: false }));
    },
  });

  const handleUpdateSchema = useCallback(() => {
    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }

    let value = editorRef.current?.getValue();
    if (!value) return;
    let { fields, metadata = {} } = JSON.parse(value);

    setOptions((o) => ({ ...o, readOnly: true }));

    const fieldUpdates = getCollectionUpdates(data.fields, fields);

    if (!fieldUpdates.length) {
      toast.info(`no field changes made`);
      setOptions((o) => ({ ...o, readOnly: false }));
      return;
    }
    // TODO: confirm updates in dialog ??

    let updates: CollectionUpdateSchema = {
      metadata,
      fields: fieldUpdates,
    };

    mutation.mutate({ colName: collectionId, updates });
  }, [mutation.mutate, data, markers]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, [data]);

  return (
    <Box sx={{ maxWidth: 920 }}>
      <Typography variant='h3'>{collectionId}</Typography>
      <Stack
        direction='row'
        spacing={{ xs: 1, sm: 2 }}
        sx={{ my: { xs: 1, sm: 2 } }}
      >
        <Button
          variant='contained'
          onClick={() => handleUpdateSchema()}
          loading={mutation.isPending}
          disabled={Boolean(markers.length)}
        >
          Update Schema
        </Button>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: Error) => {
            captureException(err);
          }}
        >
          <DeleteCollectionButton>Delete Collection</DeleteCollectionButton>
        </ErrorBoundary>
      </Stack>
      <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <Suspense fallback={<Skeleton variant='rounded' height={'70vh'} />}>
          <JsonEditor
            height='70vh'
            schema={COLLECTION_SCHEMA}
            options={options}
            value={JSON.stringify(data)}
            onMount={handleEditorDidMount}
            onValidate={(m) => {
              setMarkers(m);
            }}
          />
        </Suspense>
      </Box>
    </Box>
  );
}

type DeleteCollectionButtonProps = ButtonProps;

function DeleteCollectionButton({
  children = 'Delete Collection',
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
    } catch (err) {}
  }, [deleteMutation.mutate, collectionId]);

  return (
    <Button
      variant='contained'
      {...props}
      onClick={() => handleDeleteCollection()}
      loading={deleteMutation.isPending}
    >
      {children}
    </Button>
  );
}
