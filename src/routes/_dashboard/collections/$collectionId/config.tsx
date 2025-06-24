import { Box, Button, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { JsonEditor } from '../../../../components';
import {
  COLLECTION_SCHEMA,
  collectionQueryKeys,
  DEFAULT_MONACO_OPTIONS,
} from '../../../../constants';
import { useTypesenseClient } from '../../../../hooks';

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
  const [client, clusterId] = useTypesenseClient();

  const { data } = useSuspenseQuery({
    queryKey: collectionQueryKeys.schema(clusterId, collectionId),
    queryFn: () => client.collections(collectionId).retrieve(),
  });

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
          height='60vh'
          schema={COLLECTION_SCHEMA}
          options={DEFAULT_MONACO_OPTIONS}
          value={JSON.stringify(data)}
        />
      </Box>
    </>
  );
}
