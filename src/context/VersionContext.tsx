import { createContext } from 'react';

type SupportedVersion = 'v29' | 'v30';

interface VersionContextValues {
  version: SupportedVersion;
}

export const VersionContext = createContext<VersionContextValues | null>(null);

if (import.meta.env.DEV) {
  VersionContext.displayName = 'VersionContext';
}
