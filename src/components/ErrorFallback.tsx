import type { FallbackProps } from 'react-error-boundary';

// TODO: handle SP API errors, zod errors, etc.

export function ErrorFallback({ error }: FallbackProps) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}
