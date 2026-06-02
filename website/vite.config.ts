import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig(({ command }) => ({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  ssr: {
    // Production build: bundle ALL app deps into the SSR output so the
    // Vercel/Nitro serverless function is self-contained — it ships only the
    // bundled chunks (no node_modules), so anything left external fails at
    // runtime with "Cannot find module" (e.g. react).
    // Dev (`serve`): only bundle MUI/Emotion (needed for server-side styles).
    // Forcing `true` in dev would push CJS deps like react through Vite's SSR
    // module-runner, which has no `module` global → "module is not defined".
    noExternal: command === 'build' ? true : ['@mui/*', '@emotion/*'],
  },
  plugins: [tanstackStart(), nitro(), viteReact()],
}));

export default config;
