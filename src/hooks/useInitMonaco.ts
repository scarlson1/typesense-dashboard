import type { JsonEditorProps } from '@/components/JsonEditor';
import { type OnMount } from '@monaco-editor/react';
import { useColorScheme } from '@mui/material';
import Color from 'color';
import * as monaco from 'monaco-editor';
import { useCallback, useRef } from 'react';

const LIGHT_THEME = 'custom-theme-light';
const DARK_THEME = 'custom-theme-dark';

// Monaco's `editor.background` needs a literal hex; it can't consume a CSS
// variable. Resolve the design palette via the computed style on <html> so
// the editor surface matches whatever theme is active at mount time.
function resolveSurfaceHex(fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--ts-surface')
    .trim();
  if (!raw) return fallback;
  try {
    return Color(raw).hex();
  } catch {
    return fallback;
  }
}

// multiple editor instances:  https://stackoverflow.com/a/79633694
export function useInitMonaco({
  onMount,
  slotProps,
  schema,
  editorId,
}: JsonEditorProps & { editorId: string }) {
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const editorPath = `${editorId}.json`; // Unique path per editor instance

  const applySchema: OnMount = useCallback(
    (editor, monaco) => {
      // Both this hook's deferred timer and its focus handler can fire after
      // the editor (and Monaco's services) have been disposed — closing a
      // dialog or changing route tears the webview port down. Guard against a
      // missing editor and swallow the disposal race so it can't crash React.
      if (!editor) return;
      try {
        editor.getAction('editor.action.formatDocument')?.run();
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [
            {
              uri: `schema://${editorId}`, // '', // 'http://json-schema.org/draft-04/schema#',
              fileMatch: [editorPath], // Match only this editor's path
              schema,
              // uri: '',
              // fileMatch: ['*'], // ['*.json'], // associate with any file
              // schema,
            },
          ],
        });
      } catch {
        // editor / InstantiationService disposed mid-flight; nothing to apply.
      }
    },
    [editorId, editorPath, schema],
  );

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      if (!editor) return;
      editorRef.current = editor;

      // applySchema is deferred; if the editor is disposed within this window
      // (React StrictMode's dev mount/unmount/remount, or the dialog closing /
      // route changing before it fires) the callback would touch torn-down
      // Monaco services and throw "InstantiationService has been disposed".
      // Track disposal and cancel/skip every deferred path.
      let disposed = false;
      const schemaTimer = setTimeout(() => {
        if (disposed) return;
        applySchema(editor, monaco);
      }, 100);
      editor.onDidDispose(() => {
        disposed = true;
        clearTimeout(schemaTimer);
      });

      // Re-apply schema when this editor gets focus
      editor.onDidFocusEditorText(() => {
        if (disposed) return;
        applySchema(editor, monaco);
      });

      onMount && onMount(editor, monaco);

      monaco.editor.defineTheme(DARK_THEME, {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background':
            slotProps?.background?.dark ?? resolveSurfaceHex('#11161f'),
        },
      });

      monaco.editor.defineTheme(LIGHT_THEME, {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background':
            slotProps?.background?.light ?? resolveSurfaceHex('#ffffff'),
        },
      });

      monaco.editor.setTheme(themeMode === 'dark' ? DARK_THEME : LIGHT_THEME);
    },
    [schema, slotProps, onMount, themeMode, applySchema],
  );

  return {
    editorRef,
    onMount: handleEditorDidMount,
    editorPath,
  };
}
