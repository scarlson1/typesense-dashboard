import { DEFAULT_MONACO_OPTIONS } from '@/constants';
import { useAsyncToast } from '@/hooks';
import { useCreateApiKey } from '@/hooks/useCreateApiKey';
import { typesenseActions } from '@/types';
import { designTokens } from '@/theme/themePrimitives';
import { primaryButtonSx } from '@/components/redesign';
import { type OnMount } from '@monaco-editor/react';
import { Box, Button, Paper, Skeleton, Stack } from '@mui/material';
import { editor } from 'monaco-editor';
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import type { KeyCreateSchema } from 'typesense/lib/Typesense/Key';
import { toJSONSchema, z } from 'zod/v4';

const JsonEditor = lazy(() => import('./JsonEditor'));
const NewApiKeyForm = lazy(() => import('./NewApiKeyForm'));

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

type TabValue = 'form' | 'json';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'form', label: 'Form' },
  { value: 'json', label: 'JSON' },
];

interface NewApiKeyEditorProps {
  onSuccess?: () => void;
}

const NewApiKeyEditor = ({ onSuccess }: NewApiKeyEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const [tab, setTab] = useState<TabValue>('form');
  const [formValues, setFormValues] =
    useState<KeyCreateSchema>(DEFAULT_INITIAL_VALUE);
  const toast = useAsyncToast();

  const mutation = useCreateApiKey({
    onSuccess: () => {
      setFormValues(DEFAULT_INITIAL_VALUE);
      editorRef.current?.setValue(JSON.stringify(DEFAULT_INITIAL_VALUE));
      setTimeout(() => {
        editorRef.current?.getAction('editor.action.formatDocument')?.run();
      }, 100);
      onSuccess?.();
    },
  });

  const mergedOptions: editor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      ...DEFAULT_MONACO_OPTIONS,
      readOnly: mutation.isPending,
    }),
    [mutation.isPending],
  );

  const handleEditorDidMount: OnMount = (ed) => {
    editorRef.current = ed;
  };

  const handleSwitchTab = useCallback(
    (next: TabValue) => {
      if (next === tab) return;
      if (tab === 'json') {
        const raw = editorRef.current?.getValue();
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as KeyCreateSchema;
            setFormValues(parsed);
          } catch {
            // leave form state as-is; user can fix JSON and try again
          }
        }
      } else {
        editorRef.current?.setValue(JSON.stringify(formValues, null, 2));
      }
      setTab(next);
    },
    [tab, formValues],
  );

  const handleSubmitJson = useCallback(() => {
    const value = editorRef.current?.getValue();
    if (!value) return;
    if (markers.length) {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
      return;
    }
    try {
      const parsed = JSON.parse(value);
      mutation.mutate(parsed);
    } catch {
      toast.warn('Invalid JSON', { id: 'monaco-validation' });
    }
  }, [markers.length, mutation, toast]);

  const handleSubmitForm = useCallback(() => {
    mutation.mutate(formValues);
  }, [mutation, formValues]);

  return (
    <Box>
      <Stack
        direction='row'
        sx={{
          gap: 0.5,
          mx: -1.5,
          mt: -1.5,
          mb: 1.5,
          px: 1.25,
          borderBottom: `1px solid ${designTokens.border}`,
        }}
      >
        {TABS.map((t) => {
          const active = t.value === tab;
          return (
            <Box
              key={t.value}
              onClick={() => handleSwitchTab(t.value)}
              sx={{
                px: 1.5,
                py: 1,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? designTokens.text : designTokens.textMuted,
                cursor: 'pointer',
                borderBottom: active
                  ? `2px solid ${designTokens.accent}`
                  : '2px solid transparent',
                mb: '-1px',
                transition: 'color 120ms ease',
                '&:hover': { color: designTokens.text },
              }}
            >
              {t.label}
            </Box>
          );
        })}
      </Stack>

      {tab === 'form' ? (
        <Suspense fallback={<Skeleton variant='rounded' height={300} />}>
          <NewApiKeyForm
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleSubmitForm}
            submitting={mutation.isPending}
          />
        </Suspense>
      ) : (
        <Box>
          <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Suspense fallback={<Skeleton variant='rounded' height={260} />}>
              <JsonEditor
                height='260px'
                onMount={handleEditorDidMount}
                defaultValue={JSON.stringify(formValues, null, 2)}
                onValidate={(m) => setMarkers(m)}
                options={mergedOptions}
                schema={createKeySchemaJson}
              />
            </Suspense>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant='contained'
              onClick={handleSubmitJson}
              disabled={Boolean(markers.length) || mutation.isPending}
              sx={{
                ...primaryButtonSx,
                color: designTokens.onAccent,
              }}
            >
              {mutation.isPending ? 'Creating…' : 'Create key'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NewApiKeyEditor;
