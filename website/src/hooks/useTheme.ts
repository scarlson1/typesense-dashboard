import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/* Theme toggle backed by localStorage + the <html data-theme> attribute.
   The no-flash script in __root applies the stored theme before paint; here
   we sync React state to it on mount and flip it on demand. */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light' || current === 'dark') setTheme(current);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('ts-theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return { theme, toggle };
};
