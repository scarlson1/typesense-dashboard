import { useState } from 'react'

type Filter = 'all' | 'dark' | 'light' | 'mobile'

interface Shot {
  size: 'wide' | 'tall' | 'half'
  cat: Exclude<Filter, 'all'>
  title: string
  tag: string
  src: string
  delay?: string
}

const shots: Shot[] = [
  { size: 'wide', cat: 'dark', title: 'Cluster overview', tag: 'Dark', src: '/assets/shots/cluster-dark.png' },
  { size: 'tall', cat: 'mobile', title: 'Geosearch', tag: 'Mobile', src: '/assets/shots/map-mobile-dark.png', delay: 'd1' },
  { size: 'half', cat: 'dark', title: 'Schema editor', tag: 'Dark', src: '/assets/shots/schema-dark.png', delay: 'd1' },
  { size: 'half', cat: 'light', title: 'API keys', tag: 'Light', src: '/assets/shots/keys-light.png' },
  { size: 'half', cat: 'light', title: 'Add documents', tag: 'Light', src: '/assets/shots/add-docs-light.png', delay: 'd1' },
  { size: 'wide', cat: 'light', title: 'Search & facets', tag: 'Light', src: '/assets/shots/search-light.png' },
  { size: 'tall', cat: 'mobile', title: 'Schema', tag: 'Mobile', src: '/assets/shots/schema-mobile-light.png', delay: 'd1' },
  { size: 'half', cat: 'dark', title: 'API keys', tag: 'Dark', src: '/assets/shots/keys-dark.png' },
]

const tabs: Filter[] = ['all', 'dark', 'light', 'mobile']
const tabLabel: Record<Filter, string> = {
  all: 'All',
  dark: 'Dark',
  light: 'Light',
  mobile: 'Mobile',
}

export const Gallery = () => {
  const [filter, setFilter] = useState<Filter>('all')

  return (
    <section className="section-pad" id="gallery" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">A proper look</span>
          <h2>Designed for both light and dark</h2>
          <p className="lead">
            Every screen, both themes. Here's the real dashboard, not a mock.
          </p>
        </div>
        <div className="gallery-tabs reveal">
          {tabs.map((t) => (
            <button
              key={t}
              className={`gtab${filter === t ? ' on' : ''}`}
              onClick={() => setFilter(t)}
            >
              {tabLabel[t]}
            </button>
          ))}
        </div>
        <div className="gallery">
          {shots.map((s, i) => {
            const hidden = filter !== 'all' && s.cat !== filter
            return (
              <div
                className={`gcard ${s.size} reveal${s.delay ? ` ${s.delay}` : ''}${hidden ? ' hidden' : ''}`}
                data-cat={s.cat}
                key={`${s.title}-${i}`}
              >
                <div className="gcap">
                  <span className="ttl">{s.title}</span>
                  <span className="tag">{s.tag}</span>
                </div>
                <img src={s.src} alt={`${s.title}, ${s.tag.toLowerCase()} theme`} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
