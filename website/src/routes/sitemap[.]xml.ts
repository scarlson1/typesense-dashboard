import { createFileRoute } from '@tanstack/react-router';

import { SITE_URL } from '#/seo';

/**
 * The site is a single page, so the sitemap exists mostly to give crawlers a
 * lastmod signal and a canonical entry point.
 *
 * Served from a route rather than `public/` so the origin is resolved at request
 * time — that keeps it correct on preview deploys and custom domains without
 * baking a hostname into a static file. SITE_URL wins when it's configured.
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = SITE_URL || new URL(request.url).origin;
        const lastmod = new Date().toISOString().slice(0, 10);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

        return new Response(xml, {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=0, s-maxage=3600',
          },
        });
      },
    },
  },
});
