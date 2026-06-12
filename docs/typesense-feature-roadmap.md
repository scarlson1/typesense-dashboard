# Typesense Feature Roadmap — Missing Feature Implementation Plan

Gap analysis date: 2026-06-11. Typesense JS client: `typesense@3.0.6`.

## How to use this doc

Each phase below is a self-contained brief that can be handed to a subagent.
Phases are ordered by value/effort but are independent unless noted. Every
phase brief includes: context, scope, files, client APIs, and acceptance
criteria. Subagents should read the "Codebase conventions" section first.

## Codebase conventions (read before any phase)

- **Routing**: TanStack Router file routes in `src/routes/`. Dashboard pages
  live under `src/routes/_dashboard/`. Routes declare
  `staticData: { crumb: '...' }` for breadcrumbs. Hash history is used.
- **Data fetching**: TanStack Query. Query keys are prefixed with the cluster
  id: `[clusterId, ...]` — see `src/constants/queryKeys.ts`. Get the client
  via `const [client, clusterId] = useTypesenseClient()`
  (`src/hooks/useTypesenseClient.ts`).
- **Forms**: TanStack Form + zod v4. Shared field components in
  `src/components/forms/` (`form.AppField` pattern — see
  `src/components/StopwordsForm.tsx` for a small example).
- **UI**: MUI v9 + local "redesign" primitives in `src/components/redesign/`
  (`PageHeader`, `SectionCard`, `StatCard`, `Badge`, `smallButtonSx`).
  Design tokens in `src/theme/themePrimitives.ts` (`designTokens`).
- **Version gating**: `useTypesenseVersion()` / `VersionProvider`
  (`src/components/VersionProvider.tsx`). v30+ features must degrade
  gracefully — follow the existing pattern of paired components
  (`SynonymsForm` vs `SynonymsFormV30`, `CurationList` vs `CurationListV30`,
  `AnalyticsRuleForm` vs `AnalyticsRuleFormV30`).
- **Feedback**: toasts via `react-hot-toast` with `useAsyncToast` /
  `useMutationToast`. Destructive actions confirm via `useConfirmDelete`.
- **JSON editing**: Monaco via `src/components/JsonEditor.tsx`
  (`useInitMonaco`).
- **Tests**: vitest + Testing Library + msw (`src/test/server.ts`). E2E:
  Playwright against `e2e/compose.e2e.yml` docker Typesense.
- **Raw API calls**: for endpoints the JS client doesn't wrap, use
  `client.apiCall.get/post/delete(...)` — precedent:
  `src/components/serverStatus/ServerOps.tsx` (`/operations/db/compact`,
  `/operations/schema_changes`).
- **TypeScript style**: prefer interfaces over types, prefer arrow functions.

## Current coverage (do NOT reimplement)

Collections CRUD + schema alter; documents (single create/edit/delete, bulk
import, keyword/semantic/hybrid/NL search modes, geo map search,
conversational chat search); curation (legacy overrides + v30 curation sets);
synonyms (legacy + v30 synonym sets); analytics rules (V1 + v30); API keys
CRUD; aliases; presets; stopwords; stemming dictionaries; conversation
models; NL search models; server status (health, metrics, stats, debug
version) and cluster ops (clear cache, compact DB, snapshot, vote,
slow-request-log toggle, schema_changes view); multi-cluster connection
switching (`ClusterSelect`).

---

## Phase 1 — Document lifecycle completion ✅ DONE (2026-06-11)

Implemented: hooks `useExportDocuments` / `useDeleteByQuery` /
`useUpdateByQuery` / `useTruncateCollection`; export route rewritten with a
working JSONL download + filtered cURL side card; `BulkDocumentOpsCard` on
the collection config page (preview count → confirm → run); truncate button
in the Danger zone (type-name confirm — `useConfirmDelete` now honors custom
`title`/`description`); `batch_size` added to the import footer. Covered by
msw unit tests per hook and `e2e/document-lifecycle.spec.ts` (passing against
real v29 + v30 clusters).

Correction to the original brief: 1d was already mostly implemented —
`action`, `dirty_values`, `return_id`, and the per-line results panel existed
in the import UI; only `batch_size` was missing.

