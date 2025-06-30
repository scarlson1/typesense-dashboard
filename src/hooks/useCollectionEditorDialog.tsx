import {
  type EditorProps,
  type Monaco,
  type OnMount,
} from '@monaco-editor/react';
import { useMediaQuery, useTheme } from '@mui/material';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';
import { useAsyncToast, useDialog, useUpdateCollection } from '.';
import { JsonEditor, type JsonEditorProps } from '../components';
import { COLLECTION_SCHEMA, DEFAULT_MONACO_OPTIONS } from '../constants';
import { diffArraysOfObjects } from '../utils';

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

  const handleSave = async () => {
    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }

    let value = editorRef.current?.getValue();
    if (!value) return;
    let parsed = JSON.parse(value);
    setOptions((o) => ({ ...o, readOnly: true }));

    // typesense only supports updating metadata & fields ??
    // TODO: need to validate metadata ??
    const { fields, metadata = {} } = parsed;

    const initialVal = JSON.parse(initialSchema.current || '{}');

    const { added, removed, updated } = diffArraysOfObjects<any>(
      initialVal?.fields || [],
      fields || [],
      'name'
    );

    console.log({ added, removed, updated });

    let fieldUpdates = [];
    for (let a of added) fieldUpdates.push(a);
    for (let r of removed) fieldUpdates.push({ name: r.name, drop: true });
    for (let u of updated) {
      fieldUpdates.push({ name: u.name, drop: true });
      fieldUpdates.push(u);
    }

    if (!fieldUpdates.length) {
      toast.info(`no changes made`);
      setOptions((o) => ({ ...o, readOnly: false }));
      return;
    }

    // TODO: changes to other properties ??
    let updates: CollectionUpdateSchema = {
      // default_sorting_field,
      // symbols_to_index,
      // token_separators,
      // enable_nested_fields,
      metadata,
      // voice_query_model,
      fields: fieldUpdates,
    };
    console.log('UPDATES: ', updates);

    mutation.mutate({ colName: initialVal.name, updates });
  };

  const openDialog = useCallback(
    ({ value, title }: { value: string; title: string }) => {
      //  Omit<DialogOptions, 'content' | 'onSubmit' | 'variant'> & {value: string}
      initialSchema.current = value;

      dialog.prompt({
        title,
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
            // set editor to original value
            let resetValue = initialSchema.current;
            if (resetValue) {
              editorRef.current?.setValue(resetValue);
            }

            setOptions((o) => ({ ...o, readOnly: true }));
          }
        },
        content: ((props?: JsonEditorProps) => {
          console.log('PROPS: ', props);
          return (
            <JsonEditor
              height='80vh'
              options={options}
              onMount={handleEditorDidMount}
              {...(props || {})}
              value={value}
              onValidate={(m) => {
                setMarkers(m);
              }}
              schema={COLLECTION_SCHEMA}
            />
          );
        })(),
        slotProps: {
          content: {
            options,
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

  return openDialog;
}
