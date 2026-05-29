import { createContext } from 'react';

export interface VersionInfo {
  major: number;
  raw: string;
  is30Plus: boolean;
}

export const VersionContext = createContext<VersionInfo | null>(null);

if (import.meta.env.DEV) {
  VersionContext.displayName = 'VersionContext';
}
