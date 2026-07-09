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

export const embedProvider = z.enum([
  'builtin',
  'openai',
  'azure',
  'gcp_vertex',
  'custom',
]);
export type EmbedProvider = z.infer<typeof embedProvider>;

// GCP Vertex AI authenticates with either OAuth credentials or a service
// account; the edit dialog picks one mode and only that set is required/sent.
export const gcpAuthMode = z.enum(['oauth', 'service_account']);
export type GcpAuthMode = z.infer<typeof gcpAuthMode>;

/**
 * Flat UI state for configuring a `float[]` vector field: either manual
 * dimensions (`numDim`) or an auto-embed config. Shared by the schema-field
 * edit dialog and the new-collection form (helpers in utils/vectorFieldConfig).
 */
export interface VectorConfigState {
  autoEmbed: boolean;
  numDim: string;
  vecDist: string;
  provider: EmbedProvider;
  from: string[];
  modelName: string;
  apiKey: string;
  url: string;
  indexingPrefix: string;
  queryPrefix: string;
  gcpAuthMode: GcpAuthMode;
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  projectId: string;
  saClientEmail: string;
  saPrivateKey: string;
}

// Shape of `embed.model_config` sent to Typesense. Known keys are typed; the
// schema stays loose so provider-specific extras pass through untouched.
export const fieldEmbedModelConfig = z
  .object({
    model_name: z.string(),
    api_key: z.string().optional(),
    url: z.string().optional(),
    indexing_prefix: z.string().optional(),
    query_prefix: z.string().optional(),
    // GCP Vertex AI (OAuth)
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
    project_id: z.string().optional(),
    // GCP Vertex AI (service account)
    service_account: z
      .object({
        client_email: z.string().optional(),
        private_key: z.string().optional(),
      })
      .optional(),
  })
  .loose();

// Auto-embedding config for `float[]` vector fields, as sent to Typesense.
export const fieldEmbed = z.object({
  from: z.array(z.string()),
  model_config: fieldEmbedModelConfig,
});
export type FieldEmbed = z.infer<typeof fieldEmbed>;

// Flat form values from the schema-field edit dialog. `embedForm` validates
// them per provider and transforms them into a Typesense `embed` object, giving
// the dialog a single source of truth for embed validation + assembly.
export const embedFormValues = z.object({
  provider: embedProvider,
  from: z.array(z.string()),
  model_name: z.string(),
  api_key: z.string(),
  url: z.string(),
  indexing_prefix: z.string(),
  query_prefix: z.string(),
  gcp_auth_mode: gcpAuthMode,
  access_token: z.string(),
  refresh_token: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
  project_id: z.string(),
  sa_client_email: z.string(),
  sa_private_key: z.string(),
});
export type EmbedFormValues = z.infer<typeof embedFormValues>;

const trimmed = (s: string): string => s.trim();

