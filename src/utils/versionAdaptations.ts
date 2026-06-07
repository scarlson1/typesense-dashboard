// src/utils/typesenseCompat.ts
import type { Client } from 'typesense';
// import type { SynonymItemSchema } from 'typesense/lib/Typesense/SynonymSets';
import type { AnalyticsRuleCreateSchema } from 'typesense/lib/Typesense/AnalyticsRule';
import type { AnalyticsRuleCreateSchemaV1 } from 'typesense/lib/Typesense/AnalyticsRuleV1';

// TODO: favor forward versions --> convert < v30 to v30 format
export const toAnalyticsRulePayloads = ({
  name,
  schema,
  is30Plus,
}: {
  name: string;
  schema: AnalyticsRuleCreateSchemaV1;
  is30Plus: boolean;
}) => {
  if (!is30Plus) return [schema] as AnalyticsRuleCreateSchemaV1[];

  const collections = schema.params.source.collections;
  const destinationCollection = schema.params.destination?.collection;

  return collections.map((collection) => ({
    name: collections.length === 1 ? name : `${name}_${collection}`,
    type: schema.type,
    collection,
    event_type: 'search', // schema.event_type ||
    rule_tag: name,
    params: {
      destination_collection: destinationCollection,
      limit: schema.params.limit,
      expand_query: schema.params.expand_query,
      capture_search_requests: schema.params.enable_auto_aggregation ?? true,
    },
  })) as unknown as AnalyticsRuleCreateSchema[];
};

export const upsertAnalyticsRule = async (
  client: Client,
  name: string,
  schema: AnalyticsRuleCreateSchemaV1,
  is30Plus: boolean,
) => {
  const payloads = toAnalyticsRulePayloads({ name, schema, is30Plus });

  if (!is30Plus) {
    return await client.analyticsV1
      .rules()
      .upsert(name, payloads[0] as AnalyticsRuleCreateSchemaV1);
  }

  return await client.analytics
    .rules()
    .create(payloads as AnalyticsRuleCreateSchema[]);
};

// not using adapters for breaking changes that moved scope - curation & synonyms scope: collection -> global scope

// export const synonymSetNameFor = (collectionId: string) =>
//   `${collectionId}_synonyms_index`;

// export const curationSetNameFor = (collectionId: string) =>
//   `${collectionId}_curations_index`;

// export const listSynonyms = async (
//   client: Client,
//   collectionId: string,
//   is30Plus: boolean,
// ) => {
//   if (!is30Plus) {
//     const res = await client.collections(collectionId).synonyms().retrieve();
//     return res.synonyms;
//   }

//   try {
//     return await client
//       .synonymSets(synonymSetNameFor(collectionId))
//       .items()
//       .retrieve();
//   } catch {
//     return [];
//   }
// };

// export const upsertSynonym = async (
//   client: Client,
//   collectionId: string,
//   synonymId: string,
//   params: SynonymCreateSchema,
//   is30Plus: boolean,
// ) => {
//   if (!is30Plus) {
//     return await client
//       .collections(collectionId)
//       .synonyms()
//       .upsert(synonymId, params);
//   }

//   await client
//     .synonymSets(synonymSetNameFor(collectionId))
//     .upsert({ items: [] });
//   return await client
//     .synonymSets(synonymSetNameFor(collectionId))
//     .items()
//     .upsert(synonymId, params);
// };

// export const deleteSynonym = async (
//   client: Client,
//   collectionId: string,
//   synonymId: string,
//   is30Plus: boolean,
// ) => {
//   if (!is30Plus) {
//     return await client.collections(collectionId).synonyms(synonymId).delete();
//   }

//   return await client
//     .synonymSets(synonymSetNameFor(collectionId))
//     .items(synonymId)
//     .delete();
// };

// export const listCurations = async (
//   client: Client,
//   collectionId: string,
//   is30Plus: boolean,
// ): Promise<OverrideSchema[] | CurationObjectSchema[]> => {
//   if (!is30Plus) {
//     const res = await client.collections(collectionId).overrides().retrieve();
//     return res.overrides;
//   }

//   try {
//     return await client
//       .curationSets(curationSetNameFor(collectionId))
//       .items()
//       .retrieve();
//   } catch {
//     return [];
//   }
// };

// export const upsertCuration = async (
//   client: Client,
//   collectionId: string,
//   curationId: string,
//   params: OverrideCreateSchema,
//   is30Plus: boolean,
// ) => {
//   if (!is30Plus) {
//     return await client
//       .collections(collectionId)
//       .overrides()
//       .upsert(curationId, params);
//   }

//   await client
//     .curationSets(curationSetNameFor(collectionId))
//     .upsert({ items: [] });
//   return await client
//     .curationSets(curationSetNameFor(collectionId))
//     .items(curationId)
//     .upsert({ id: curationId, ...params } as CurationObjectSchema);
// };

// export const deleteCuration = async (
//   client: Client,
//   collectionId: string,
//   curationId: string,
//   is30Plus: boolean,
// ) => {
//   if (!is30Plus) {
//     return await client
//       .collections(collectionId)
//       .overrides(curationId)
//       .delete();
//   }
//   return await client
//     .curationSets(curationSetNameFor(collectionId))
//     .items(curationId)
//     .delete();
// };
