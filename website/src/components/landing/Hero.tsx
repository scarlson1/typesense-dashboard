import { useEffect, useRef } from 'react';

import {
  CheckIcon,
  ExternalLinkIcon,
  GithubIcon,
  PlayIcon,
  SearchIcon,
} from '#/components/icons';
import { DEMO_URL, REPO_URL } from '#/components/landing/links';
import { Logo } from '#/components/Logo';
import { Box, Stack } from '@mui/material';

// TODO: stack row on large screens
// TODO: scale down second section (currently only looks descent on MD + screens)

/* Animated count-up for every [data-count] inside the hero dashboard,
   triggered when it scrolls into view (ported from app.js). */
const useHeroCountUp = (ref: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const countUp = (el: HTMLElement) => {
      const target = parseFloat(el.getAttribute('data-count') || '0');
      const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const small = el.querySelector('small');
      const smallHTML = small ? small.outerHTML + ' ' : '';
      const dur = 1100;
      let start: number | null = null;
      const fmt = (v: number) => {
        const s = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
        return smallHTML + s + suffix;
      };
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.innerHTML = fmt(target * easeOut(p));
        if (p < 1) requestAnimationFrame(step);
        else el.innerHTML = fmt(target);
      };
      requestAnimationFrame(step);
    };

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      host.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    };

    if (!('IntersectionObserver' in window)) {
      run();
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            run();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    obs.observe(host);
    const failsafe = window.setTimeout(run, 800);
    return () => {
      obs.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [ref]);
};

