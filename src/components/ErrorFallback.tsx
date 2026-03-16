import type { FallbackProps } from 'react-error-boundary';

// TODO: handle SP API errors, zod errors, etc.

export function ErrorFallback({ error }: FallbackProps) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  const msg = error && error instanceof Error ? error.message : String(error);

  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{msg}</pre>
    </div>
  );
}
