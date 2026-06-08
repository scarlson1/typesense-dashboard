/**
 * Shared reference data for the LLM providers Typesense supports across NL
 * search models and conversational/RAG models.
 *
 * NOTE: the exact per-provider *credential* fields differ between the two
 * resources (typesense-js types `NLSearchModelBase` as a flat superset with
 * project_id/access_token/top_k/etc., while `ConversationModelCreateSchema`
 * uses url/vllm_url/openai_url/openai_path/ttl). This file intentionally only
 * captures what is genuinely shared — the provider identity and the
 * `<prefix>/<model>` naming convention. Each feature's create form owns its
 * own field set, validated against its SDK schema and the live server.
 *
 * Docs: https://typesense.org/docs/latest/api/natural-language-search.html#supported-model-types
 */

export type LlmProviderId =
  | 'openai'
  | 'azure'
  | 'cloudflare'
  | 'vllm'
  | 'google'
  | 'gcp';

export interface LlmProviderDef {
  id: LlmProviderId;
  label: string;
  /** Prefix that precedes the model id in `model_name` (e.g. `openai`). */
  prefix: string;
  /** Example model id shown as a placeholder (the part after the prefix). */
  modelExample: string;
}

/**
 * A provider-specific credential/config input. The `key` is the request field
 * name (e.g. `api_key`, `api_url`, `account_id`). Resource forms (NL search /
 * conversation models) supply their own provider→fields mapping since the two
 * resources accept different field sets.
 */
export interface LlmFieldDef {
  key: string;
  label: string;
  required?: boolean;
  /** Render as a password input and treat as write-only. */
  secret?: boolean;
  placeholder?: string;
  helper?: string;
}

export const LLM_PROVIDERS: readonly LlmProviderDef[] = [
  { id: 'openai', label: 'OpenAI', prefix: 'openai', modelExample: 'gpt-4.1' },
  {
    id: 'azure',
    label: 'Azure OpenAI',
    prefix: 'azure',
    modelExample: 'gpt-35-turbo',
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare Workers AI',
    prefix: 'cloudflare',
    modelExample: '@cf/meta/llama-2-7b-chat-int8',
  },
  {
    id: 'vllm',
    label: 'vLLM (self-hosted)',
    prefix: 'vllm',
    modelExample: 'mistral-7b-instruct',
  },
  {
    id: 'google',
    label: 'Google Gemini',
    prefix: 'google',
    modelExample: 'gemini-2.5-flash',
  },
  {
    id: 'gcp',
    label: 'GCP Vertex AI',
    prefix: 'gcp',
    modelExample: 'gemini-2.5-flash',
  },
] as const;

const PROVIDER_BY_ID = new Map(LLM_PROVIDERS.map((p) => [p.id, p]));
const PROVIDER_BY_PREFIX = new Map(LLM_PROVIDERS.map((p) => [p.prefix, p]));

export const getLlmProvider = (id: string): LlmProviderDef | undefined =>
  PROVIDER_BY_ID.get(id as LlmProviderId);

/** Compose a `model_name` from a provider id and a bare model id. */
export const toModelName = (providerId: LlmProviderId, model: string): string =>
  `${getLlmProvider(providerId)?.prefix ?? providerId}/${model}`;

/**
 * Parse an existing `model_name` back into its provider + bare model id.
 * Splits on the first `/` so provider-namespaced ids like Cloudflare's
 * `cloudflare/@cf/meta/...` keep the rest of the path as the model.
 */
export const splitModelName = (
  modelName: string,
): { provider?: LlmProviderDef; model: string } => {
  const slash = modelName.indexOf('/');
  if (slash === -1) return { model: modelName };
  const prefix = modelName.slice(0, slash);
  return {
    provider: PROVIDER_BY_PREFIX.get(prefix),
    model: modelName.slice(slash + 1),
  };
};
