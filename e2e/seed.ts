import type { Client } from 'typesense';
import { E2E_COLLECTION } from './creds';

const SCHEMA = {
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
 * Idempotently (re)create an E2E collection and import sample documents.
 * Tests run fully parallel, so each test should seed its own uniquely named
 * collection (see the `seededCollection` fixture) to avoid stomping others.
 */
export const seedProducts = async (
  client: Client,
  name: string = E2E_COLLECTION,
) => {
  try {
    await client.collections(name).delete();
  } catch {
    // collection didn't exist — fine
  }
  await client.collections().create({ ...SCHEMA, name });
  await client
    .collections(name)
    .documents()
    .import(DOCS, { action: 'upsert' });
};
