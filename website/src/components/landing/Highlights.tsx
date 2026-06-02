import { CheckIcon } from '#/components/icons'

export const SearchHighlight = () => (
  <section className="section-pad" id="search" style={{ paddingTop: 0 }}>
    <div className="wrap">
      <div className="split">
        <div className="split-copy reveal">
          <span className="eyebrow">Search &amp; explore</span>
          <h2>Tune relevance like you're building it live</h2>
          <p className="lead">
            A side-by-side Refine, Params and Display panel turns Typesense's
            full query API into clicks. See exactly how each knob changes
            ranking — then save it as a preset.
          </p>
          <ul className="split-list">
            <li>
              <CheckIcon />
              <span>
                <b>Query-by, sort-by, facet &amp; filter</b> chips you can add
                and remove inline.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                <b>Result count &amp; latency</b> shown on every keystroke —
                typo-tolerance built in.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                <b>Grid or map</b> view, edit a document inline, or open it as
                raw JSON.
              </span>
            </li>
          </ul>
        </div>
        <div className="split-media reveal d1">
          <div className="media-cap">
            <i /> Dashboard › Search · airbnb_listings
          </div>
          <img
            src="/assets/shots/search-light.png"
            alt="Typesense Dashboard search interface with faceted results and query parameters"
          />
        </div>
      </div>
    </div>
  </section>
)

export const GeoHighlight = () => (
  <section className="section-pad" style={{ paddingTop: 0 }}>
    <div className="wrap">
      <div className="split flip">
        <div className="split-copy reveal">
          <span className="eyebrow">Geosearch</span>
          <h2>See your data where it actually lives</h2>
          <p className="lead">
            Any collection with a geopoint field becomes a map. Pan, zoom and
            scan results spatially, with full documents one click away — powered
            by your own Mapbox token, stored locally.
          </p>
          <ul className="split-list">
            <li>
              <CheckIcon />
              <span>
                <b>Live result pins</b> that update as you refine the query.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                <b>Bring your own token</b> — kept in your browser, never sent
                anywhere else.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                <b>Works on mobile</b> — the whole dashboard is responsive down
                to your phone.
              </span>
            </li>
          </ul>
        </div>
        <div className="split-media reveal d1">
          <div className="media-cap">
            <i /> Dashboard › Search › Map
          </div>
          <img
            src="/assets/shots/map-light.png"
            alt="Typesense Dashboard geosearch map view with result pins on a Mapbox map"
          />
        </div>
      </div>
    </div>
  </section>
)