export const embedForm = embedFormValues
  .check((ctx) => {
    const v = ctx.value;
    if (!trimmed(v.model_name))
      ctx.issues.push({
        code: 'custom',
        path: ['model_name'],
        message: 'Model name is required',
        input: v.model_name,
      });
    if (v.from.length === 0)
      ctx.issues.push({
        code: 'custom',
        path: ['from'],
        message: 'Select at least one field to embed from',
        input: v.from,
      });
    switch (v.provider) {
      case 'openai':
        if (!trimmed(v.api_key))
          ctx.issues.push({
            code: 'custom',
            path: ['api_key'],
            message: 'API key is required',
            input: v.api_key,
          });
        break;
      case 'azure':
        if (!trimmed(v.api_key))
          ctx.issues.push({
            code: 'custom',
            path: ['api_key'],
            message: 'API key is required',
            input: v.api_key,
          });
        if (!trimmed(v.url))
          ctx.issues.push({
            code: 'custom',
            path: ['url'],
            message: 'Endpoint URL is required',
            input: v.url,
          });
        break;
      case 'gcp_vertex': {
        if (!trimmed(v.project_id))
          ctx.issues.push({
            code: 'custom',
            path: ['project_id'],
            message: 'Project ID is required',
            input: v.project_id,
          });
        if (v.gcp_auth_mode === 'oauth') {
          const complete =
            Boolean(trimmed(v.access_token)) &&
            Boolean(trimmed(v.refresh_token)) &&
            Boolean(trimmed(v.client_id)) &&
            Boolean(trimmed(v.client_secret));
          if (!complete)
            ctx.issues.push({
              code: 'custom',
              path: ['access_token'],
              message: 'Complete OAuth credentials are required',
              input: v.access_token,
            });
        } else {
          const complete =
            Boolean(trimmed(v.sa_client_email)) &&
            Boolean(trimmed(v.sa_private_key));
          if (!complete)
            ctx.issues.push({
              code: 'custom',
              path: ['sa_client_email'],
              message: 'Service account email and private key are required',
              input: v.sa_client_email,
            });
        }
        break;
      }
      case 'builtin':
      case 'custom':
        break;
    }
  })
  .transform((v): FieldEmbed => {
    const mc: Record<string, unknown> = { model_name: trimmed(v.model_name) };
    if (v.provider === 'openai' || v.provider === 'azure') {
      if (trimmed(v.api_key)) mc.api_key = trimmed(v.api_key);
    }
    if (v.provider === 'azure' && trimmed(v.url)) mc.url = trimmed(v.url);
    if (v.provider === 'custom') {
      if (trimmed(v.indexing_prefix))
        mc.indexing_prefix = trimmed(v.indexing_prefix);
      if (trimmed(v.query_prefix)) mc.query_prefix = trimmed(v.query_prefix);
    }
    if (v.provider === 'gcp_vertex') {
      if (trimmed(v.project_id)) mc.project_id = trimmed(v.project_id);
      if (v.gcp_auth_mode === 'oauth') {
        const oauth: Record<string, string> = {
          access_token: trimmed(v.access_token),
          refresh_token: trimmed(v.refresh_token),
          client_id: trimmed(v.client_id),
          client_secret: trimmed(v.client_secret),
        };
        for (const [k, val] of Object.entries(oauth)) if (val) mc[k] = val;
      } else {
        const sa: Record<string, string> = {};
        if (trimmed(v.sa_client_email))
          sa.client_email = trimmed(v.sa_client_email);
        if (trimmed(v.sa_private_key))
          sa.private_key = trimmed(v.sa_private_key);
        if (Object.keys(sa).length) mc.service_account = sa;
      }
    }
    return { from: v.from, model_config: mc as FieldEmbed['model_config'] };
  });

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
    // JOIN: 'OtherCollection.field_name' — only settable at creation time.
    reference: z.string(),
    async_reference: z.boolean(),
    // Draft vector/embed UI state; transformed into embed/num_dim on submit.
    vectorConfig: z.custom<VectorConfigState>().optional(),
    range_index: z.boolean(), // .optional(), // .default(false), // .optional(), // TODO: only if number type ??
    stem: z.boolean(), // .optional(),
  })
  .loose();

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
    async_reference: z.boolean().optional(),
    range_index: z.boolean().optional(), // TODO: only if number type ??
    stem: z.boolean().optional(),
    stem_dictionary: z.string().optional(),
    // Auto-embedding config for `float[]` vector fields.
    embed: fieldEmbed.optional(),
    hnsw_params: z.record(z.string(), z.unknown()).optional(),
  })
  .loose();

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
  truncate_len: z.number().optional(),
  curation_sets: z.array(z.string()).optional(),
  synonym_sets: z.array(z.string()).optional(),
});

export const collectionSchema = createCollectionSchema
  .extend({
    created_at: z.number().optional(),
    num_documents: z.number().optional(),
  })
  // Typesense returns server-managed keys (e.g. curation_sets, synonym_sets)
  // that we don't model; allow them so the JSON editor doesn't flag the live
  // schema as invalid and disable the Save button.
  .loose();
export type CollectionSchema = z.infer<typeof collectionSchema>;
