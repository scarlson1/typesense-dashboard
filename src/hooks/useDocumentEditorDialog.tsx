import type { EditorProps, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { JsonEditor, type JsonEditorProps } from '../components';
import { DEFAULT_MONACO_OPTIONS } from '../constants';
import { useDialog } from './useDialog';
import { useUpdateDocument } from './useUpdateDocument';

interface UseDocumentEditorDialogProps {
  initialOptions?: EditorProps['options'];
}

export const useDocumentEditorDialog = (
  props?: UseDocumentEditorDialogProps
) => {
  const { initialOptions = DEFAULT_MONACO_OPTIONS } = props || {};

  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const dialog = useDialog();

  const [options, setOptions] =
    useState<EditorProps['options']>(initialOptions);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  const mutation = useUpdateDocument({
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

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const handleSave = useCallback(async () => {}, [mutation.mutate]);

  return useCallback(
    ({ value, title }: { value: string; title: string }) => {
      // initialSchema.current = value;

      dialog.prompt({
        title,
        variant: 'danger',
        catchOnCancel: false,
        onSubmit: () => {
          handleSave();
        },
        onCancel: () => {
          dialog.handleClose();
        },
        content: ((props?: JsonEditorProps) => {
          return (
            <JsonEditor
              height='calc(100% - 12px)'
              options={options}
              onMount={handleEditorDidMount}
              {...(props || {})}
              value={value}
              onValidate={(m) => {
                setMarkers(m);
              }}
              // schema={COLLECTION_SCHEMA}
            />
          );
        })(),
        slotProps: {
          content: {
            options,
            sx: { height: '75vh' },
          },
          dialog: {
            maxWidth: 'md',
            fullWidth: true,
          },
          cancelButton: {
            disabled: mutation.isPending,
            children: 'cancel',
          },
          acceptButton: {
            disabled: Boolean(markers.length),
            loading: mutation.isPending,
            children: 'Save',
          },
        },
      });
    },
    [
      dialog.prompt,
      dialog.handleClose,
      dialog.handleAccept,
      markers,
      mutation.isPending,
      handleEditorDidMount,
      handleSave,
    ]
  );
};
