import { Editor, type EditorProps, type OnMount } from '@monaco-editor/react';
import { useColorScheme } from '@mui/material';
import { useCallback } from 'react';

export interface JsonEditorProps extends EditorProps {
  schema?: any;
}

export function JsonEditor({ schema, ...props }: JsonEditorProps) {
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      setTimeout(() => {
        editor.getAction('editor.action.formatDocument')?.run();
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [
            {
              uri: '',
              fileMatch: ['*'], // associate with any file
              schema,
            },
          ],
        });
      }, 100);
      props.onMount && props.onMount(editor, monaco);
    },
    [schema, props.onMount]
  );

  return (
    <Editor
      height='90vh'
      defaultLanguage='json'
      theme={themeMode === 'light' ? 'vs-light' : 'vs-dark'}
      onMount={handleEditorDidMount}
      {...props}
    />
  );
}
