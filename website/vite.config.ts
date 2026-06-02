import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig(({ command }) => ({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  // ssr: {
  //   // Production build: bundle ALL app deps so the Vercel/Nitro serverless
  //   // function is self-contained — it ships only the bundled chunks (no
  //   // node_modules), so anything left external fails at runtime with
  //   // "Cannot find module" (e.g. react).
  //   // Dev (`serve`): only bundle MUI/Emotion for server-side styles. Bundling
  //   // more pushes CJS deps through Vite's dev SSR module-runner, which lacks
  //   // `module`/`exports` globals → "... is not defined".
  //   noExternal: command === 'build' ? true : ['@mui/*', '@emotion/*'],
  // },
  ...(process.env.NODE_ENV === 'production' && {
    ssr: {
      noExternal: ['@mui/*'],
    },
  }),
  optimizeDeps: {
    include: ['@emotion/styled'],
  },
  nitro: {
    preset: 'vercel',
  },
  plugins: [
    tanstackStart(),
    // nitro() only at build time — it emits the Vercel `.output` bundle. In dev
    // it routes SSR through Vite's module-runner, which can't evaluate CJS deps
    // (react, @emotion/cache) and crashes the page with "exports is not defined".
    ...(command === 'build' ? [nitro()] : []),
    viteReact(),
  ],
}));

export default config;
