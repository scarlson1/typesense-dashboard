import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

/**
 * Conversation (RAG) models persist turns into a "history collection". Typesense
 * requires this collection to have a fixed, mandatory schema (only the name is
 * flexible) and does NOT auto-create it. Since the schema is fixed we can offer
 * a safe one-click create.
 * Docs: https://typesense.org/docs/latest/api/conversational-search-rag.html
 */
export const DEFAULT_HISTORY_COLLECTION_NAME = 'conversation_store';

export const CONVERSATION_HISTORY_FIELDS: CollectionFieldSchema[] = [
  { name: 'conversation_id', type: 'string' },
  { name: 'model_id', type: 'string' },
  { name: 'timestamp', type: 'int32' },
  { name: 'role', type: 'string', index: false },
  { name: 'message', type: 'string', index: false },
];

export function buildHistoryCollectionSchema(
  name: string,
): CollectionCreateSchema {
  return {
    name,
    fields: CONVERSATION_HISTORY_FIELDS.map((f) => ({ ...f })),
  };
}

/**
 * True if a collection schema satisfies the conversation-history requirements:
 * every required field present with a matching type. Used to filter the
 * history-collection picker to only usable collections.
 */
export function isConversationHistoryCollection(
  schema: { fields?: CollectionFieldSchema[] } | undefined | null,
): boolean {
  const fields = schema?.fields ?? [];
  return CONVERSATION_HISTORY_FIELDS.every((req) =>
    fields.some((f) => f.name === req.name && f.type === req.type),
  );
}
