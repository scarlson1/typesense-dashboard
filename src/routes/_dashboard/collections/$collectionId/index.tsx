import { createFileRoute } from '@tanstack/react-router';

// TODO: create _collectionId layout component to wrap /$collectionId in <CollectionContext>

export const Route = createFileRoute('/_dashboard/collections/$collectionId/')({
  component: RouteComponent,
  // staticData: {
  //   crumb: 'Collection ID',
  // },
});

function RouteComponent() {
  return <div>Hello "/_dashboard/collections/$collectionId/"!</div>;
}