Note for future e2e work: tests run fully parallel, so any new spec must use
the `seededCollection` fixture (per-test unique collection) instead of the
shared `E2E_COLLECTION` name; sharing caused 409 races and was fixed during
this phase.

**Why first**: highest user value; the export page is currently a stub and
bulk operations are table stakes for an admin dashboard.

### 1a. Real document export

`src/routes/_dashboard/collections/$collectionId/documents/export.tsx` is a
placeholder that links to the docs. Replace it with a working export UI.

- Client API: `client.collections(name).documents().export(options)` —
  `DocumentsExportParameters` supports `filter_by`, `include_fields`,
  `exclude_fields`.
- UI: form with optional `filter_by`, include/exclude field pickers (use the
  collection schema from `useCollectionSchema` to offer field names), then
  download the JSONL result as a `Blob` (`<collection>-<date>.jsonl`).
- Large collections: export returns a single string from the JS client in the
  browser; show a warning above ~100MB-scale collections (use
  `num_documents` from the schema) and a progress/loading state.

### 1b. Delete by query + truncate

- Client API: `client.collections(name).documents().delete({ filter_by,
  batch_size?, ignore_not_found? })` and `delete({ truncate: true })`
  (`DeleteQuery` in `typesense/lib/Typesense/Documents.d.ts`).
- UI: add a "Bulk actions" section to the collection config page
  (`src/routes/_dashboard/collections/$collectionId/config.tsx`):
  - "Delete by filter" — filter_by input with a **preview count** first
    (run a search with `q: '*', filter_by, per_page: 0` and show
    `found`), then `useConfirmDelete`-gated deletion showing `num_deleted`.
  - "Truncate collection" — type-the-collection-name confirm, keeps schema.
- Invalidate document/search/collection query keys on success.

### 1c. Update by query

- Client API: `documents().update(partialDoc, { filter_by })`
  (`UpdateByFilterParameters` → `UpdateByFilterResponse.num_updated`).
- UI: same Bulk actions section; Monaco JSON editor for the partial document
  + filter_by input + preview count, confirm, report `num_updated`.

### 1d. Import options

`src/hooks/useImportDocuments.ts` currently passes no options.

- Expose `action` (`create | upsert | update | emplace`), `dirty_values`
  (`coerce_or_reject | coerce_or_drop | drop | reject`), `batch_size`, and
  `return_id` in the import UI (documents/new route), defaulting to current
  behavior.
- Surface per-line import failures (`ImportResponseFail`) in a results panel
  instead of a generic toast.

**Acceptance criteria**: export downloads a JSONL file honoring filters;
delete-by-query shows preview count and deletes; truncate empties but keeps
the collection; update-by-query patches matching docs; import UI offers
action/dirty_values and reports per-line errors. Unit tests with msw for
each hook; e2e happy path for export + truncate.

---

## Phase 2 — Scoped search key generator

**Independent; small.** The keys page (`src/routes/_dashboard/keys.tsx`)
badges "scoped access tokens" and links to docs, but there is no generator.

- Scoped keys are generated **client-side** (HMAC-SHA256 of the embedded
  params with a parent search key, base64) — no server call. Implement with
  Web Crypto (`crypto.subtle`), not a Node lib: the JS client's
  `generateScopedSearchKey` uses Node `crypto` and won't work in the
  renderer; write `src/utils/scopedSearchKey.ts` instead.
- UI on the keys page: pick/paste a parent search-only key, JSON editor for
  embedded params (`filter_by`, `expires_at`, `limit_multi_searches`, etc.
  with an `expires_at` date picker — `@mui/x-date-pickers` is installed),
  generate + copy. Warn when the parent key has admin actions (scoped keys
  must derive from search-only keys).
- Unit-test the HMAC output against a known vector from the Typesense docs
  (`RN23GFr1s6jQ9kgSNg2O7fYcAUXU7127` example).

**Acceptance criteria**: generated key matches the documented test vector;
expires_at and filter_by embed correctly; copy-to-clipboard works
(`useCopyToClipboard`).

---

## Phase 3 — Schema power features: reference (JOIN) fields + auto-embedding ✅ DONE (2026-06-12)

