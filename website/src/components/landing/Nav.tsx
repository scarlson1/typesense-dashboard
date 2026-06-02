import { GithubIcon, Logo, MoonIcon, SunIcon } from '#/components/icons'
import { DEMO_URL, REPO_URL } from '#/components/landing/links'
import { useScrolled, useTheme } from '#/hooks'

export const Nav = () => {
  const scrolled = useScrolled()
  const { toggle } = useTheme()

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="wrap nav-inner">
        <a className="brand" href="#top">
          <span className="logo">
            <Logo />
          </span>
          <span>
            Typesense Dashboard <small>· OSS</small>
          </span>
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#search">Search</a>
          <a href="#gallery">Screenshots</a>
          <a href="#open-source">Open source</a>
          <a href="#start">Get started</a>
        </nav>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label="Toggle color theme"
          >
            <SunIcon />
            <MoonIcon />
          </button>
          <a
            className="btn btn-ghost btn-sm"
            href={REPO_URL}
            target="_blank"
            rel="noopener"
          >
            <GithubIcon />
            GitHub
          </a>
          <a
            className="btn btn-primary btn-sm"
            href={DEMO_URL}
            target="_blank"
            rel="noopener"
          >
            Live demo
          </a>
        </div>
      </div>
    </header>
  )
}
