import { collectionFormOpts } from '@/constants';
import { useAppForm, useAsyncToast, useNewCollection } from '@/hooks';
import { buildCollectionFields } from '@/utils';
import { Box } from '@mui/material';
import { Suspense } from 'react';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { CollectionForm } from './CollectionForm';
import { LoadingSpinner } from './LoadingSpinner';

export const NewCollectionForm = () => {
  const mutation = useNewCollection();
  const toast = useAsyncToast();

  const form = useAppForm({
    ...collectionFormOpts,
    onSubmit: async ({ value }) => {
      const { fields: fieldDrafts, ...rest } = value;
      // Strips draft-only keys (vectorConfig) and assembles reference/embed
      // payloads; the same builder feeds the live schema preview.
      const { fields, errors } = buildCollectionFields(fieldDrafts);
      if (errors.length) {
        toast.warn(errors[0], { id: 'new-collection-fields' });
        return;
      }
      const collection: CollectionCreateSchema = {
        ...rest,
        fields,
      };
      mutation.mutate(collection);
    },
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Box
        component='form'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
        sx={{ width: '100%' }}
      >
        <CollectionForm form={form} />
      </Box>
    </Suspense>
  );
};
