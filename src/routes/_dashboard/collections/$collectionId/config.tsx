import { Box, Button, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { JsonEditor } from '../../../../components';
import {
  COLLECTION_SCHEMA,
  DEFAULT_MONACO_OPTIONS,
} from '../../../../constants';
import { useSchema } from '../../../../hooks';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/config'
)({
  component: CollectionSettings,
  staticData: {
    crumb: 'Config',
  },
});

function CollectionSettings() {
  const { collectionId } = Route.useParams();
  const { data } = useSchema(collectionId);

  return (
    <>
      <Typography variant='h3'>{collectionId}</Typography>
      <Stack
        direction='row'
        spacing={{ xs: 1, sm: 2 }}
        sx={{ my: { xs: 1, sm: 2 } }}
      >
        <Button
          variant='contained'
          onClick={() => alert('TODO: update schema')}
        >
          Update Schema
        </Button>
        <Button
          variant='contained'
          onClick={() => alert('TODO: delete schema')}
        >
          Delete Collection
        </Button>
      </Stack>
      <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <JsonEditor
          height='70vh'
          schema={COLLECTION_SCHEMA}
          // options={{ ...DEFAULT_MONACO_OPTIONS, readOnly: true }}
          options={DEFAULT_MONACO_OPTIONS}
          value={JSON.stringify(data)}
        />
      </Box>
    </>
  );
}
