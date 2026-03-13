import { z } from 'zod/v4';

export const collectionActions = z.enum([
    'collections:create',
    'collections:delete',
    'collections:get',
    'collections:list',
    'collections:*',
]);

export const documentActions = z.enum([
    'documents:search',
    'documents:get',
    'documents:create',
    'documents:upsert',
    'documents:update',
    'documents:delete',
    'documents:import',
    'documents:export',
    'documents:*',
]);

export const aliasActions = z.enum([
    'aliases:list',
    'aliases:get',
    'aliases:create',
    'aliases:delete',
    'aliases:*',
]);

export const synonymActions = z.enum([
    'synonyms:list',
    'synonyms:get',
    'synonyms:create',
    'synonyms:delete',
    'synonyms:*',
]);

export const overrideActions = z.enum([
    'overrides:list',
    'overrides:get',
    'overrides:create',
    'overrides:delete',
    'overrides:*',
]);

export const stopwordsActions = z.enum([
    'stopwords:list',
    'stopwords:get',
    'stopwords:create',
    'stopwords:delete',
    'stopwords:*',
]);

export const keysActions = z.enum([
    'keys:list',
    'keys:get',
    'keys:create',
    'keys:delete',
    'keys:*',
]);

export const analyticsActions = z.enum([
    'analytics:list',
    'analytics:get',
    'analytics:create',
    'analytics:delete',
    'analytics:*',
]);

export const analyticsRulesActions = z.enum([
    'analytics/rules:list',
    'analytics/rules:get',
    'analytics/rules:create',
    'analytics/rules:delete',
    'analytics/rules:*',
]);

export const analyticsEventsActions = z.enum(['analytics/events:create']);

export const miscActions = z.enum([
    'metrics.json:list',
    'stats.json:list',
    'debug:list',
    '*',
]);

export const presetActions = z.enum([
    'presets:get',
    'presets:list',
    'presets:upsert',
    'presets:delete',
]);

export const streamingDictActions = z.enum([
    'stemming/dictionaries:get',
    'stemming/dictionaries:list',
    'stemming/dictionaries:create',
    'stemming/dictionaries:delete',
]);

export const operationsActions = z.enum([
    'operations/snapshot:create',
    'operations/vote:create',
    'operations/cache/clear:create',
    'operations/db/compact:create',
    'operations/reset_peers:create',
    'operations/schema_changes:get',
]);

export const convoModelOpsActions = z.enum([
    'conversations/models:create',
    'conversations/models:get',
    'conversations/models:list',
    'conversations/models:upsert',
    'conversations/models:delete',
]);

export const naturalLangSearchActions = z.enum([
    'nl_search_models:create',
    'nl_search_models:get',
    'nl_search_models:list',
    'nl_search_models:upsert',
    'nl_search_models:delete',
]);

export const configOpsActions = z.enum(['config:create']);

export const typesenseActions = z.enum([
    ...collectionActions.options,
    ...documentActions.options,
    ...aliasActions.options,
    ...synonymActions.options,
    ...overrideActions.options,
    ...stopwordsActions.options,
    ...keysActions.options,
    ...analyticsActions.options,
    ...analyticsRulesActions.options,
    ...analyticsEventsActions.options,
    ...miscActions.options,
    ...presetActions.options,
    ...streamingDictActions.options,
    ...operationsActions.options,
    ...convoModelOpsActions.options,
    ...naturalLangSearchActions.options,
    ...configOpsActions.options,
]);
