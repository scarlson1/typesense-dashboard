import type {
  CollectionFieldSchema,
  FieldType,
} from 'typesense/lib/Typesense/Collection';
import {
  applyVectorConfig,
  VECTOR_TYPE,
  type VectorConfigState,
} from './vectorFieldConfig';

/**
 * Shape of one field row in the new-collection form. Extends the plain flag
 * booleans with the reference (JOIN) inputs and the vector/embed draft state
 * that only applies to `float[]` fields.
 */
export interface CollectionFieldDraft {
  name: string;
  type: string;
  facet?: boolean;
  optional?: boolean;
  index?: boolean;
  store?: boolean;
  sort?: boolean;
  infix?: boolean;
  range_index?: boolean;
  stem?: boolean;
  /** 'OtherCollection.field_name' — empty string means no reference. */
  reference?: string;
  async_reference?: boolean;
  vectorConfig?: VectorConfigState;
}

export interface BuildCollectionFieldsResult {
  fields: CollectionFieldSchema[];
  /** Per-field problems that should block submission. */
  errors: string[];
}

/**
 * Build the Typesense field payloads from new-collection form drafts — only
 * non-default flags are emitted. Used by both the live schema preview and the
 * submit handler so what you see is exactly what is sent.
 */
export const buildCollectionFields = (
  drafts: CollectionFieldDraft[],
): BuildCollectionFieldsResult => {
  const fields: CollectionFieldSchema[] = [];
  const errors: string[] = [];

  for (const draft of drafts) {
    const out: CollectionFieldSchema = {
      name: draft.name || '',
      type: (draft.type || '') as FieldType,
    };
    if (draft.facet) out.facet = true;
    if (draft.sort) out.sort = true;
    if (draft.optional) out.optional = true;
    if (draft.infix) out.infix = true;
    if (draft.range_index) out.range_index = true;
    if (draft.stem) out.stem = true;
    if (draft.index === false) out.index = false;
    if (draft.store === false) out.store = false;

    const reference = (draft.reference ?? '').trim();
    if (reference) {
      if (!/^[^.\s]+\.[^\s]+$/.test(reference)) {
        errors.push(
          `${out.name || 'field'}: reference must look like "collection.field"`,
        );
      } else {
        out.reference = reference;
        if (draft.async_reference) out.async_reference = true;
      }
    }

    // Vector config only applies to float[] fields, and only when the user
    // actually configured something — a plain float[] array stays untouched.
    if (draft.type === VECTOR_TYPE && draft.vectorConfig) {
      const vc = draft.vectorConfig;
      if (vc.autoEmbed || vc.numDim.trim()) {
        if (!applyVectorConfig(out, vc)) {
          errors.push(
            `${out.name || 'field'}: incomplete vector / embedding configuration`,
          );
        }
      }
    }

    fields.push(out);
  }

  return { fields, errors };
};
