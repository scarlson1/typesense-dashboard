import { Box } from '@mui/material';
import { Suspense } from 'react';
import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { collectionFormOpts } from '../constants';
import { useAppForm, useNewCollection } from '../hooks';
import { CollectionForm } from './CollectionForm';
import { LoadingSpinner } from './LoadingSpinner';

export const NewCollectionForm = () => {
  const mutation = useNewCollection();

  const form = useAppForm({
    ...collectionFormOpts,
    onSubmit: async ({ value }) => {
      // TODO: fix zod type (FieldType)
      const { fields, ...rest } = value;
      let collection: CollectionCreateSchema = {
        ...rest,
        fields: fields as CollectionFieldSchema[],
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
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 2,
        }}
      >
        <CollectionForm form={form} />
      </Box>
    </Suspense>
  );
};
