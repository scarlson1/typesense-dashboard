import {
  Editor,
  type EditorProps,
  type Monaco,
  type OnMount,
} from '@monaco-editor/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useColorScheme,
  useMediaQuery,
  useTheme,
  type DialogProps,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { Client } from 'typesense';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';
import { z } from 'zod/v4';
import { collectionQueryKeys } from '../constants';
import { useAsyncToast } from '../hooks';
import { collectionSchema } from '../types';
import { diffArraysOfObjects, queryClient } from '../utils';

interface CollectionDialogProps extends DialogProps {
  title?: string;
  value: string;
  handleClose: () => void;
  initialOptions: EditorProps['options'];
  client: Client;
}

// TODO: abstract components (use: create collection, edit collection, edit document, etc.)

// TODO: reference documentation on modifying fields (https://typesense.org/docs/28.0/api/collections.html#modifying-an-existing-field)

// TODO: dialog context --> pass data directly in action handler (instead of setting data as state)
// TODO: how to updates be processed ? calc diff in fields and convert to drop/add ??
export function CollectionJsonDialog({
  value,
  title,
  handleClose,
  initialOptions,
  client,
  ...props
}: CollectionDialogProps) {
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<Monaco>(null);
  const initialSchema = useRef(value);
  const toast = useAsyncToast();
  const [options, setOptions] =
    useState<EditorProps['options']>(initialOptions);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  useEffect(() => {
    initialSchema.current = value;
  }, [value]);

  const mutation = useMutation({
    mutationFn: ({
      colName,
      updates,
    }: {
      colName: string;
      updates: CollectionUpdateSchema;
    }) => client.collections(colName).update(updates),
    onMutate: (variables) => {
      toast.loading('saving...', { id: 'update-schema' });
      return { name: variables.colName }; // before mutation - can set "context"
    },
    onSuccess: (_, __, context) => {
      // TODO: need to handle stale state of initialSchema
      toast.success(`listing updated`);
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.detail(context.name),
      });
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.list({}) });
      setOptions((o) => ({ ...o, readOnly: true }));
    },
    onError(error) {
      console.log('ERROR: ', error);
      let msg = error.message ?? 'failed to update collection schema';
      toast.error(msg, { id: 'update-schema' });
      setOptions((o) => ({ ...o, readOnly: false }));
    },
  });

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setTimeout(() => {
      editor.getAction('editor.action.formatDocument')?.run();
      // TODO: use zod to json (zod method) to get collection schema
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: '',
            fileMatch: ['*'], // associate with any file
            schema: z.toJSONSchema(collectionSchema),
          },
        ],
      });
    }, 200);
  };

  const toggleEditMode = () => {
    setOptions((o) => ({ ...o, readOnly: !o?.readOnly }));
  };

  const onClose = () => {
    setOptions((o) => ({ ...o, readOnly: true }));
    handleClose();
  };

  const handleSave = async () => {
    let value = editorRef.current?.getValue();
    if (!value) return;
    let parsed = JSON.parse(value);
    setOptions((o) => ({ ...o, readOnly: true }));

    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }

    // typesense only supports updating metadata & fields ??
    const { fields, metadata = {} } = parsed;

    const initialVal = JSON.parse(initialSchema.current);

    const { added, removed, updated } = diffArraysOfObjects<any>(
      initialVal?.fields || [],
      fields || [],
      'name'
    );

    let fieldUpdates = [];
    for (let a of added) fieldUpdates.push(a);
    for (let r of removed) fieldUpdates.push({ name: r.name, drop: true });
    for (let u of updated) {
      fieldUpdates.push({ name: u.name, drop: true });
      fieldUpdates.push(u);
    }
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

  return (
    <Dialog fullScreen={fullScreen} maxWidth={'md'} fullWidth={true} {...props}>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent sx={{ minWidth: 240 }}>
        <Editor
          height='90vh'
          defaultLanguage='json'
          theme={themeMode === 'light' ? 'vs-light' : 'vs-dark'}
          options={options}
          onMount={handleEditorDidMount}
          value={value}
          onValidate={(m) => {
            console.log(JSON.stringify(m, null, 2));
            setMarkers(m);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {options?.readOnly ? 'close' : 'cancel'}
        </Button>
        {options?.readOnly ? (
          <Button onClick={() => toggleEditMode()} loading={mutation.isPending}>
            edit
          </Button>
        ) : (
          <Button onClick={() => handleSave()} loading={mutation.isPending}>
            save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
