import { Alert } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/$documentId',
)({
  component: RouteComponent,
  // staticData: {
  //   crumb: `${docId}`,
  // },
});

function RouteComponent() {
  return (
    <>
      <div>
        Hello "/_dashboard/collections/$collectionId/documents/$documentId"!
      </div>
      <Alert severity='warning'>TODO: view not set up yet</Alert>
    </>
  );
}
