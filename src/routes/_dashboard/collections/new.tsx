import { Box, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { CollectionForm, LoadingSpinner } from '../../../components';
import { collectionFormOpts, collectionQueryKeys } from '../../../constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '../../../hooks';
import { queryClient } from '../../../utils';

export const Route = createFileRoute('/_dashboard/collections/new')({
  component: NewCollection,
});

function NewCollection() {
  const navigate = Route.useNavigate();
  const client = useTypesenseClient();
  const toast = useAsyncToast();

  const mutation = useMutation({
    mutationFn: (values: CollectionCreateSchema) =>
      client.collections().create(values),
    onSuccess: () => {
      toast.success('collection created', { id: 'new-collection' });
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.list({}) });

      navigate({ to: '..' });
    },
    onError: (e) => {
      let msg = e.message || 'an error occurred';
      toast.error(msg, { id: 'new-collection' });
    },
  });

  const form = useAppForm({
    ...collectionFormOpts,
    onSubmit: async ({ value }) => {
      // TODO: fix zod type (FieldType)
      const { fields, default_sorting_field, enable_nested_fields, ...rest } =
        value;
      let collection: CollectionCreateSchema = {
        ...rest,
        fields: fields as CollectionFieldSchema[],
        // @ts-ignore
        sorting_field: default_sorting_field,
        enable_nested_fields: enable_nested_fields,
      };
      mutation.mutate(collection);
    },
  });

  return (
    <Box>
      <Typography variant='h3'>New Collection</Typography>
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
    </Box>
  );
}
