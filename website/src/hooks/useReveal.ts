import { useEffect } from 'react';

/* Reveal-on-scroll for every .reveal element, with a transition-free failsafe
   for environments where IntersectionObserver never fires (matches app.js). */
export const useReveal = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (els.length === 0) return;

    const showStatic = (el: HTMLElement) => {
      el.classList.add('in');
      el.style.transition = 'none';
      el.style.opacity = '1';
      el.style.transform = 'none';
    };

    if (!('IntersectionObserver' in window)) {
      els.forEach(showStatic);
      return;
    }

    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            fired = true;
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));

    const failsafe = window.setTimeout(() => {
      if (!fired) els.forEach(showStatic);
    }, 650);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);
};
