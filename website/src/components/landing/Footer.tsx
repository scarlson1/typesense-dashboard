import { GithubIcon, SearchIcon } from '#/components/icons';
import {
  RELEASES_URL,
  REPO_URL,
  TYPESENSE_DOCS_URL,
  TYPESENSE_URL,
} from '#/components/landing/links';
import { Logo } from '#/components/Logo';

export const Footer = () => (
  <footer className='footer'>
    <div className='wrap'>
      <div className='foot-grid'>
        <div className='foot-brand'>
          <a className='brand' href='#top'>
            <span className='logo'>
              <Logo />
            </span>{' '}
            <span>Typesense Dashboard</span>
          </a>
          <p>
            An open-source dashboard to manage self-hosted and local Typesense
            instances. Built by the community, MIT licensed.
          </p>
          <div className='foot-social'>
            <a
              href={REPO_URL}
              target='_blank'
              rel='noopener'
              aria-label='GitHub'
            >
              <GithubIcon />
            </a>
            <a
              href={TYPESENSE_URL}
              target='_blank'
              rel='noopener'
              aria-label='Typesense'
            >
              <SearchIcon />
            </a>
          </div>
        </div>
        <div className='foot-col'>
          <h5>Product</h5>
          <a href='#features'>Features</a>
          <a href='#search'>Search</a>
          <a href='#gallery'>Screenshots</a>
          <a href='#open-source'>Open source</a>
        </div>
        <div className='foot-col'>
          <h5>Resources</h5>
          <a href={REPO_URL} target='_blank' rel='noopener'>
            GitHub repo
          </a>
          <a href={RELEASES_URL} target='_blank' rel='noopener'>
            Download
          </a>
          <a href={TYPESENSE_DOCS_URL} target='_blank' rel='noopener'>
            Typesense docs
          </a>
          <a href='#start'>Get started</a>
        </div>
        <div className='foot-col'>
          <h5>Deploy</h5>
          <a href={REPO_URL} target='_blank' rel='noopener'>
            Docker
          </a>
          <a href={REPO_URL} target='_blank' rel='noopener'>
            Vercel · Netlify
          </a>
          <a href={REPO_URL} target='_blank' rel='noopener'>
            Railway
          </a>
          <a href={RELEASES_URL} target='_blank' rel='noopener'>
            Desktop app
          </a>
        </div>
      </div>
      <div className='foot-bottom'>
        <span>© 2026 Typesense Dashboard contributors · MIT License</span>
        <span className='disc'>
          An independent open-source project. Not affiliated with or endorsed by
          typesense.org.
        </span>
      </div>
    </div>
  </footer>
);
