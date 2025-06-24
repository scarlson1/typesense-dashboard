import { editor } from 'monaco-editor';
import { z } from 'zod/v4';
import { collectionSchema } from '../types';

export const DEFAULT_MONACO_OPTIONS: editor.IStandaloneEditorConstructionOptions =
  {
    tabSize: 2,
    minimap: { enabled: false },
    // lineNumbers: true,
    quickSuggestions: true, // Auto-completion
    // autoIndent: true,
    automaticLayout: true,
    // validate: true,
    folding: true,
    hover: {
      enabled: true,
    },
    suggest: {
      // insertMode: 'insert',
      showInlineDetails: true,
      // showDetails: true,
      preview: true,
      // previewMode: 'prefix',
      // maxVisibleSuggestions: 12,
    },
  };

export const COLLECTION_SCHEMA = z.toJSONSchema(collectionSchema);
