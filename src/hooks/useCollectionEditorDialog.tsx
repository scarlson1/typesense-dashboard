import { type JsonEditorProps } from '@/components/JsonEditor';
import { COLLECTION_SCHEMA, DEFAULT_MONACO_OPTIONS } from '@/constants';
import { getCollectionUpdates } from '@/utils/getCollectionUpdates';
import {
  type EditorProps,
  type Monaco,
  type OnMount,
} from '@monaco-editor/react';
import { OpenInNewRounded } from '@mui/icons-material';
import {
  Button,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { editor } from 'monaco-editor';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';
import { useAsyncToast, useDialog, useUpdateCollection } from '.';

const JsonEditor = lazy(() => import('../components/JsonEditor'));

interface UseCollectionEditorDialogProps {
  initialOptions?: EditorProps['options'];
}

export function useCollectionEditorDialog(
  props?: UseCollectionEditorDialogProps | undefined
) {
  const { initialOptions = DEFAULT_MONACO_OPTIONS } = props || {};

  const dialog = useDialog();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<Monaco>(null);
  const initialSchema = useRef<string>(null);
  const toast = useAsyncToast();
  const [options, setOptions] =
    useState<EditorProps['options']>(initialOptions);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  const mutation = useUpdateCollection({
    onSuccess: () => {
      setOptions((o) => ({ ...o, readOnly: true }));
    },
    onError: () => {
      setOptions((o) => ({ ...o, readOnly: false }));
    },
  });

  useEffect(() => {
    dialog.setDisabled(Boolean(markers.length));
  }, [markers]);

  useEffect(() => {
    if (!dialog.isOpen) return;
    if (options) editorRef.current?.updateOptions(options);

    let slotProps = {
      ...dialog.slotProps,
      content: { options },
      cancelButton: {
        disabled: mutation.isPending,
        children: options?.readOnly ? 'Close' : 'Cancel',
      },
      acceptButton: {
        disabled: Boolean(markers.length),
        loading: mutation.isPending,
        children: options?.readOnly ? 'Edit' : 'Save',
      },
    };
    dialog.updateSlotProps(slotProps);
  }, [
    options?.readOnly,
    mutation.isPending,
    markers,
    dialog.isOpen,
    dialog.slotProps,
  ]);

  useEffect(() => {
    if (!dialog.isOpen)
      editorRef.current?.updateOptions({ ...options, readOnly: true });
  }, [dialog.isOpen, options]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleSave = useCallback(async () => {
    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }

    let value = editorRef.current?.getValue();
    if (!value) return;
    // typesense only supports updating metadata & fields ??
    let { fields, metadata = {} } = JSON.parse(value);
    setOptions((o) => ({ ...o, readOnly: true }));

    const initialVal = JSON.parse(initialSchema.current || '{}');

    const fieldUpdates = getCollectionUpdates(initialVal?.fields, fields || []);

    if (!fieldUpdates.length) {
      toast.info(`no field changes made`);
      setOptions((o) => ({ ...o, readOnly: false }));
      return;
    }

    let updates: CollectionUpdateSchema = {
      metadata,
      fields: fieldUpdates,
    };
    console.log('UPDATES: ', updates);

    mutation.mutate({ colName: initialVal.name, updates });
  }, [mutation.mutate, markers]);

  return useCallback(
    ({ value, title }: { value: string; title: string }) => {
      initialSchema.current = value;

      dialog.prompt({
        title: (() => {
          return (
            <Stack
              direction='row'
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              {title}
              <Button
                component='a'
                href='https://typesense.org/docs/29.0/api/collections.html#update-or-alter-a-collection'
                target='_blank'
                rel='noopener noreferrer'
                size='small'
                endIcon={<OpenInNewRounded />}
              >
                Docs
              </Button>
            </Stack>
          );
        })(),
        variant: 'danger',
        catchOnCancel: false,
        onSubmit: () => {
          if (options?.readOnly) {
            console.log('setting read only: FALSE');
            setOptions((o) => ({ ...o, readOnly: false }));
          } else {
            handleSave();
          }
        },
        onCancel: () => {
          if (options?.readOnly) {
            dialog.handleClose();
          } else {
            let resetValue = initialSchema.current;
            if (resetValue) {
              editorRef.current?.setValue(resetValue);
            }

            setOptions((o) => ({ ...o, readOnly: true }));
          }
        },
        content: ((props?: JsonEditorProps) => {
          return (
            <Suspense
              fallback={
                <Skeleton variant='rounded' height={'calc(100% - 12px)'} />
              }
            >
              <JsonEditor
                height='calc(100% - 12px)'
                options={options}
                onMount={handleEditorDidMount}
                {...(props || {})}
                value={value}
                onValidate={(m) => {
                  setMarkers(m);
                }}
                schema={COLLECTION_SCHEMA}
              />
            </Suspense>
          );
        })(),
        slotProps: {
          content: {
            options,
            sx: { height: '75vh' },
          },
          dialog: {
            fullScreen,
            maxWidth: 'md',
            fullWidth: true,
          },
          cancelButton: {
            disabled: mutation.isPending,
            children: options?.readOnly ? 'Close' : 'Cancel',
          },
          acceptButton: {
            disabled: Boolean(markers.length),
            loading: mutation.isPending,
            children: options?.readOnly ? 'Edit' : 'Save',
          },
        },
      });
    },
    [
      options?.readOnly,
      dialog.prompt,
      dialog.handleClose,
      dialog.handleAccept,
      markers,
      mutation.isPending,
      handleEditorDidMount,
      handleSave,
    ]
  );
}
