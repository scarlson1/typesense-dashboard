import { createCollectionSchemaForm, type VectorConfigState } from '@/types';
import { formOptions } from '@tanstack/react-form';

export interface NewCollectionFieldDraft {
  name: string;
  type: string;
  facet: boolean;
  optional: boolean;
  index: boolean;
  store: boolean;
  sort: boolean;
  infix: boolean;
  range_index: boolean;
  stem: boolean;
  /** 'OtherCollection.field_name' — empty string means no reference (JOIN). */
  reference: string;
  async_reference: boolean;
  /** Draft vector/embed config; only meaningful for float[] fields. */
  vectorConfig?: VectorConfigState;
}

export const NEW_EMPTY_FIELD: NewCollectionFieldDraft = {
  name: '',
  type: '',
  facet: false,
  optional: false,
  index: true,
  store: true,
  sort: false, // default true for number input (need to subscribe to changes ??)
  infix: false,
  // locale: '',
  range_index: false,
  stem: false,
  reference: '',
  async_reference: false,
};

export const collectionFormOpts = formOptions({
  defaultValues: {
    name: '',
    fields: [NEW_EMPTY_FIELD],
    default_sorting_field: '',
    enable_nested_fields: false,
    // tokenSeparators: [],
    // symbolsToIndex: [],
  },
  validators: {
    onChange: createCollectionSchemaForm,
  },
});
