import {
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
  useMediaQuery,
  useTheme,
  type DialogProps,
} from '@mui/material';
import { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { Client } from 'typesense';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';
import { COLLECTION_SCHEMA } from '../constants';
import { useAsyncToast, useUpdateCollection } from '../hooks';
import { diffArraysOfObjects } from '../utils';
import { JsonEditor } from './JsonEditor';

// TODO: delete ?? in favor of hook

interface CollectionDialogProps extends DialogProps {
  title?: string;
  value: string;
  handleClose: () => void;
  initialOptions: EditorProps['options'];
  client: Client;
  clusterId: string;
}

// TODO: reference documentation on modifying fields (https://typesense.org/docs/28.0/api/collections.html#modifying-an-existing-field)

export function CollectionJsonDialog({
  value,
  title,
  handleClose,
  initialOptions,
  client,
  clusterId,
  ...props
}: CollectionDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<Monaco>(null);
  const initialSchema = useRef(value);
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
    initialSchema.current = value;
  }, [value]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
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
        <JsonEditor
          height='90vh'
          options={options}
          onMount={handleEditorDidMount}
          value={value}
          onValidate={(m) => {
            console.log(JSON.stringify(m, null, 2));
            setMarkers(m);
          }}
          schema={COLLECTION_SCHEMA}
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