export const Hero = () => {
  const shotRef = useRef<HTMLDivElement>(null);
  useHeroCountUp(shotRef);

  return (
    //   <Box className='hero' sx={{ position: 'relative' }}>
    <Box className='hero' sx={{ position: 'relative', mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', xl: 'row' }}
        spacing={{ xs: 6, xl: 8 }}
        sx={{
          width: '100%',
          // maxWidth: 'var(--maxw)',
          mx: 'auto',
          px: '28px',
          justifyContent: 'center',
          alignItems: 'center', // { xl: 'center' },
          // The Stack owns the gap between copy + dashboard, so drop the
          // shot-frame's own top margin to avoid doubling it up.
          '& .shot-frame': { mt: 0 },
        }}
      >
        <Box
          // className='wrap hero-inner'
          sx={{
            textAlign: { xs: 'center', xl: 'left' },
            // maxWidth: { xs: 820 },
            mx: { xs: 'auto', xl: 0 },
            flex: { xl: '0 1 600px' },
            // Override the design's hero-scoped centering for the xl row
            // layout (these selectors out-specify a flat sx rule).
            '& .lead': {
              mx: { xs: 'auto', xl: 0 },
              maxWidth: { xs: 620, xl: 'none' },
            },
            '& .hero-cta, & .hero-meta': {
              justifyContent: { xs: 'center', xl: 'flex-start' },
            },
          }}
        >
          <span className='eyebrow reveal'>Open source · Self-hosted</span>
          <h1 className='reveal d1'>
            Manage your <span className='grad'>Typesense cluster</span> without
            touching the terminal
          </h1>
          <p className='lead reveal d2'>
            A fast, polished UI to manage self-hosted and local Typesense
            instances — search, schemas, geosearch, API keys and more. 100%
            client-side, no backend, your admin keys never leave the browser.
          </p>
          <div className='hero-cta reveal d3'>
            <a
              className='btn btn-primary'
              href={DEMO_URL}
              target='_blank'
              rel='noopener'
            >
              <PlayIcon />
              Try the live demo
            </a>
            <a
              className='btn btn-ghost'
              href={REPO_URL}
              target='_blank'
              rel='noopener'
            >
              <GithubIcon />
              View on GitHub
            </a>
          </div>
          <Box className='hero-meta reveal d4' sx={{ pb: 2 }}>
            <span>
              <CheckIcon strokeWidth={2.5} /> Compatible with Typesense v29 &
              v30
            </span>
            <span>
              <CheckIcon strokeWidth={2.5} /> No telemetry, no accounts
            </span>
            <span>
              <CheckIcon strokeWidth={2.5} /> Deploy in one command
            </span>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            minWidth: 0,
            maxWidth: 1000,
            flex: { xl: '1 1 0' },
            // In the xl row layout the column can be narrower than the mock's
            // natural width. Keep the dashboard at full size so its grids don't
            // squish/wrap; the shot-frame (overflow: hidden) clips whatever
            // doesn't fit. When the column is wider than this, nothing clips.
            '& .ts-app': { minWidth: { xl: 960 } },
          }}
        >
          <div className='shot-frame reveal d2' id='heroShot' ref={shotRef}>
            <div className='win-bar'>
              <div className='win-dots'>
                <i className='close' />
                <i className='minimize' />
                <i className='fullscreen' />
              </div>
              <div className='win-url'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <rect x='3' y='11' width='18' height='11' rx='2' />
                  <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                </svg>{' '}
                localhost:5173/dashboard
              </div>
            </div>

            <div className='ts-app'>
              <aside className='ts-side'>
                <div className='ts-brand'>
                  <span className='logo'>
                    <Logo />
                  </span>{' '}
                  Typesense
                </div>
                <div className='ts-env'>
                  <span className='ico'>
                    <svg
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <polyline points='16 18 22 12 16 6' />
                      <polyline points='8 6 2 12 8 18' />
                    </svg>
                  </span>
                  <div>
                    <b>development</b>
                    <span>https://localhost:443</span>
                  </div>
                  <span className='chev'>
                    <svg
                      viewBox='0 0 24 24'
                      width='14'
                      height='14'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <polyline points='6 9 12 15 18 9' />
                    </svg>
                  </span>
                </div>
                <a className='ts-nav-item active'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' />
                  </svg>{' '}
                  Home
                </a>
                <div className='ts-navlabel'>Workspace</div>
                <a className='ts-nav-item'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <rect x='3' y='3' width='18' height='18' rx='2' />
                    <path d='M3 9h18M9 21V9' />
                  </svg>{' '}
                  Collections
                </a>
                <a className='ts-nav-item sub'>
                  <SearchIcon /> Search
                </a>
                <a className='ts-nav-item sub'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <line x1='8' y1='6' x2='21' y2='6' />
                    <line x1='8' y1='12' x2='21' y2='12' />
                    <line x1='8' y1='18' x2='21' y2='18' />
                    <line x1='3' y1='6' x2='3.01' y2='6' />
                    <line x1='3' y1='12' x2='3.01' y2='12' />
                    <line x1='3' y1='18' x2='3.01' y2='18' />
                  </svg>{' '}
                  Schema
                </a>
                <a className='ts-nav-item'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='17 1 21 5 17 9' />
                    <path d='M3 11V9a4 4 0 0 1 4-4h14' />
                    <polyline points='7 23 3 19 7 15' />
                    <path d='M21 13v2a4 4 0 0 1-4 4H3' />
                  </svg>{' '}
                  Aliases
                </a>
                <a className='ts-nav-item'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polygon points='12 2 15 9 22 9.3 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.3 9 9' />
                  </svg>{' '}
                  Presets
                </a>
                <div className='ts-navlabel'>Cluster</div>
                <a className='ts-nav-item'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='7.5' cy='15.5' r='4.5' />
                    <path d='m10.7 12.3 8.3-8.3M16 5l3 3M13 8l3 3' />
                  </svg>{' '}
                  API keys
                </a>
                <a className='ts-nav-item'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M3 3v18h18' />
                    <path d='m7 14 3-4 3 3 4-6' />
                  </svg>{' '}
                  Analytics
                </a>
                <a className='ts-nav-item'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='12' cy='12' r='3' />
                    <path d='M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2' />
                  </svg>{' '}
                  Server status
                </a>
                <div className='ts-side-foot'>
                  <div className='ts-status'>
                    <span className='dot' />
                    <div>
                      <b>Development</b>
                      <span>https://localhost</span>
                    </div>
                  </div>
                </div>
              </aside>

              <div className='ts-main'>
                <div className='ts-head'>
                  <div>
                    <div className='ts-eyebrow'>
                      NODE-1 · localhost:443 · v30.2
                    </div>
                    <h3>Cluster overview</h3>
                    <p>
                      Your cluster is healthy. 2 collections indexed · 6,638
                      documents.
                    </p>
                  </div>
                  <div className='ts-head-actions'>
                    <span className='ts-btn'>
                      <ExternalLinkIcon /> Docs
                    </span>
                    <span className='ts-btn pri'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={2.4}
                        strokeLinecap='round'
                      >
                        <line x1='12' y1='5' x2='12' y2='19' />
                        <line x1='5' y1='12' x2='19' y2='12' />
                      </svg>{' '}
                      New collection
                    </span>
                  </div>
                </div>

                <div className='ts-stats'>
                  <div className='ts-stat'>
                    <div className='k'>Search QPS</div>
                    <div className='v' data-count='81.8' data-dec='1'>
                      0
                    </div>
                    <div className='s'>
                      requests/sec <span className='up'>+8.4%</span>
                    </div>
                  </div>
                  <div className='ts-stat'>
                    <div className='k'>P95 latency</div>
                    <div className='v' data-count='6' data-suffix=' ms'>
                      0
                    </div>
                    <div className='s'>
                      last 5 min <span className='up'>−1.2 ms</span>
                    </div>
                  </div>
                  <div className='ts-stat'>
                    <div className='k'>Documents</div>
                    <div className='v' data-count='6638'>
                      0
                    </div>
                    <div className='s'>
                      2 collections <span className='up'>+12,402 wk</span>
                    </div>
                  </div>
                  <div className='ts-stat'>
                    <div className='k'>Memory</div>
                    <div className='v' data-count='3.11' data-dec='2'>
                      <small>GB</small> 0
                    </div>
                    <div className='s'>41% of 7.65 GB</div>
                  </div>
                </div>

                <div className='ts-grid2'>
                  <div className='ts-panel'>
                    <div className='ts-panel-head'>
                      <h4>Top searches</h4>
                      <div className='ts-seg'>
                        <b>1h</b>
                        <b>6h</b>
                        <b className='on'>24h</b>
                        <b>7d</b>
                      </div>
                    </div>
                    <div className='sub'>last 24 hours · 14,208 queries</div>
                    <div className='ts-top'>
                      {[
                        { rk: 1, q: 'vanderbilt', w: '100%', ct: 1284 },
                        { rk: 2, q: 'east nashville', w: '77%', ct: 982 },
                        { rk: 3, q: 'downtown loft', w: '58%', ct: 740 },
                        { rk: 4, q: 'belmont 2br', w: '43%', ct: 553 },
                        { rk: 5, q: 'pet friendly', w: '33%', ct: 421 },
                      ].map((r) => (
                        <div className='ts-top-row' key={r.rk}>
                          <span className='rk'>{r.rk}</span>
                          <span className='q'>{r.q}</span>
                          <div className='ts-tbar'>
                            <i style={{ width: r.w }} />
                          </div>
                          <span className='ct' data-count={r.ct}>
                            0
                          </span>
                        </div>
                      ))}
                      <div className='ts-top-row noresult'>
                        <span className='rk'>6</span>
                        <span className='q'>
                          pool + parking <em>no results</em>
                        </span>
                        <div className='ts-tbar'>
                          <i style={{ width: '25%' }} />
                        </div>
                        <span className='ct' data-count='318'>
                          0
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='ts-panel ts-cluster'>
                    <div className='ts-panel-head'>
                      <h4>Cluster status</h4>
                      <span className='ts-pill-ok'>
                        <i /> Healthy
                      </span>
                    </div>
                    <div className='row'>
                      <span>Memory</span>
                      <div className='ts-bar'>
                        <i style={{ width: '41%' }} />
                      </div>
                      <span className='amt'>3.11 / 7.65 GB</span>
                    </div>
                    <div className='row'>
                      <span>Disk</span>
                      <div className='ts-bar'>
                        <i
                          style={{ width: '88%', background: 'var(--warning)' }}
                        />
                      </div>
                      <span className='amt'>405 / 460 GB</span>
                    </div>
                    <div className='row'>
                      <span>CPU</span>
                      <div className='ts-bar'>
                        <i style={{ width: '8%' }} />
                      </div>
                      <span className='amt'>1.0% · 11 cores</span>
                    </div>
                    <div className='ts-qa'>
                      <b>
                        <svg
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth={2}
                          strokeLinecap='round'
                        >
                          <line x1='12' y1='5' x2='12' y2='19' />
                          <line x1='5' y1='12' x2='19' y2='12' />
                        </svg>{' '}
                        New collection
                      </b>
                      <b>
                        <svg
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth={2}
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <circle cx='7.5' cy='15.5' r='4.5' />
                          <path d='m10.7 12.3 8.3-8.3M16 5l3 3' />
                        </svg>{' '}
                        API key
                      </b>
                      <b>
                        <svg
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth={2}
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                          <polyline points='7 10 12 15 17 10' />
                          <line x1='12' y1='15' x2='12' y2='3' />
                        </svg>{' '}
                        Backup
                      </b>
                      <b>
                        <svg
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth={2}
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <polyline points='17 1 21 5 17 9' />
                          <path d='M3 11V9a4 4 0 0 1 4-4h14' />
                          <polyline points='7 23 3 19 7 15' />
                          <path d='M21 13v2a4 4 0 0 1-4 4H3' />
                        </svg>{' '}
                        Create alias
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Stack>
    </Box>
  );
};

