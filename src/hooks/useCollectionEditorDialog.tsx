import { type JsonEditorProps } from '@/components/JsonEditor';
import { COLLECTION_SCHEMA, DEFAULT_MONACO_OPTIONS } from '@/constants';
import { gray } from '@/theme/themePrimitives';
import { getCollectionUpdates } from '@/utils/getCollectionUpdates';
import { type EditorProps, type OnMount } from '@monaco-editor/react';
import { OpenInNewRounded } from '@mui/icons-material';
import {
  Button,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Color from 'color';
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
  const initialSchema = useRef<string>(null);
  const toast = useAsyncToast();
  const [readOnly, setReadOnly] = useState(true);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  const mutation = useUpdateCollection({
    onSuccess: () => {
      setReadOnly(true);
      editorRef.current?.updateOptions({ readOnly: true });
    },
    onError: () => {
      setReadOnly(false);
      editorRef.current?.updateOptions({ readOnly: false });
    },
  });

  useEffect(() => {
    dialog.setDisabled(Boolean(markers.length));
  }, [markers]);

  useEffect(() => {
    if (!dialog.isOpen) return;

    let slotProps = {
      ...dialog.slotProps,
      cancelButton: {
        disabled: mutation.isPending,
        children: readOnly ? 'Close' : 'Cancel',
      },
      acceptButton: {
        disabled: Boolean(markers.length),
        loading: mutation.isPending,
        children: readOnly ? 'Edit' : 'Save',
      },
    };
    dialog.updateSlotProps(slotProps);
  }, [readOnly, mutation.isPending, markers, dialog.isOpen, dialog.slotProps]);

  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly });
  }, [readOnly]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
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
    // editorRef.current?.updateOptions({ readOnly: true });
    setReadOnly(true);

    const initialVal = JSON.parse(initialSchema.current || '{}');

    const fieldUpdates = getCollectionUpdates(initialVal?.fields, fields || []);

    if (!fieldUpdates.length) {
      toast.info(`no field changes made`);
      setReadOnly(false);
      return;
    }

    let updates: CollectionUpdateSchema = {
      metadata,
      fields: fieldUpdates,
    };

    mutation.mutate({ colName: initialVal.name, updates });
  }, [mutation.mutate, markers]);

  return useCallback(
    ({ value, title }: { value: string; title: string }) => {
      initialSchema.current = value;

      let readOnly = editorRef.current?.getRawOptions()?.readOnly ?? true;

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
          let currentReadOnly =
            editorRef.current?.getRawOptions()?.readOnly ?? true;

          if (currentReadOnly) {
            setReadOnly(false);
          } else {
            handleSave();
          }
        },
        onCancel: () => {
          let currentReadOnly =
            editorRef.current?.getRawOptions()?.readOnly ?? true;

          if (currentReadOnly) {
            dialog.handleClose();
          } else {
            let resetValue = initialSchema.current;
            if (resetValue) {
              editorRef.current?.setValue(resetValue);
            }
            setReadOnly(true);
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
                options={initialOptions}
                onMount={handleEditorDidMount}
                {...(props || {})}
                value={value}
                onValidate={(m) => {
                  setMarkers(m);
                }}
                schema={COLLECTION_SCHEMA}
                slotProps={{
                  background: {
                    dark: Color(gray[800]).hex(),
                  },
                }}
              />
            </Suspense>
          );
        })(),
        slotProps: {
          content: {
            sx: { height: '75vh' },
          },
          dialog: {
            fullScreen,
            maxWidth: 'md',
            fullWidth: true,
          },
          cancelButton: {
            disabled: mutation.isPending,
            children: readOnly ? 'Close' : 'Cancel',
          },
          acceptButton: {
            disabled: Boolean(markers.length),
            loading: mutation.isPending,
            children: readOnly ? 'Edit' : 'Save',
          },
        },
      });
    },
    [
      readOnly,
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
