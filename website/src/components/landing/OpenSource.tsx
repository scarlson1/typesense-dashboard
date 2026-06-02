const rows: { label: string; cloud: boolean }[] = [
  { label: 'Works with self-hosted nodes', cloud: false },
  { label: 'Runs fully offline / on your network', cloud: false },
  { label: 'Open source & auditable', cloud: false },
  { label: 'No subscription', cloud: false },
  { label: 'Native desktop app', cloud: false },
];

export const OpenSource = () => {
  return (
    <section className='section-pad' id='open-source' style={{ paddingTop: 0 }}>
      <div className='wrap'>
        <div className='split'>
          <div className='split-copy reveal'>
            <span className='eyebrow'>Free &amp; open source</span>
            <h2>Your search stack, your terms</h2>
            <p className='lead'>
              Typesense Cloud is a great managed option. But if you self-host,
              you shouldn't have to give up a real management UI. This dashboard
              is MIT-licensed, runs entirely client-side, and talks to your node
              directly — nothing in between.
            </p>
            <div className='compare reveal d1'>
              <div className='crow'>
                <span>&nbsp;</span>
                <span className='cell'>Cloud console</span>
                <span className='cell you'>This dashboard</span>
              </div>
              {rows.map((r) => (
                <div className='crow' key={r.label}>
                  <span className='lbl'>{r.label}</span>
                  <span className={`cell ${r.cloud ? 'yes' : 'no'}`}>
                    {r.cloud ? '✓' : '✕'}
                  </span>
                  <span className='cell yes'>✓</span>
                </div>
              ))}
            </div>
          </div>
          <div className='split-media reveal d1'>
            <div className='media-cap'>
              <i /> Dashboard › Config · Schema
            </div>
            <img
              src='/assets/shots/schema-dark.png'
              alt='Schema editor showing field types and indexing flags'
            />
          </div>
        </div>
      </div>
    </section>
  );
};
