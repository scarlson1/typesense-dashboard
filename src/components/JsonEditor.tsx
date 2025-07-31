import { Editor, type EditorProps, type OnMount } from '@monaco-editor/react';
import { useColorScheme, useTheme } from '@mui/material';
import Color from 'color';
import * as monaco from 'monaco-editor';
import { useCallback, useId, useRef } from 'react';

const LIGHT_THEME = 'custom-theme-light';
const DARK_THEME = 'custom-theme-dark';

export interface JsonEditorProps extends EditorProps {
  schema?: any;
  slotProps?: {
    background?: {
      light?: string;
      dark?: string;
    };
  };
}

export default function JsonEditor({
  schema = {},
  slotProps,
  onMount: onMountProp,

  ...props
}: JsonEditorProps) {
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;
  const editorId = useId();

  const { onMount } = useInitMonaco({
    schema,
    slotProps,
    onMount: onMountProp,
    editorId,
  });

  return (
    <Editor
      height='90vh'
      defaultLanguage='json'
      // theme={themeMode === 'light' ? 'vs-light' : 'vs-dark'}
      theme={themeMode === 'dark' ? DARK_THEME : LIGHT_THEME}
      onMount={onMount}
      {...props}
    />
  );
}

// multiple editor instances:  https://stackoverflow.com/a/79633694
function useInitMonaco({
  onMount,
  slotProps,
  schema,
  editorId,
}: JsonEditorProps & { editorId: string }) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const editorPath = `${editorId}.json`; // Unique path per editor instance

  const applySchema: OnMount = useCallback((editor, monaco) => {
    editor.getAction('editor.action.formatDocument')?.run();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: `schema://${editorId}`,
          fileMatch: [editorPath], // Match only this editor's path
          schema,
          // // uri: '',
          // fileMatch: ['*'], // ['*.json'], // associate with any file
          // schema,
        },
      ],
    });
  }, []);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      setTimeout(() => {
        applySchema(editor, monaco);
      }, 100);

      // Re-apply schema when this editor gets focus
      editor.onDidFocusEditorText(() => {
        applySchema(editor, monaco);
      });

      onMount && onMount(editor, monaco);

      monaco.editor.defineTheme(DARK_THEME, {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background':
            slotProps?.background?.dark ?? Color('hsl(220, 30%, 7%)').hex(),
        },
      });

      monaco.editor.defineTheme(LIGHT_THEME, {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background':
            slotProps?.background?.light ??
            Color(theme.palette.background.paper).hex(),
        },
      });

      monaco.editor.setTheme(themeMode === 'dark' ? DARK_THEME : LIGHT_THEME);
    },
    [schema, slotProps, onMount, theme, themeMode]
  );

  return {
    editorRef,
    onMount: handleEditorDidMount,
    editorPath,
  };
}
