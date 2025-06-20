import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/analytics')({
  component: RouteComponent,
  staticData: {
    crumb: 'Analytics',
  },
});

function RouteComponent() {
  return <div>Hello "/_dashboard/analytics"!</div>;
}
