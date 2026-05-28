import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/curation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/curation"!</div>
}
