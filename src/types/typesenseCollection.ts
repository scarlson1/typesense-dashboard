import { z } from 'zod/v4';

export const typesenseFieldType = z.enum([
  'auto',
  'string',
  'int32',
  'int64',
  'float',
  'bool',
  'object',
  'geopoint',
  'geopolygon',
  'geopoint[]',
  'string[]',
  'int32[]',
  'int64[]',
  'float[]',
  'bool[]',
  'object[]',
  'string*',
  'image',
]);
export type TypesenseFieldType = z.infer<typeof typesenseFieldType>;

export const collectionFieldForm = z
  .object({
    name: z.string(),
    type: typesenseFieldType,
    facet: z.boolean(), // .optional(), // .default(false).optional(),
    optional: z.boolean(), // .optional(), // .default(false), // .optional(),
    index: z.boolean(), // .optional(), // .default(true).optional(),
    store: z.boolean(), // .optional(), // .default(true).optional(),
    sort: z.boolean(), // .optional(), // .optional(),
    infix: z.boolean(), // .optional(), // .optional(), // .default(false), //.optional(),
    // locale: z.string().optional(),
    // num_dim: z.any().optional(),
    // vec_dist: z.string().optional(), // use enum ??
    // reference: z.string().optional(),
    range_index: z.boolean(), // .optional(), // .default(false), // .optional(), // TODO: only if number type ??
    stem: z.boolean(), // .optional(),
  })
  .and(z.record(z.string(), z.unknown()));

export const languageCodes = z.enum([
  'ar',
  'zh',
  'nl',
  'en',
  'fr',
  'de',
  'hi',
  'id',
  'it',
  'ja',
  'ko',
  'ms',
  'pl',
  'pt',
  'ru',
  'el',
  'es',
  'th',
  'tr',
  'vi',
]);

export const createCollectionSchemaForm = z.object({
  name: z.string(),
  fields: z.array(collectionFieldForm),
  default_sorting_field: z.string(), // .optional(),
  enable_nested_fields: z.boolean(), // .nullable(), // .optional(),
  token_separators: z.array(z.string()).optional(),
  symbols_to_index: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  voice_query_model: z
    .object({
      model_name: z.string().optional(),
    })
    .optional(),
});

export const collectionField = z
  .object({
    name: z.string(),
    type: typesenseFieldType,
    facet: z.boolean().optional(),
    optional: z.boolean().optional(),
    index: z.boolean().optional(),
    store: z.boolean().optional(),
    sort: z.boolean().optional(),
    infix: z.boolean().optional(),
    locale: z.string().optional(),
    num_dim: z.any().optional(),
    vec_dist: z.string().optional(), // use enum ??
    reference: z.string().optional(),
    range_index: z.boolean().optional(), // TODO: only if number type ??
    stem: z.boolean().optional(),
    stem_dictionary: z.string().optional(),
  })
  .and(z.record(z.string(), z.unknown()));

export const createCollectionSchema = z.object({
  name: z.string(),
  fields: z.array(collectionField),
  default_sorting_field: z.string().optional(),
  enable_nested_fields: z.boolean().optional(),
  token_separators: z.array(z.string()).optional(),
  symbols_to_index: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  voice_query_model: z
    .object({
      model_name: z.string().optional(),
    })
    .optional(),
});

export const collectionSchema = createCollectionSchema.extend({
  created_at: z.number().optional(),
  num_documents: z.number().optional(),
});
export type CollectionSchema = z.infer<typeof collectionSchema>;
