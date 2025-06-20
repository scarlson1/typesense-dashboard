import {
  Editor,
  type EditorProps,
  type Monaco,
  type OnMount,
} from '@monaco-editor/react';
import { Box, Button, Paper, Skeleton, useColorScheme } from '@mui/material';
import { editor } from 'monaco-editor';
import { useMemo, useRef, useState } from 'react';
import { toJSONSchema } from 'zod/v4';
import { DEFAULT_MONACO_OPTIONS } from '../constants';
import { useAsyncToast, useNewCollection } from '../hooks';
import { createCollectionSchema, type CollectionSchema } from '../types';

const DEFAULT_INITIAL_VALUE: CollectionSchema = {
  name: 'companies',
  fields: [
    {
      name: 'company_name',
      type: 'string',
    },
    {
      name: 'num_employees',
      type: 'int32',
      facet: true,
    },
  ],
  default_sorting_field: 'num_employees',
  enable_nested_fields: true,
};

interface NewCollectionEditorProps extends EditorProps {}

export const NewCollectionEditor = ({
  defaultValue = JSON.stringify(DEFAULT_INITIAL_VALUE),
  options,
  ...props
}: NewCollectionEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<Monaco>(null);
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;
  const toast = useAsyncToast();
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  const mutation = useNewCollection();

  const mergedOptions = useMemo(
    () => ({
      ...DEFAULT_MONACO_OPTIONS,
      ...options,
      readOnly: mutation.isPending ? true : false,
    }),
    [options, mutation.isPending]
  ); // merge nested objects ??

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setTimeout(() => {
      editor.getAction('editor.action.formatDocument')?.run();
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: '',
            fileMatch: ['*'], // associate with any file
            schema: toJSONSchema(createCollectionSchema),
          },
        ],
      });
    }, 200);
  };

  const handleSave = async () => {
    let value = editorRef.current?.getValue();
    if (!value) return;
    let parsed = JSON.parse(value);
    // set read only ??

    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }

    mutation.mutate(parsed);
  };

  return (
    <Box>
      <Paper>
        <Editor
          height='60vh'
          defaultLanguage='json'
          theme={themeMode === 'light' ? 'vs-light' : 'vs-dark'}
          onMount={handleEditorDidMount}
          defaultValue={defaultValue}
          onValidate={(m) => {
            setMarkers(m);
          }}
          options={mergedOptions}
          loading={<Skeleton variant='rounded' height={'100%'} />}
          {...props}
        />
      </Paper>
      <Button
        variant='contained'
        onClick={handleSave}
        disabled={Boolean(markers.length)}
        loading={mutation.isPending}
        sx={{ my: 2 }}
      >
        Create Collection
      </Button>
    </Box>
  );
};
