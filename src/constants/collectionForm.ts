import { formOptions } from '@tanstack/react-form';
import { createCollectionSchemaForm } from '../types';

export const NEW_EMPTY_FIELD = {
  name: '',
  type: '',
  facet: false,
  optional: false,
  index: true,
  store: true,
  sort: false, // default true for number input (need to subscribe to changes ??)
  infix: false,
  // locale: '',
  // num_dim: '',
  // vec_dist: '',
  // reference: '',
  range_index: false,
  stem: false,
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