// export const Hero = () => {
//   const shotRef = useRef<HTMLDivElement>(null);
//   useHeroCountUp(shotRef);

//   return (
//     <div className='hero'>
//       {/* <Stack
//         direction={{ xs: 'column', xl: 'row' }}
//         spacing={{ xs: 3, md: 6, xl: 8 }}
//       > */}
//       <div className='wrap hero-inner'>
//         <span className='eyebrow reveal'>Open source · Self-hosted · MIT</span>
//         <h1 className='reveal d1'>
//           The dashboard your <span className='grad'>Typesense cluster</span>{' '}
//           deserves
//         </h1>
//         <p className='lead reveal d2'>
//           A fast, polished UI to manage self-hosted and local Typesense
//           instances — search, schemas, geosearch, API keys and more. 100%
//           client-side, no backend, your admin keys never leave the browser.
//         </p>
//         <div className='hero-cta reveal d3'>
//           <a
//             className='btn btn-primary'
//             href={DEMO_URL}
//             target='_blank'
//             rel='noopener'
//           >
//             <PlayIcon />
//             Try the live demo
//           </a>
//           <a
//             className='btn btn-ghost'
//             href={REPO_URL}
//             target='_blank'
//             rel='noopener'
//           >
//             <GithubIcon />
//             View on GitHub
//           </a>
//         </div>
//         <div className='hero-meta reveal d4'>
//           <span>
//             <CheckIcon strokeWidth={2.5} /> Compatible with Typesense v29 & v30
//           </span>
//           <span>
//             <CheckIcon strokeWidth={2.5} /> No telemetry, no accounts
//           </span>
//           <span>
//             <CheckIcon strokeWidth={2.5} /> Deploy in one command
//           </span>
//         </div>
//       </div>

