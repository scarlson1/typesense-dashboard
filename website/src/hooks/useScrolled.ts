import { useEffect, useState } from 'react';

/* Adds a shadow/background to the nav once the page scrolls. */
export const useScrolled = (offset = 8) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return scrolled;
};
