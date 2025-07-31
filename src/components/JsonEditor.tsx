import { Editor, type EditorProps, type OnMount } from '@monaco-editor/react';
import { useColorScheme, useTheme } from '@mui/material';
import Color from 'color';
import { useCallback } from 'react';

const LIGHT_THEME = 'custom-theme-light';
const DARK_THEME = 'custom-theme-dark';

export interface JsonEditorProps extends EditorProps {
  schema?: any;
}

export default function JsonEditor({
  schema = {},
  onMount,
  ...props
}: JsonEditorProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      setTimeout(() => {
        editor.getAction('editor.action.formatDocument')?.run();
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [
            // @ts-ignore
            {
              // uri: '',
              fileMatch: ['*'], // ['*.json'], // associate with any file
              schema,
            },
          ],
        });
      }, 100);
      onMount && onMount(editor, monaco);

      monaco.editor.defineTheme(DARK_THEME, {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': Color('hsl(220, 30%, 7%)').hex(),
        },
      });

      monaco.editor.defineTheme(LIGHT_THEME, {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': Color(theme.palette.background.paper).hex(),
        },
      });

      console.log('ON MOUNT: ', theme.palette.mode, themeMode);
      monaco.editor.setTheme(themeMode === 'dark' ? DARK_THEME : LIGHT_THEME);
    },
    [schema, onMount, theme, themeMode]
  );

  console.log('THEME MODE: ', themeMode);

  return (
    <Editor
      height='90vh'
      defaultLanguage='json'
      // theme={themeMode === 'light' ? 'vs-light' : 'vs-dark'}
      theme={themeMode === 'dark' ? DARK_THEME : LIGHT_THEME}
      onMount={handleEditorDidMount}
      {...props}
    />
  );
}
