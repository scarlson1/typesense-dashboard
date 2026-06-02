import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  // Bundle all app deps into the SSR build so the serverless function is
  // self-contained. The Vercel/Nitro function ships only the bundled chunks
  // (no node_modules), so anything left external fails at runtime with
  // "Cannot find module" (e.g. react). This also keeps MUI/Emotion styles
  // rendering server-side.
  ssr: { noExternal: true },
  plugins: [tanstackStart(), nitro(), viteReact()],
});

export default config;
