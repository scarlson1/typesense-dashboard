import { useContext } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { VersionContext, type VersionInfo } from '@/context/VersionContext';

// TODO: handle SP API errors, zod errors, etc.

// The dashboard's API calls are shaped for these major versions. A server
// outside this range (or one whose version we couldn't read) is the most
// likely cause of an otherwise-unexplained failure.
const RECOMMENDED_MAJORS = [29, 30];

// A version mismatch typically surfaces as a missing endpoint (404) or a
// rejected payload shape (400/422). Auth (401/403) and server/network (5xx)
// failures are unrelated to the version, so we don't nudge on those.
const VERSION_SUSPECT_STATUSES = new Set([400, 404, 422]);

// Version is the deciding factor; the HTTP status is only an extra filter so
// we stay quiet on auth/outage errors that happen to occur on an off-range
// server. A crash with no status (e.g. a render error) still gets the hint.
const isVersionRelated = (
  error: unknown,
  version: VersionInfo | null,
): boolean => {
  if (!version) return false;

  const versionOffRange =
    version.status === 'error' ||
    (version.status === 'ready' &&
      version.major > 0 &&
      !RECOMMENDED_MAJORS.includes(version.major));
  if (!versionOffRange) return false;

  const status = (error as { httpStatus?: number } | null)?.httpStatus;
  if (typeof status === 'number') return VERSION_SUSPECT_STATUSES.has(status);
  return true;
};

const versionHint = (version: VersionInfo): string => {
  const supported = 'This dashboard is built for Typesense v29 and v30';
  if (version.status === 'error') {
    return `${supported}. Your server's version couldn't be determined, which may be related to this error.`;
  }
  return `${supported}, but you're connected to v${version.raw}. That mismatch may be causing this error.`;
};

export function ErrorFallback({ error }: FallbackProps) {
  // Read the context directly (not the hook) so this still renders outside a
  // VersionProvider — the hook throws when the context is absent.
  const version = useContext(VersionContext);

  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  const msg = error && error instanceof Error ? error.message : String(error);

  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{msg}</pre>
      {isVersionRelated(error, version) && version && (
        <p style={{ fontSize: '0.85em', opacity: 0.8 }}>
          {versionHint(version)}
        </p>
      )}
    </div>
  );
}
