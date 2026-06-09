import { useInitMonaco } from '@/hooks/useInitMonaco';
import { Editor, type EditorProps } from '@monaco-editor/react';
import { useColorScheme } from '@mui/material';
import { useId } from 'react';

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
  options,
  ...props
}: JsonEditorProps) {
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;
  const editorId = useId();

  const { onMount, editorPath } = useInitMonaco({
    schema,
    slotProps,
    onMount: onMountProp,
    editorId,
  });

  return (
    <Editor
      height='90vh'
      defaultLanguage='json'
      theme={themeMode === 'dark' ? DARK_THEME : LIGHT_THEME}
      onMount={onMount}
      path={editorPath}
      options={{
        wordWrap: 'bounded',
        wordWrapColumn: 80,
        ...(options || {}),
      }}
      {...props}
    />
  );
}
