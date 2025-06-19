import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/collections/$collectionId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/collections/$collectionId"!</div>
}
