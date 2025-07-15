import { DEFAULT_MONACO_OPTIONS } from '@/constants';
import { useAsyncToast } from '@/hooks';
import { useCreateApiKey } from '@/hooks/useCreateApiKey';
import { typesenseActions } from '@/types';
import { type EditorProps, type OnMount } from '@monaco-editor/react';
import { Box, Button, Paper } from '@mui/material';
import { editor } from 'monaco-editor';
import { lazy, useCallback, useMemo, useRef, useState } from 'react';
import type { KeyCreateSchema } from 'typesense/lib/Typesense/Key';
import { toJSONSchema, z } from 'zod/v4';

const JsonEditor = lazy(() => import('./JsonEditor'));

const createKeySchema = z.object({
  actions: z.array(typesenseActions),
  collections: z.array(z.string()),
  description: z.string().optional(),
  value: z.string().optional(),
  value_prefix: z.string().optional(),
  expires_at: z.number().optional(),
  autodelete: z.boolean().optional(),
});

const DEFAULT_INITIAL_VALUE: KeyCreateSchema = {
  description: 'Admin key',
  actions: ['*'],
  collections: ['*'],
};

const createKeySchemaJson = toJSONSchema(createKeySchema);

type NewApiKeyEditorProps = EditorProps;

const NewApiKeyEditor = ({
  defaultValue = JSON.stringify(DEFAULT_INITIAL_VALUE),
  options,
  ...props
}: NewApiKeyEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const toast = useAsyncToast();

  const mutation = useCreateApiKey({
    onSuccess: () => {
      editorRef.current?.setValue(defaultValue);

      setTimeout(() => {
        editorRef.current?.getAction('editor.action.formatDocument')?.run();
      }, 100);
    },
  });

  // TODO: need to use editorRef.current.updateOptions ??
  const mergedOptions: editor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      ...DEFAULT_MONACO_OPTIONS,
      ...options,
      readOnly: mutation.isPending ? true : false,
    }),
    [options, mutation.isPending]
  ); // merge nested objects ??

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleSave = useCallback(() => {
    let value = editorRef.current?.getValue();
    if (!value) return;
    let parsed = JSON.parse(value);

    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }

    mutation.mutate(parsed);
  }, [mutation.mutate]);

  return (
    <Box>
      <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <JsonEditor
          height='260px'
          onMount={handleEditorDidMount}
          defaultValue={defaultValue}
          onValidate={(m) => {
            setMarkers(m);
          }}
          options={mergedOptions}
          schema={createKeySchemaJson}
          {...props}
        />
      </Paper>
      <Button
        variant='contained'
        onClick={handleSave}
        disabled={Boolean(markers.length) || mutation.isPending}
        sx={{ my: 2 }}
      >
        Create API Key
      </Button>
    </Box>
  );
};

export default NewApiKeyEditor;
