import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

/* Theme toggle backed by localStorage + the <html data-theme> attribute.
   The no-flash script in __root applies the stored theme before paint; here
   we sync React state to it on mount and flip it on demand. */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'light' || current === 'dark') setTheme(current)
  }, [])

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('ts-theme', next)
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return { theme, toggle }
}

/* Adds a shadow/background to the nav once the page scrolls. */
export const useScrolled = (offset = 8) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])

  return scrolled
}

/* Reveal-on-scroll for every .reveal element, with a transition-free failsafe
   for environments where IntersectionObserver never fires (matches app.js). */
export const useReveal = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (els.length === 0) return

    const showStatic = (el: HTMLElement) => {
      el.classList.add('in')
      el.style.transition = 'none'
      el.style.opacity = '1'
      el.style.transform = 'none'
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(showStatic)
      return
    }

    let fired = false
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            fired = true
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((el) => io.observe(el))

    const failsafe = window.setTimeout(() => {
      if (!fired) els.forEach(showStatic)
    }, 650)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])
}