//       <div className='wrap'>
//         <div className='shot-frame reveal d2' id='heroShot' ref={shotRef}>
//           <div className='win-bar'>
//             <div className='win-dots'>
//               <i />
//               <i />
//               <i />
//             </div>
//             <div className='win-url'>
//               <svg
//                 viewBox='0 0 24 24'
//                 fill='none'
//                 stroke='currentColor'
//                 strokeWidth={2}
//               >
//                 <rect x='3' y='11' width='18' height='11' rx='2' />
//                 <path d='M7 11V7a5 5 0 0 1 10 0v4' />
//               </svg>{' '}
//               localhost:5173/dashboard
//             </div>
//           </div>

//           <div className='ts-app'>
//             <aside className='ts-side'>
//               <div className='ts-brand'>
//                 <span className='logo'>
//                   <Logo />
//                 </span>{' '}
//                 Typesense
//               </div>
//               <div className='ts-env'>
//                 <span className='ico'>
//                   <svg
//                     viewBox='0 0 24 24'
//                     fill='none'
//                     stroke='currentColor'
//                     strokeWidth={2}
//                     strokeLinecap='round'
//                     strokeLinejoin='round'
//                   >
//                     <polyline points='16 18 22 12 16 6' />
//                     <polyline points='8 6 2 12 8 18' />
//                   </svg>
//                 </span>
//                 <div>
//                   <b>development</b>
//                   <span>https://localhost:443</span>
//                 </div>
//                 <span className='chev'>
//                   <svg
//                     viewBox='0 0 24 24'
//                     width='14'
//                     height='14'
//                     fill='none'
//                     stroke='currentColor'
//                     strokeWidth={2}
//                   >
//                     <polyline points='6 9 12 15 18 9' />
//                   </svg>
//                 </span>
//               </div>
//               <a className='ts-nav-item active'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <path d='M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' />
//                 </svg>{' '}
//                 Home
//               </a>
//               <div className='ts-navlabel'>Workspace</div>
//               <a className='ts-nav-item'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <rect x='3' y='3' width='18' height='18' rx='2' />
//                   <path d='M3 9h18M9 21V9' />
//                 </svg>{' '}
//                 Collections
//               </a>
//               <a className='ts-nav-item sub'>
//                 <SearchIcon /> Search
//               </a>
//               <a className='ts-nav-item sub'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <line x1='8' y1='6' x2='21' y2='6' />
//                   <line x1='8' y1='12' x2='21' y2='12' />
//                   <line x1='8' y1='18' x2='21' y2='18' />
//                   <line x1='3' y1='6' x2='3.01' y2='6' />
//                   <line x1='3' y1='12' x2='3.01' y2='12' />
//                   <line x1='3' y1='18' x2='3.01' y2='18' />
//                 </svg>{' '}
//                 Schema
//               </a>
//               <a className='ts-nav-item'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <polyline points='17 1 21 5 17 9' />
//                   <path d='M3 11V9a4 4 0 0 1 4-4h14' />
//                   <polyline points='7 23 3 19 7 15' />
//                   <path d='M21 13v2a4 4 0 0 1-4 4H3' />
//                 </svg>{' '}
//                 Aliases
//               </a>
//               <a className='ts-nav-item'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <polygon points='12 2 15 9 22 9.3 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.3 9 9' />
//                 </svg>{' '}
//                 Presets
//               </a>
//               <div className='ts-navlabel'>Cluster</div>
//               <a className='ts-nav-item'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <circle cx='7.5' cy='15.5' r='4.5' />
//                   <path d='m10.7 12.3 8.3-8.3M16 5l3 3M13 8l3 3' />
//                 </svg>{' '}
//                 API keys
//               </a>
//               <a className='ts-nav-item'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <path d='M3 3v18h18' />
//                   <path d='m7 14 3-4 3 3 4-6' />
//                 </svg>{' '}
//                 Analytics
//               </a>
//               <a className='ts-nav-item'>
//                 <svg
//                   viewBox='0 0 24 24'
//                   fill='none'
//                   stroke='currentColor'
//                   strokeWidth={2}
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 >
//                   <circle cx='12' cy='12' r='3' />
//                   <path d='M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2' />
//                 </svg>{' '}
//                 Server status
//               </a>
//               <div className='ts-side-foot'>
//                 <div className='ts-status'>
//                   <span className='dot' />
//                   <div>
//                     <b>Development</b>
//                     <span>https://localhost</span>
//                   </div>
//                 </div>
//               </div>
//             </aside>

