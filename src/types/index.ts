import { z } from 'zod/v4';

export * from './typesenseApiKeyActions';
export * from './typesenseCollection';

export const environment = z.enum([
  'development',
  'production',
  'staging',
  'testing',
  'ci',
]);
export type Environment = z.infer<typeof environment>;
