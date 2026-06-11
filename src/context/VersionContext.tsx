import { createContext } from 'react';

export type VersionStatus = 'loading' | 'ready' | 'error';

export interface VersionInfo {
  major: number;
  raw: string;
  is30Plus: boolean;
  /**
   * 'loading' until /debug resolves, 'ready' once the version is known (or a
   * search-only key forced the legacy default), 'error' on an unexpected
   * failure where we could NOT determine the version and fell back.
   */
  status: VersionStatus;
}

export const VersionContext = createContext<VersionInfo | null>(null);

if (import.meta.env.DEV) {
  VersionContext.displayName = 'VersionContext';
}
