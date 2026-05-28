import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/synonyms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/synonyms"!</div>
}
