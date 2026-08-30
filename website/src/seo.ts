/* Central SEO config for the marketing site.
   Everything that describes the site to crawlers and link unfurlers lives here
   so the values can't drift between <head>, the manifest and the sitemap. */

import { REPO_URL } from '#/components/landing/links';

/**
 * Absolute origin of the deployed site, e.g. `https://typesense-dashboard.vercel.app`.
 * Inlined at build time by `vite.config.ts` from `VITE_SITE_URL`, falling back to
 * Vercel's `VERCEL_PROJECT_PRODUCTION_URL`. Empty when neither is set, in which case
 * the URL-dependent tags are omitted — an absent canonical beats one pointing at a
 * domain we don't own.
 */
export const SITE_URL = __SITE_URL__.replace(/\/$/, '');

export const SITE_NAME = 'Typesense Dashboard';

export const SITE_TITLE =
  'Typesense Dashboard — Open-source UI for self-hosted Typesense';

export const SITE_DESCRIPTION =
  'A fast, open-source dashboard to manage self-hosted and local Typesense clusters. Search, schema editing, geosearch, API keys — 100% client-side, your keys never leave your browser.';

/** 1200×630 social card in `public/`. */
export const OG_IMAGE_PATH = '/og.jpg';

/** Absolute URL for `path`, or `undefined` when SITE_URL isn't configured. */
export const absoluteUrl = (path: string): string | undefined =>
  SITE_URL ? `${SITE_URL}${path}` : undefined;

interface MetaTag {
  /** Present only on the single title entry; TanStack renders it as <title>. */
  title?: string;
  name?: string;
  property?: string;
  content?: string;
}

/**
 * Open Graph + Twitter + robots meta for a page. Tags that need an absolute URL
 * are dropped when SITE_URL is unset.
 */
export const seoMeta = ({
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  path = '/',
  image = OG_IMAGE_PATH,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
} = {}): MetaTag[] => {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return [
    { title },
    { name: 'description', content: description },
    {
      name: 'robots',
      content:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    { name: 'theme-color', content: '#0b0f17' },

    // Open Graph — Facebook, LinkedIn, Slack, Discord, iMessage.
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:locale', content: 'en_US' },
    ...(url ? [{ property: 'og:url', content: url }] : []),
    ...(imageUrl
      ? [
          { property: 'og:image', content: imageUrl },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          { property: 'og:image:type', content: 'image/jpeg' },
          {
            property: 'og:image:alt',
            content: `${SITE_NAME} — cluster overview, search and schema editing in one UI`,
          },
        ]
      : []),

    // Twitter/X. summary_large_image needs the same absolute image URL.
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    ...(imageUrl ? [{ name: 'twitter:image', content: imageUrl }] : []),
  ];
};

/** Canonical link, omitted when SITE_URL isn't configured. */
export const seoLinks = (path = '/') => {
  const url = absoluteUrl(path);
  return url ? [{ rel: 'canonical', href: url }] : [];
};

/**
 * JSON-LD describing the dashboard itself. SoftwareApplication is the schema.org
 * type Google uses for app rich results; `offers.price: '0'` is what marks it free.
 */
export const softwareApplicationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Search engine administration',
  operatingSystem: 'Web browser, macOS, Windows, Linux',
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  codeRepository: REPO_URL,
  softwareHelp: `${REPO_URL}#readme`,
  ...(SITE_URL && { url: SITE_URL }),
  ...(absoluteUrl(OG_IMAGE_PATH) && { image: absoluteUrl(OG_IMAGE_PATH) }),
  author: {
    '@type': 'Organization',
    name: 'Typesense Dashboard contributors',
    url: REPO_URL,
  },
});
