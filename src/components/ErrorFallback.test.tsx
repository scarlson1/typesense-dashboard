import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorFallback } from './ErrorFallback';

const noop = () => {};

describe('ErrorFallback', () => {
  it('renders an alert with the Error message', () => {
    render(
      <ErrorFallback
        error={new Error('boom')}
        resetErrorBoundary={noop}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong:')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('stringifies a non-Error thrown value', () => {
    render(
      <ErrorFallback error={'plain string failure'} resetErrorBoundary={noop} />
    );

    expect(screen.getByText('plain string failure')).toBeInTheDocument();
  });
});
