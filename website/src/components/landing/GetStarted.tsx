import { useState } from 'react'

import { DEMO_URL, REPO_URL } from '#/components/landing/links'

type Term = 'docker' | 'static' | 'desktop'

const tabs: { key: Term; label: string }[] = [
  { key: 'docker', label: 'Docker' },
  { key: 'static', label: 'Static build' },
  { key: 'desktop', label: 'Desktop' },
]

export const GetStarted = () => {
  const [term, setTerm] = useState<Term>('docker')

  return (
    <section className="section-pad" id="start" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="start-card reveal">
          <div className="start-copy">
            <span className="eyebrow">Get started</span>
            <h2>Connect a cluster in under a minute</h2>
            <p className="lead">
              Use the hosted build, run it in Docker, or grab the desktop app.
              Point it at your node, paste an admin key, and you're in.
              Credentials live in session storage and vanish when you close the
              tab.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href={DEMO_URL} target="_blank" rel="noopener">
                Launch the demo
              </a>
              <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noopener">
                Read the docs
              </a>
            </div>
          </div>
          <div className="term">
            <div className="term-bar">
              <i />
              <i />
              <i />
            </div>
            <div className="term-tabs">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  className={`term-tab${term === t.key ? ' on' : ''}`}
                  onClick={() => setTerm(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="term-body" hidden={term !== 'docker'}>
              <div className="cmt"># Pull and run the prebuilt image</div>
              <div>
                <span className="pmt">$</span> docker pull
                spencercarlson/typesense-dashboard
              </div>
              <div>
                <span className="pmt">$</span> docker run{' '}
                <span className="flag">-d</span> <span className="flag">-p</span>{' '}
                8108:8108 \
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;spencercarlson/typesense-dashboard</div>
              <div className="cmt"># → open http://localhost:8108</div>
            </div>
            <div className="term-body" hidden={term !== 'static'}>
              <div className="cmt"># Hash-routed SPA — no redirect rules needed</div>
              <div>
                <span className="pmt">$</span> git clone{' '}
                <span className="str">github.com/scarlson1/typesense-dashboard</span>
              </div>
              <div>
                <span className="pmt">$</span> pnpm install
              </div>
              <div>
                <span className="pmt">$</span> pnpm build{' '}
                <span className="cmt"># publish ./dist anywhere</span>
              </div>
              <div className="cmt"># Deploy to Vercel · Netlify · Cloudflare Pages</div>
            </div>
            <div className="term-body" hidden={term !== 'desktop'}>
              <div className="cmt"># Native app talks to HTTP nodes directly —</div>
              <div className="cmt"># no TLS, no --enable-cors, no ngrok.</div>
              <div>
                <span className="pmt">$</span> pnpm electron:pack:mac{' '}
                <span className="cmt"># or :win / :linux</span>
              </div>
              <div className="cmt"># → installer lands in ./release</div>
              <div className="cmt"># .dmg · .exe · .AppImage on the releases page</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
