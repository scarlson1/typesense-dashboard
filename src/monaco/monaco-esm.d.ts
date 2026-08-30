declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor';
}

// Monaco 0.55 moved the language services off `languages.json` and onto a
// top-level `json` namespace, and only the full `editor.main` entry re-attaches
// them (`monacoApi.languages.json = ...`). We deliberately load the narrow
// `editor.api` entry, so we import this contribution's `jsonDefaults` directly.
// The shipped .d.ts for this path is empty, so re-type it off monaco's public
// `json` namespace.
declare module 'monaco-editor/esm/vs/language/json/monaco.contribution' {
  import type { json } from 'monaco-editor';

  export const jsonDefaults: typeof json.jsonDefaults;
  export const getWorker: typeof json.getWorker;
}
