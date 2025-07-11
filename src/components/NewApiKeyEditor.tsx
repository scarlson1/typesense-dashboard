import { apiKeyQueryKeys, DEFAULT_MONACO_OPTIONS } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { typesenseActions } from '@/types';
import { queryClient } from '@/utils';
import {
  Editor,
  type EditorProps,
  type Monaco,
  type OnMount,
} from '@monaco-editor/react';
import { Box, Button, Paper, useColorScheme } from '@mui/material';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { editor } from 'monaco-editor';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { KeyCreateSchema } from 'typesense/lib/Typesense/Key';
import { toJSONSchema, z } from 'zod/v4';

const createKeySchema = z.object({
  actions: z.array(typesenseActions),
  collections: z.array(z.string()),
  description: z.string().optional(),
  value: z.string().optional(),
  value_prefix: z.string().optional(),
  expires_at: z.number().optional(),
  autodelete: z.boolean().optional(),
});

type UseNewApiKeyProps = Omit<
  UseMutationOptions<KeyCreateSchema, Error, KeyCreateSchema>,
  'mutationFn'
>;

const useCreateApiKey = (props?: UseNewApiKeyProps) => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const { onSuccess, onError, ...rest } = props || {};

  return useMutation({
    ...rest,
    mutationFn: (values: KeyCreateSchema) => client.keys().create(values),
    onSuccess: (data, vars) => {
      toast.success('API key created', { id: 'new-api-key' });
      queryClient.invalidateQueries({
        queryKey: apiKeyQueryKeys.all(clusterId),
      });

      onSuccess && onSuccess(data, vars, {});
    },
    onError: (e, vars, ctx) => {
      let msg = e.message || 'an error occurred';
      toast.error(msg, { id: 'new-api-key' });
      onError && onError(e, vars, ctx);
    },
  });
};

const DEFAULT_INITIAL_VALUE: KeyCreateSchema = {
  description: 'Admin key',
  actions: ['*'],
  collections: ['*'],
};

const createKeySchemaJson = toJSONSchema(createKeySchema);

interface NewApiKeyEditorProps extends EditorProps {}

const NewApiKeyEditor = ({
  defaultValue = JSON.stringify(DEFAULT_INITIAL_VALUE),
  options,
  ...props
}: NewApiKeyEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<Monaco>(null);
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;
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

  // reset editor onSuccess

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
            schema: createKeySchemaJson,
          },
        ],
      });
    }, 200);
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
        <Editor
          height='260px'
          defaultLanguage='json'
          theme={themeMode === 'light' ? 'vs-light' : 'vs-dark'}
          onMount={handleEditorDidMount}
          defaultValue={defaultValue}
          onValidate={(m) => {
            setMarkers(m);
          }}
          options={mergedOptions}
          // loading={<Skeleton variant='rounded' height={'100%'} />}
          {...props}
        />
      </Paper>
      <Button
        variant='contained'
        onClick={handleSave}
        disabled={Boolean(markers.length) || mutation.isPending}
        // loading={mutation.isPending}
        sx={{ my: 2 }}
      >
        Create API Key
      </Button>
    </Box>
  );
};

export default NewApiKeyEditor;