Implemented: reference (JOIN) picker per field card in the new-collection
form (collection + field selects; `id` offered explicitly since it's
implicit in schemas; `async_reference` checkbox); auto-embed/vector panel in
the new-collection form via the shared `VectorFieldConfig` component
(extracted from `SchemaFieldEditDialog`, which now reuses it); flat
vector-state helpers in `utils/vectorFieldConfig.ts`; one payload builder
(`utils/buildCollectionFields.ts`) feeding BOTH the live schema preview and
submit; `async_reference` added to zod (and therefore the Monaco
JSON-editor schema, which derives from it); reference carried through
field edits in the dialog (drop+re-add no longer strips it) and shown
read-only there (Typesense can't add references via alter); schema
table/card views render reference links + embed summaries. Unit tests for
the payload builder; e2e creates a referenced collection through the form
on v29 + v30.

Correction to the original brief: the field-edit dialog ALREADY had full
auto-embedding support (providers, GCP auth, validation via `embedForm`) —
the gap was only in the new-collection form path, plus reference UI
everywhere.

The zod schema (`src/types/typesenseCollection.ts:281`) already allows
`reference`, but the field editor UI never exposes it, and there is no UI
for `embed` (auto-embedding) field config.

- **Reference fields**: in `src/components/forms/CollectionFieldsForm.tsx`
  and `src/components/SchemaFieldEditDialog.tsx`, add a "Reference" option:
  a collection picker (existing collections query) + field picker, producing
  `reference: 'Collection.field'`. Render reference fields distinctly in
  `SchemaTableView` / `SchemaCardView` (link to the referenced collection).
  Also support `async_reference`.
- **Auto-embedding fields**: add an "Embedding" field configuration:
  `embed: { from: [fields], model_config: { model_name, api_key?, url?, ... } }`.
  Reuse provider/model knowledge from `src/constants/llmProviders.ts` and
  `LlmModelFields.tsx` where sensible (ts/all-MiniLM, openai/*, etc.).
  `num_dim` auto-derives server-side; keep it read-only.
- Validate in the JSON editor path too (`NewCollectionEditor`).

**Acceptance criteria**: can create a collection with a reference field and
an auto-embedding field from both the form and the JSON editor; schema views
render both; semantic/hybrid search modes detect the new embedding field
(`SearchModes.tsx` already gates on embedding-field presence).

---

## Phase 4 — JOIN search UX + multi-search playground

Depends loosely on Phase 3 (reference fields exist), but works against any
cluster that already has references.

- **JOIN search**: when the active collection's schema contains reference
  fields, surface join controls in the search Configure panel
  (`src/components/search/ConfigurePanel.tsx` / `SearchParamsForm`):
  `include_fields=$Ref(*)`, `filter_by:=$Ref(...)` helper snippets, and
  render nested joined docs in `Hit.tsx`.
- **Multi-search playground**: new route `src/routes/_dashboard/multi-search.tsx`
  (+ SideMenu entry in `MenuContent.tsx`). Monaco JSON editor seeded with a
  `searches: [...]` template, optional `union: true` (v30), run via
  `client.multiSearch.perform()`, render per-search results/errors in
  tabs. This doubles as a raw query console — valuable for debugging.

**Acceptance criteria**: joined hits render nested data; multi-search
playground executes ≥2 heterogeneous searches and renders both result sets
and per-search error states; union mode gated to v30+.

---

## Phase 5 — Analytics events ✅ DONE (2026-06-12)

Implemented: `useCreateAnalyticsEvent` + `useRecentAnalyticsEvents` hooks
(`src/hooks/useAnalyticsEvents.ts`) and an `AnalyticsEventsPanel` on the
analytics page with a "Send a test event" card (event-name autocomplete
derived from rules, type select, user_id/doc_id/q) and a "Recent events"
viewer (user_id + name + n). msw unit tests + e2e on both versions (the e2e
compose now starts Typesense with analytics enabled).

Facts verified against live v29/v30 servers (probed directly):
- POST /analytics/events accepts `{ type, name, data }` on BOTH versions —
  no version branching needed; always use `client.analytics.events()`.
- v29 counter rules receive events under the rule's NAMED event
  (`params.source.events[].name`), not the rule name; v30 uses the rule name.
- GET /analytics/events exists on v29 too but returns `{"events":[]}` —
  the viewer works everywhere and shows a v30 hint when empty; no hard gate.
- v30 returns sent events from GET immediately (no flush-interval wait).

Analytics **rules** are covered; **events** are not (only a key-action enum
exists in `src/types/typesenseApiKeyActions.ts`).

- Client API: `client.analytics.events().create({ name, type, data })` and
  `client.analytics.events().retrieve({ user_id, name, n })`
  (`typesense/lib/Typesense/AnalyticsEvents.d.ts`).
- UI on the analytics page (`src/routes/_dashboard/analytics.tsx`):
  - "Send test event" dialog per rule — prefill `name` from the rule, JSON
    editor for `data` (doc_id, user_id, query), POST and toast the result.
    This is the missing piece for users validating counter/log rules.
  - "Recent events" viewer — inputs for `user_id` + rule name + `n`,
    rendered as a table (timestamp, type, collection, doc_id(s), query).
- Version note: events API shape changed in v30 (the client tracks the new
  shape); gate with `useTypesenseVersion` like `AnalyticsRulesList` does.

**Acceptance criteria**: a click event sent from the UI increments a counter
rule's target field (e2e against docker Typesense); events viewer lists the
sent event; clean error surface when analytics is disabled on the server
(`--enable-search-analytics=false`).

---

## Phase 6 — Multi-node cluster visibility

`src/components/serverStatus/TypesenseMetricsAndNodes.tsx` exists but is
commented out in `server.tsx` (lines 124–138), and the connection store
(`src/utils/typesenseStore.ts`) keeps only one node per cluster entry.

- Extend the connection model to optionally hold multiple nodes (host,
  port, protocol per node) — update `AuthForm` to accept additional nodes,
  keep single-node as the default path. Migrate persisted store shape
  (zustand persist migration; the store version lives in
  `typesenseStore.ts`).
- Server page: per-node health/stats/metrics cards — query each node
  individually (build one lightweight client per node with
  `nearestNode`/single-node config), show leader/follower state from
  `/debug` (`state: 1` = leader, `4` = follower), and surface the existing
  `vote` op next to it. Finish/replace `TypesenseMetricsAndNodes`.
- Show raft/queue stats already returned by `client.metrics.retrieve()` if
  present.

**Acceptance criteria**: a 3-node docker compose (add to `e2e/`) renders 3
node cards with health + version + leader badge; single-node setups look
unchanged; persisted single-node configs migrate without logout.

---

## Phase 7 — Personalization models (v30, raw API)

The JS client has no personalization module — use `client.apiCall`
(precedent in `ServerOps.tsx`). Strictly version-gated to v30+.

- Endpoints: `GET/POST /personalization/models`,
  `GET/PUT/DELETE /personalization/models/:id`. Model schema: `{ id, name
  (ts/tyrec-1), type (recommendation|ranking), collection }`.
- New route `src/routes/_dashboard/personalization.tsx` modeled on
  `nl-models.tsx` (list + create/edit form + delete). Note: model creation
  uploads are heavyweight; v1 of this page can target listing/deleting and
  metadata display, with create gated behind an "advanced" JSON editor.
- Search side (stretch): `personalization_user_id` +
  `personalization_model_id` params in the search Configure panel when a
  model exists.

**Acceptance criteria**: page hidden below v30; lists/deletes models against
a v30 server; create path documented or implemented via JSON editor; search
params appear only when ≥1 model exists.

---

## Phase 8 (stretch) — Voice query & misc

Lowest priority; pick up only after 1–7.

- **Voice query models**: collection `voice_query_model` config +
  recording a query in the search bar (`MediaRecorder` → base64 →
  `voice_query` search param). Needs a server built with the whisper model;
  feature-detect and hide otherwise.
- **Image search**: `image` search param for collections with a CLIP
  embedding field; file-picker in search UI, base64 the image.
- **Conversation history management**: bulk delete/TTL info for the
  conversation history collection (drawer exists; management UI does not).

---

## Suggested subagent handoff template

For each phase, hand the subagent: this doc's conventions section, the phase
brief, plus this checklist:

1. Read the named existing files before writing code; mirror their patterns.
2. Version-gate anything not supported by the oldest supported server (v29).
3. Add msw-backed vitest coverage for new hooks; e2e only where the brief
   says so.
4. Run `pnpm lint`, `pnpm test`, `pnpm test:typecheck`, and `pnpm build`
   before reporting done.
5. Do not refactor unrelated code; flag follow-ups instead.
