import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';

// Absolute origin used for canonical/og:url/sitemap. On Vercel,
// VERCEL_PROJECT_PRODUCTION_URL is injected automatically at build time (the
// stable production hostname, not the per-deploy preview URL), so the site needs
// no manual config there. VITE_SITE_URL overrides it for a custom domain.
// loadEnv with an empty prefix picks these up from both process.env and .env
// files, so a local `.env` behaves the same as Vercel's build env.
const resolveSiteUrl = (mode: string): string => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const url =
    env.VITE_SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '');
  return url.replace(/\/$/, '');
};

const config = defineConfig(({ command, mode }) => ({
  define: {
    __SITE_URL__: JSON.stringify(resolveSiteUrl(mode)),
  },
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
