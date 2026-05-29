import type { Client } from 'typesense';
import { E2E_COLLECTION } from './creds';

const SCHEMA = {
  name: E2E_COLLECTION,
  fields: [
    { name: 'title', type: 'string' as const },
    { name: 'brand', type: 'string' as const, facet: true },
    { name: 'price', type: 'float' as const },
  ],
  default_sorting_field: 'price',
};

const DOCS = [
  { id: '1', title: 'Aurora Desk Lamp', brand: 'Lumen', price: 49.0 },
  { id: '2', title: 'Nimbus Office Chair', brand: 'SeatCo', price: 199.0 },
  { id: '3', title: 'Vertex Standing Desk', brand: 'Lumen', price: 420.0 },
];

/**
 * Idempotently (re)create the E2E collection and import sample documents.
 * Safe to call before every test.
 */
export const seedProducts = async (client: Client) => {
  try {
    await client.collections(E2E_COLLECTION).delete();
  } catch {
    // collection didn't exist — fine
  }
  await client.collections().create(SCHEMA);
  await client
    .collections(E2E_COLLECTION)
    .documents()
    .import(DOCS, { action: 'upsert' });
};
