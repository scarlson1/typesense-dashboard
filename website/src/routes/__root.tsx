import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { ReactNode } from 'react';

import { theme } from '#/setup/theme';
import appCss from '../styles.css?url';

const emotionCache = createCache({ key: 'css' });

const Providers = ({ children }: { children: ReactNode }) => (
  <CacheProvider value={emotionCache}>
    <ThemeProvider theme={theme} defaultMode='dark'>
      {children}
    </ThemeProvider>
  </CacheProvider>
);

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html lang='en' data-theme='dark'>
    <head>
      <HeadContent />
    </head>
    <body>
      <InitColorSchemeScript attribute='data-theme' defaultMode='system' />
      <Providers>{children}</Providers>
      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'Typesense Dashboard — Open-source UI for self-hosted Typesense',
      },
      {
        name: 'description',
        content:
          'A fast, open-source dashboard to manage self-hosted and local Typesense clusters. Search, schema editing, geosearch, API keys — 100% client-side, your keys never leave your browser.',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico', // References public/favicon.ico directly
      },
      // Optional: Add mobile/apple touch icons if needed
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
    ],
  }),
  shellComponent: RootDocument,
});
