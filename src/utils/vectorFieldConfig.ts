import {
  embedForm,
  type EmbedFormValues,
  type EmbedProvider,
  type FieldEmbed,
  type VectorConfigState,
} from '@/types';
import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection';

// `float[]` is the vector field type; vector/embed controls only apply to it.
export const VECTOR_TYPE = 'float[]';
export const DEFAULT_EMBED_MODEL = 'ts/all-MiniLM-L12-v2';

export type { VectorConfigState };

// When editing an existing field, recover which provider its model_config used.
export const inferEmbedProvider = (
  mc: FieldEmbed['model_config'] | undefined,
): EmbedProvider => {
  if (!mc) return 'builtin';
  if (mc.access_token || mc.refresh_token || mc.client_id || mc.service_account)
    return 'gcp_vertex';
  if (mc.url) return 'azure';
  if (mc.indexing_prefix || mc.query_prefix) return 'custom';
  if (mc.api_key) return 'openai';
  return 'builtin';
};

export const buildVectorConfigState = (
  field?: CollectionFieldSchema | null,
): VectorConfigState => {
  const embed = field?.embed as FieldEmbed | undefined;
  return {
    autoEmbed: Boolean(embed),
    numDim: field?.num_dim != null ? String(field.num_dim) : '',
    vecDist: (field?.vec_dist as string) ?? 'cosine',
    provider: inferEmbedProvider(embed?.model_config),
    from: embed?.from ?? [],
    modelName: embed?.model_config?.model_name ?? DEFAULT_EMBED_MODEL,
    apiKey: embed?.model_config?.api_key ?? '',
    url: embed?.model_config?.url ?? '',
    indexingPrefix: embed?.model_config?.indexing_prefix ?? '',
    queryPrefix: embed?.model_config?.query_prefix ?? '',
    gcpAuthMode: embed?.model_config?.service_account
      ? 'service_account'
      : 'oauth',
    accessToken: embed?.model_config?.access_token ?? '',
    refreshToken: embed?.model_config?.refresh_token ?? '',
    clientId: embed?.model_config?.client_id ?? '',
    clientSecret: embed?.model_config?.client_secret ?? '',
    projectId: embed?.model_config?.project_id ?? '',
    saClientEmail: embed?.model_config?.service_account?.client_email ?? '',
    saPrivateKey: embed?.model_config?.service_account?.private_key ?? '',
  };
};

// Map the flat UI state onto the `embedForm` Zod schema's inputs, which owns
// per-provider validation and builds the `embed` payload.
export const toEmbedFormValues = (s: VectorConfigState): EmbedFormValues => ({
  provider: s.provider,
  from: s.from,
  model_name: s.modelName,
  api_key: s.apiKey,
  url: s.url,
  indexing_prefix: s.indexingPrefix,
  query_prefix: s.queryPrefix,
  gcp_auth_mode: s.gcpAuthMode,
  access_token: s.accessToken,
  refresh_token: s.refreshToken,
  client_id: s.clientId,
  client_secret: s.clientSecret,
  project_id: s.projectId,
  sa_client_email: s.saClientEmail,
  sa_private_key: s.saPrivateKey,
});

/**
 * A vector field needs either explicit dimensions OR an auto-embed config
 * that passes the `embedForm` schema.
 */
export const vectorConfigInvalid = (s: VectorConfigState): boolean =>
  s.autoEmbed
    ? !embedForm.safeParse(toEmbedFormValues(s)).success
    : !(Number.isInteger(Number(s.numDim)) && Number(s.numDim) > 0);

/**
 * Apply the vector config onto a field payload (embed OR num_dim, plus
 * vec_dist). Returns false when the config is invalid; the payload is left
 * partially modified only on success.
 */
export const applyVectorConfig = (
  payload: CollectionFieldSchema,
  s: VectorConfigState,
): boolean => {
  if (s.autoEmbed) {
    const parsed = embedForm.safeParse(toEmbedFormValues(s));
    if (!parsed.success) return false;
    payload.embed = parsed.data as CollectionFieldSchema['embed'];
  } else {
    const dim = parseInt(s.numDim, 10);
    if (Number.isNaN(dim) || dim <= 0) return false;
    payload.num_dim = dim;
  }
  if (s.vecDist) payload.vec_dist = s.vecDist;
  return true;
};
