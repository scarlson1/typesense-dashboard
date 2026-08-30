import { loader } from '@monaco-editor/react';
// Narrow entry points on purpose: `editor.api` is Monaco's core editor with NO
// languages, and we register ONLY the JSON language below. This omits Monaco's
// ~90 other language grammars, keeping the (lazy) monaco chunk ~2-3MB instead
// of ~4.2MB.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// `jsonDefaults` must come from the contribution module itself: on this narrow
// entry point `monaco.languages.json` is undefined — only Monaco's full
// `editor.main` entry re-attaches the language services onto `languages`.
import { jsonDefaults } from 'monaco-editor/esm/vs/language/json/monaco.contribution';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

declare global {
  interface Window {
    MonacoEnvironment?: monaco.Environment;
  }
}

// Serve Monaco's language workers from the app bundle. Vite's `?worker` imports
// emit self-contained worker chunks, so validation/formatting run off the main
// thread with no network fetch.
self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'json') return new JsonWorker();
    return new EditorWorker();
  },
};

// Point @monaco-editor/react at this bundled instance instead of its default
// jsDelivr CDN loader, so the JSON editors work offline (Electron / air-gapped
// self-hosted) with no third-party dependency. `loader.init()` then resolves
// synchronously against `monaco` without any network request.
loader.config({ monaco });

export { jsonDefaults, monaco };
