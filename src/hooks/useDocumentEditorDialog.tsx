import type { EditorProps, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { JsonEditor, type JsonEditorProps } from '../components';
import { DEFAULT_MONACO_OPTIONS } from '../constants';
import { useAsyncToast } from './useAsyncToast';
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
  const toast = useAsyncToast();
  const dialog = useDialog();

  const [options, setOptions] =
    useState<EditorProps['options']>(initialOptions);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  const mutation = useUpdateDocument({
    onSuccess: () => {
      setOptions((o) => ({ ...o, readOnly: false }));
    },
    onMutate: (vars) => {
      setOptions((o) => ({ ...o, readOnly: true }));
      return vars;
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

  const handleSave = useCallback(
    async ({
      collectionId,
      docId,
    }: {
      collectionId: string;
      docId: string;
    }) => {
      if (markers.length) {
        toast.warn('Invalid JSON', { id: 'monaco-validation' });
        return;
      }

      let value = editorRef.current?.getValue();
      if (!value) return;

      const updates = JSON.parse(value);
      mutation.mutate({ collectionId, docId, updates });
    },
    [mutation.mutate]
  );

  return useCallback(
    ({
      collectionId,
      docId,
      value,
      title,
    }: {
      collectionId: string;
      docId: string;
      value: string;
      title: string;
    }) => {
      dialog.prompt({
        title,
        variant: 'danger',
        catchOnCancel: false,
        onSubmit: () => {
          handleSave({ collectionId, docId });
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
