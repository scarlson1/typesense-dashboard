import { useCallback, useEffect, useRef, type RefObject } from 'react';

// TODO: use for select menu item animation ??
// emit event or update state to set active menu item when css class is added
// use react spring to move animated div to new element location ??

const DEFAULT_OPTIONS: MutationObserverInit = {
  attributes: true,
  attributeFilter: ['class'],
  // childList: true,
  // subtree: true,
};

export function useMutationObservable(
  target: MaybeRef<Element | null | undefined>,
  cb: MutationCallback,
  options: MutationObserverInit = DEFAULT_OPTIONS
) {
  const observer = useRef<MutationObserver | null>(null);

  const stop = useCallback(() => {
    if (!observer.current) return;

    observer.current.disconnect();
    observer.current = null;
  }, []);

  useEffect(() => {
    const el = unRef(target);
    if (!el) return;

    console.log('NEW OBSERVER');
    observer.current = new MutationObserver(cb);
    observer.current?.observe(el, options);

    return stop;
  }, [target, options, cb, stop]);
}

export type MaybeRef<T> = T | RefObject<T>;

export const isRef = (obj: unknown): boolean =>
  obj !== null &&
  typeof obj === 'object' &&
  Object.prototype.hasOwnProperty.call(obj, 'current');

export function unRef<T = HTMLElement>(target: MaybeRef<T>): T {
  const element = isRef(target)
    ? (target as RefObject<T>).current
    : (target as T);

  return element;
}