//             <div className='ts-main'>
//               <div className='ts-head'>
//                 <div>
//                   <div className='ts-eyebrow'>
//                     NODE-1 · localhost:443 · v29.0
//                   </div>
//                   <h3>Cluster overview</h3>
//                   <p>
//                     Your cluster is healthy. 2 collections indexed · 6,638
//                     documents.
//                   </p>
//                 </div>
//                 <div className='ts-head-actions'>
//                   <span className='ts-btn'>
//                     <ExternalLinkIcon /> Docs
//                   </span>
//                   <span className='ts-btn pri'>
//                     <svg
//                       viewBox='0 0 24 24'
//                       fill='none'
//                       stroke='currentColor'
//                       strokeWidth={2.4}
//                       strokeLinecap='round'
//                     >
//                       <line x1='12' y1='5' x2='12' y2='19' />
//                       <line x1='5' y1='12' x2='19' y2='12' />
//                     </svg>{' '}
//                     New collection
//                   </span>
//                 </div>
//               </div>

//               <div className='ts-stats'>
//                 <div className='ts-stat'>
//                   <div className='k'>Search QPS</div>
//                   <div className='v' data-count='81.8' data-dec='1'>
//                     0
//                   </div>
//                   <div className='s'>
//                     requests/sec <span className='up'>+8.4%</span>
//                   </div>
//                 </div>
//                 <div className='ts-stat'>
//                   <div className='k'>P95 latency</div>
//                   <div className='v' data-count='6' data-suffix=' ms'>
//                     0
//                   </div>
//                   <div className='s'>
//                     last 5 min <span className='up'>−1.2 ms</span>
//                   </div>
//                 </div>
//                 <div className='ts-stat'>
//                   <div className='k'>Documents</div>
//                   <div className='v' data-count='6638'>
//                     0
//                   </div>
//                   <div className='s'>
//                     2 collections <span className='up'>+12,402 wk</span>
//                   </div>
//                 </div>
//                 <div className='ts-stat'>
//                   <div className='k'>Memory</div>
//                   <div className='v' data-count='3.11' data-dec='2'>
//                     <small>GB</small> 0
//                   </div>
//                   <div className='s'>41% of 7.65 GB</div>
//                 </div>
//               </div>

