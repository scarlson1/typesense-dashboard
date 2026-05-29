import { VersionContext } from '@/context/VersionContext';
import { getTypesenseClient, typesenseStore } from '@/utils';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

export const VersionProvider = ({ children }: { children: ReactNode }) => {
  const credentials = useStore(typesenseStore, (s) => s.credentials);
  const clusterId = useStore(typesenseStore, (s) => s.currentCredsKey);
  const creds = clusterId ? credentials[clusterId] : null;
  const client = creds ? getTypesenseClient(creds) : null;

  const [versionInfo, setVersionInfo] = useState({
    major: 0,
    raw: '',
    is30Plus: true,
  });

  const updateVersion = useCallback((v: string) => {
    // parse data.version string (e.g. "30.0" → major: 30
    const majorStr = v.split('.')[0];

    setVersionInfo({
      major: majorStr ? parseInt(majorStr) : 0,
      raw: v,
      is30Plus: majorStr ? parseInt(majorStr) >= 30 : false,
    });
  }, []);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    client.debug
      .retrieve()
      .then((d: { version: string; state: string; node_name: string }) => {
        if (!cancelled) updateVersion(d.version);
      })
      .catch(() => {
        /* search-only key, fall back to default */
        updateVersion('29.0');
      });
    return () => {
      cancelled = true;
    };
  }, [clusterId, updateVersion, client]);

  return (
    <VersionContext.Provider value={versionInfo}>
      {children}
    </VersionContext.Provider>
  );
};
