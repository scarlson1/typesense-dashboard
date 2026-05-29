export interface E2eCreds {
  node: string;
  port: number;
  protocol: string;
  apiKey: string;
}

export type TsTarget = 'v29' | 'v30';

/** Collection seeded by the E2E suite. */
export const E2E_COLLECTION = 'e2e_products';

const env = process.env;

/**
 * Connection details for each Typesense version. Defaults match the HTTP-mode
 * instances in `e2e/compose.e2e.yml` (and the CI service containers); override
 * via env to point at an existing (e.g. HTTPS dev) cluster.
 */
export const getCreds = (target: TsTarget): E2eCreds =>
  target === 'v29'
    ? {
        node: env.TS_V29_HOST ?? 'localhost',
        port: Number(env.TS_V29_PORT ?? 8108),
        protocol: env.TS_V29_PROTOCOL ?? 'http',
        apiKey: env.TS_V29_KEY ?? 'xyz',
      }
    : {
        node: env.TS_V30_HOST ?? 'localhost',
        port: Number(env.TS_V30_PORT ?? 8109),
        protocol: env.TS_V30_PROTOCOL ?? 'http',
        apiKey: env.TS_V30_KEY ?? 'xyz',
      };
