import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/collections/$collectionId/')({
  component: RouteComponent,
  // staticData: {
  //   crumb: 'Collection ID',
  // },
});

function RouteComponent() {
  return <div>Hello "/_dashboard/collections/$collectionId/"!</div>;
}
