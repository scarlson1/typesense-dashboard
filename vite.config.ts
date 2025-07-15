import { sentryVitePlugin } from '@sentry/vite-plugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG || 'spencer-carlson',
      project: process.env.SENTRY_PROJECT || 'typesense-dashboard',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  base: '/typesense-dashboard',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'sentry',
  },
}));

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     tanstackRouter({
//       target: 'react',
//       autoCodeSplitting: true,
//     }),
//     react(),
//     sentryVitePlugin({
//       org: process.env.SENTRY_ORG || 'spencer-carlson',
//       project: process.env.SENTRY_PROJECT || 'typesense-dashboard',
//       authToken: process.env.SENTRY_AUTH_TOKEN,
//     }),
//   ],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//   },
//   base: '/typesense-dashboard/',
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, 'src'),
//     },
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: false,
//   },
// });