//               <div className='ts-grid2'>
//                 <div className='ts-panel'>
//                   <div className='ts-panel-head'>
//                     <h4>Top searches</h4>
//                     <div className='ts-seg'>
//                       <b>1h</b>
//                       <b>6h</b>
//                       <b className='on'>24h</b>
//                       <b>7d</b>
//                     </div>
//                   </div>
//                   <div className='sub'>last 24 hours · 14,208 queries</div>
//                   <div className='ts-top'>
//                     {[
//                       { rk: 1, q: 'vanderbilt', w: '100%', ct: 1284 },
//                       { rk: 2, q: 'east nashville', w: '77%', ct: 982 },
//                       { rk: 3, q: 'downtown loft', w: '58%', ct: 740 },
//                       { rk: 4, q: 'belmont 2br', w: '43%', ct: 553 },
//                       { rk: 5, q: 'pet friendly', w: '33%', ct: 421 },
//                     ].map((r) => (
//                       <div className='ts-top-row' key={r.rk}>
//                         <span className='rk'>{r.rk}</span>
//                         <span className='q'>{r.q}</span>
//                         <div className='ts-tbar'>
//                           <i style={{ width: r.w }} />
//                         </div>
//                         <span className='ct' data-count={r.ct}>
//                           0
//                         </span>
//                       </div>
//                     ))}
//                     <div className='ts-top-row noresult'>
//                       <span className='rk'>6</span>
//                       <span className='q'>
//                         pool + parking <em>no results</em>
//                       </span>
//                       <div className='ts-tbar'>
//                         <i style={{ width: '25%' }} />
//                       </div>
//                       <span className='ct' data-count='318'>
//                         0
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className='ts-panel ts-cluster'>
//                   <div className='ts-panel-head'>
//                     <h4>Cluster status</h4>
//                     <span className='ts-pill-ok'>
//                       <i /> Healthy
//                     </span>
//                   </div>
//                   <div className='row'>
//                     <span>Memory</span>
//                     <div className='ts-bar'>
//                       <i style={{ width: '41%' }} />
//                     </div>
//                     <span className='amt'>3.11 / 7.65 GB</span>
//                   </div>
//                   <div className='row'>
//                     <span>Disk</span>
//                     <div className='ts-bar'>
//                       <i
//                         style={{ width: '88%', background: 'var(--warning)' }}
//                       />
//                     </div>
//                     <span className='amt'>405 / 460 GB</span>
//                   </div>
//                   <div className='row'>
//                     <span>CPU</span>
//                     <div className='ts-bar'>
//                       <i style={{ width: '8%' }} />
//                     </div>
//                     <span className='amt'>1.0% · 11 cores</span>
//                   </div>
//                   <div className='ts-qa'>
//                     <b>
//                       <svg
//                         viewBox='0 0 24 24'
//                         fill='none'
//                         stroke='currentColor'
//                         strokeWidth={2}
//                         strokeLinecap='round'
//                       >
//                         <line x1='12' y1='5' x2='12' y2='19' />
//                         <line x1='5' y1='12' x2='19' y2='12' />
//                       </svg>{' '}
//                       New collection
//                     </b>
//                     <b>
//                       <svg
//                         viewBox='0 0 24 24'
//                         fill='none'
//                         stroke='currentColor'
//                         strokeWidth={2}
//                         strokeLinecap='round'
//                         strokeLinejoin='round'
//                       >
//                         <circle cx='7.5' cy='15.5' r='4.5' />
//                         <path d='m10.7 12.3 8.3-8.3M16 5l3 3' />
//                       </svg>{' '}
//                       API key
//                     </b>
//                     <b>
//                       <svg
//                         viewBox='0 0 24 24'
//                         fill='none'
//                         stroke='currentColor'
//                         strokeWidth={2}
//                         strokeLinecap='round'
//                         strokeLinejoin='round'
//                       >
//                         <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
//                         <polyline points='7 10 12 15 17 10' />
//                         <line x1='12' y1='15' x2='12' y2='3' />
//                       </svg>{' '}
//                       Backup
//                     </b>
//                     <b>
//                       <svg
//                         viewBox='0 0 24 24'
//                         fill='none'
//                         stroke='currentColor'
//                         strokeWidth={2}
//                         strokeLinecap='round'
//                         strokeLinejoin='round'
//                       >
//                         <polyline points='17 1 21 5 17 9' />
//                         <path d='M3 11V9a4 4 0 0 1 4-4h14' />
//                         <polyline points='7 23 3 19 7 15' />
//                         <path d='M21 13v2a4 4 0 0 1-4 4H3' />
//                       </svg>{' '}
//                       Create alias
//                     </b>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* </Stack> */}
//     </div>
//   );
// };
