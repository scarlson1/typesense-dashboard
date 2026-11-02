import { createFileRoute } from '@tanstack/react-router';

import { SITE_URL } from '#/seo';

/**
 * Served from a route (not `public/`) so the `Sitemap:` directive can carry an
 * absolute URL — the spec requires one — resolved from the request origin.
 */
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = SITE_URL || new URL(request.url).origin;

        const body = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;

        return new Response(body, {
          headers: {
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'public, max-age=0, s-maxage=3600',
          },
        });
      },
    },
  },
});
