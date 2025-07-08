import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  base: '/typesense-dashboard/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
