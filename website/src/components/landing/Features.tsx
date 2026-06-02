import type { ReactNode } from 'react'

interface Feature {
  icon: ReactNode
  title: string
  body: string
  delay?: string
}

const features: Feature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: 'Instant search UI',
    body: 'Type-as-you-go search across any collection with live facets, filters, sort, grouping and per-field query weights — results in milliseconds.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    title: 'Visual schema editor',
    body: "Inspect every field's type, index, facet, sort and optional flags in a table — or drop straight to JSON. Diff-aware saves only submit what changed.",
    delay: 'd1',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Geosearch on a map',
    body: 'Plot geopoint fields on an interactive Mapbox map, browse results spatially and click any pin to inspect the full document.',
    delay: 'd2',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="m10.7 12.3 8.3-8.3M16 5l3 3M13 8l3 3" />
      </svg>
    ),
    title: 'API key management',
    body: "Create scoped keys with action and collection restrictions, set expirations, and audit what's live — without touching curl.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
    title: 'Curation & synonyms',
    body: 'Pin or hide results for any query, manage synonym sets and stopwords, and save reusable search presets your whole team can share.',
    delay: 'd1',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m7 14 3-4 3 3 4-6" />
      </svg>
    ),
    title: 'Cluster health at a glance',
    body: 'Live memory, disk and CPU, document counts, indexing status and a search/write volume view — know your node is healthy before users do.',
    delay: 'd2',
  },
]

export const Features = () => (
  <section className="section-pad" id="features">
    <div className="wrap">
      <div className="sec-head center reveal">
        <span className="eyebrow">Everything in one place</span>
        <h2>Run your search engine without the terminal</h2>
        <p className="lead">
          Every Typesense API surfaced through a clean, fast interface — from
          your first collection to production cluster health.
        </p>
      </div>
      <div className="features">
        {features.map((f) => (
          <div className={`feature reveal${f.delay ? ` ${f.delay}` : ''}`} key={f.title}>
            <div className="ficon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
