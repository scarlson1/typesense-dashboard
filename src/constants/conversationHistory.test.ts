import { describe, expect, it } from 'vitest';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import {
  buildHistoryCollectionSchema,
  isConversationHistoryCollection,
} from './conversationHistory';

const validFields = [
  { name: 'conversation_id', type: 'string' },
  { name: 'model_id', type: 'string' },
  { name: 'timestamp', type: 'int32' },
  { name: 'role', type: 'string', index: false },
  { name: 'message', type: 'string', index: false },
];

const asSchema = (fields: unknown[]) =>
  ({ name: 'c', fields } as unknown as CollectionSchema);

describe('buildHistoryCollectionSchema', () => {
  it('produces the fixed schema for the given name', () => {
    const schema = buildHistoryCollectionSchema('conversation_store');
    expect(schema.name).toBe('conversation_store');
    expect(schema.fields?.map((f) => f.name)).toEqual([
      'conversation_id',
      'model_id',
      'timestamp',
      'role',
      'message',
    ]);
    // the result it produces must itself pass the validator
    expect(isConversationHistoryCollection(asSchema(schema.fields ?? []))).toBe(
      true,
    );
  });
});

describe('isConversationHistoryCollection', () => {
  it('accepts a collection with all required fields/types (extra fields ok)', () => {
    expect(
      isConversationHistoryCollection(
        asSchema([...validFields, { name: 'extra', type: 'string' }]),
      ),
    ).toBe(true);
  });

  it('rejects when a required field is missing', () => {
    expect(
      isConversationHistoryCollection(
        asSchema(validFields.filter((f) => f.name !== 'timestamp')),
      ),
    ).toBe(false);
  });

  it('rejects when a required field has the wrong type', () => {
    expect(
      isConversationHistoryCollection(
        asSchema(
          validFields.map((f) =>
            f.name === 'timestamp' ? { ...f, type: 'int64' } : f,
          ),
        ),
      ),
    ).toBe(false);
  });

  it('rejects empty / nullish schemas', () => {
    expect(isConversationHistoryCollection(undefined)).toBe(false);
    expect(isConversationHistoryCollection(asSchema([]))).toBe(false);
  });
});
