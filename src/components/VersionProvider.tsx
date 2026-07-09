import { VersionContext, type VersionInfo } from '@/context/VersionContext';
import { getTypesenseClient, typesenseStore } from '@/utils';
import { Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import { useStore } from 'zustand';

// Search-only keys can't read /debug, so the server answers 401/403. We can't
// detect the version in that case, so we deliberately fall back to the legacy
// (v29) UI — which works for both versions. Any OTHER error (network, timeout,
// 5xx) is transient/unexpected and must NOT silently downgrade the UI.
const isAuthError = (err: unknown): boolean => {
  const status = (err as { httpStatus?: number } | null)?.httpStatus;
  return status === 401 || status === 403;
};

const parseVersion = (raw: string): Omit<VersionInfo, 'status'> => {
  const major = parseInt(raw.split('.')[0] ?? '', 10);
  return {
    major: Number.isNaN(major) ? 0 : major,
    raw,
    is30Plus: !Number.isNaN(major) && major >= 30,
  };
};

export const VersionProvider = ({ children }: { children: ReactNode }) => {
  const credentials = useStore(typesenseStore, (s) => s.credentials);
  const clusterId = useStore(typesenseStore, (s) => s.currentCredsKey);

  // const [versionInfo, setVersionInfo] = useState({
  //   major: 0,
  //   raw: '',
  //   is30Plus: true,
  // });

  const client = useMemo(() => {
    const creds = clusterId ? credentials[clusterId] : null;
    return creds ? getTypesenseClient(creds) : null;
  }, [credentials, clusterId]);

  const query = useQuery({
    queryKey: ['typesenseVersion', clusterId],
    enabled: Boolean(client),
    staleTime: Infinity, // version doesn't change within a session
    // Don't burn retries on the expected 401/403; do retry transient failures.
    retry: (failureCount, err) => !isAuthError(err) && failureCount < 2,
    queryFn: async () => {
      const { version } = await client!.debug.retrieve();
      return version;
    },
  });

  const versionInfo = useMemo<VersionInfo>(() => {
    if (query.isSuccess) {
      return { ...parseVersion(query.data), status: 'ready' };
    }
    if (query.isError) {
      // 401/403 => search-only key: intentional, resolved legacy default.
      // Anything else => we genuinely don't know; expose 'error' so the UI can
      // surface it instead of pretending it's a confident v29 answer.
      return {
        ...parseVersion('29.0'),
        status: isAuthError(query.error) ? 'ready' : 'error',
      };
    }
    // No cluster selected, or query still in flight.
    return { major: 0, raw: '', is30Plus: false, status: 'loading' };
  }, [query.isSuccess, query.isError, query.data, query.error]);

  // Gate the dashboard subtree until the version is known, so version-gated
  // children (Sidebar items, curation/analytics routes) never render against a
  // guess and then flip. Only gates when a cluster is selected and we're still
  // loading; an unresolved 'error' state still renders (with the legacy fallback).
  if (client && versionInfo.status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  // const updateVersion = useCallback((v: string) => {
  //   // parse data.version string (e.g. "30.0" → major: 30
  //   const majorStr = v.split('.')[0];

  //   setVersionInfo({
  //     major: majorStr ? parseInt(majorStr) : 0,
  //     raw: v,
  //     is30Plus: majorStr ? parseInt(majorStr) >= 30 : false,
  //   });
  // }, []);

  // useEffect(() => {
  //   if (!client) return;
  //   let cancelled = false;
  //   client.debug
  //     .retrieve()
  //     .then((d) => {
  //       if (!cancelled) updateVersion(d.version);
  //     })
  //     .catch(() => {
  //       /* search-only key, fall back to default */
  //       if (!cancelled) updateVersion('29.0');
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [updateVersion, client]);

  return (
    <VersionContext.Provider value={versionInfo}>
      {children}
    </VersionContext.Provider>
  );
};
