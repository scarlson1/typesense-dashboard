import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  // MUI/Emotion must be bundled for SSR so styles render server-side.
  ssr: { noExternal: ['@mui/*', '@emotion/*'] },
  plugins: [tanstackStart(), nitro(), viteReact()],
});

export default config;
