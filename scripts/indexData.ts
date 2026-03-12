import dotenv from 'dotenv';
dotenv.config({ path: '../.env.import' });

import { createReadStream } from 'node:fs';
import path from 'node:path';
import * as readline from 'node:readline/promises';
import Typesense from 'typesense';

if (!process.env.TYPESENSE_HOST) throw new Error('missing TYPESENSE_HOST');
if (!process.env.TYPESENSE_PORT) throw new Error('missing TYPESENSE_PORT');
if (!process.env.TYPESENSE_PROTOCOL)
  throw new Error('missing TYPESENSE_PROTOCOL');
if (!process.env.TYPESENSE_ADMIN_API_KEY)
  throw new Error('missing TYPESENSE_ADMIN_API_KEY');

const DIR_NAME = import.meta.dirname;
const DATA_DIR = path.resolve(DIR_NAME, '../data/raw');
const DATA_FILE = path.resolve(DATA_DIR, '..', 'transformed_dataset.jsonl');
const CLIENT_BATCH_SIZE = 500000;
const typesense = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: parseInt(process.env.TYPESENSE_PORT),
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: process.env.TYPESENSE_ADMIN_API_KEY,
  connectionTimeoutSeconds: 20 * 60,
});

async function indexData() {
  const aliasName = 'airbnb_listings';
  const collectionName = `${aliasName}_${Date.now()}`;
  console.log(`Creating new collection ${collectionName}`);
  await typesense.collections().create({
    name: collectionName,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'listing_url', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'picture_url', type: 'string' },
      { name: 'host_name', type: 'string' },
      { name: 'host_id', type: 'string' },
      { name: 'host_picture_url', type: 'string' },
      { name: 'neighbourhood_cleansed', type: 'string', optional: true },
      { name: 'property_type', type: 'string', facet: true },
      { name: 'room_type', type: 'string', facet: true },
      { name: 'accommodates', type: 'int32', facet: true },
      { name: 'beds', type: 'int32', facet: true, optional: true },
      { name: 'amenities', type: 'string[]', facet: true },
      { name: 'price', type: 'float', facet: true },
      { name: 'number_of_reviews', type: 'int32', facet: true },
      {
        name: 'review_scores_rating',
        type: 'float',
        facet: true,
        optional: true,
      },
      { name: 'coordinates', type: 'geopoint' },
    ],
    default_sorting_field: 'number_of_reviews',
  });

  const fileStream = createReadStream(DATA_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  console.log(`Adding records to new collection ${collectionName}`);
  let records = '';
  let currentLine = 0;
  for await (const line of rl) {
    currentLine += 1;
    records += '\n' + line;
    if (currentLine % CLIENT_BATCH_SIZE === 0) {
      console.log(` Adding upto ${currentLine} records`);
      const results = await typesense
        .collections(collectionName)
        .documents()
        .import(records, { dirty_values: 'drop' });
      const parsedResults = results.split('\n').map((r) => JSON.parse(r));
      const failedResults = parsedResults.filter((r) => r['success'] !== true);
      if (failedResults.length > 0) {
        console.error(failedResults);
      }
      console.log(` Lines upto ${currentLine} ✅`);
      records = '';
    }
  }

  if (records.length > 0) {
    await typesense.collections(collectionName).documents().import(records);
    console.log(` Lines upto ${currentLine} ✅`);
  }

  // Update alias, and delete old collection
  let oldCollectionName;
  try {
    const alias = await typesense.aliases(aliasName).retrieve();
    oldCollectionName = alias['collection_name'];
  } catch (error) {
    // Do nothing
    console.log(error);
  }

  try {
    console.log(`Update alias ${aliasName} -> ${collectionName}`);
    await typesense
      .aliases()
      .upsert(aliasName, { collection_name: collectionName });
    if (oldCollectionName) {
      console.log(`Deleting old collection ${oldCollectionName}`);
      await typesense.collections(oldCollectionName).delete();
    }
  } catch (error) {
    console.error(error);
  }
}
indexData();
