import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VersionContext, type VersionInfo } from '@/context/VersionContext';
import { ErrorFallback } from './ErrorFallback';

const noop = () => {};

const withVersion = (version: VersionInfo, error: unknown) =>
  render(
    <VersionContext.Provider value={version}>
      <ErrorFallback error={error} resetErrorBoundary={noop} />
    </VersionContext.Provider>
  );

const versionError = (httpStatus: number) =>
  Object.assign(new Error('boom'), { httpStatus });

const ready = (major: number): VersionInfo => ({
  major,
  raw: `${major}.0`,
  is30Plus: major >= 30,
  status: 'ready',
});

const hintMatcher = /built for Typesense v29 and v30/;

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

  it('does not show the version hint without a VersionProvider', () => {
    render(<ErrorFallback error={versionError(404)} resetErrorBoundary={noop} />);

    expect(screen.queryByText(hintMatcher)).not.toBeInTheDocument();
  });

  it('stays quiet on a recommended version', () => {
    withVersion(ready(30), versionError(404));

    expect(screen.queryByText(hintMatcher)).not.toBeInTheDocument();
  });

  it('nudges on a shape-mismatch status for an off-range version', () => {
    withVersion(ready(28), versionError(404));

    expect(screen.getByText(/connected to v28\.0/)).toBeInTheDocument();
  });

  it('stays quiet on an auth error even off-range', () => {
    withVersion(ready(28), versionError(401));

    expect(screen.queryByText(hintMatcher)).not.toBeInTheDocument();
  });

  it('nudges on a statusless crash for an off-range version', () => {
    withVersion(ready(28), new Error('render blew up'));

    expect(screen.getByText(hintMatcher)).toBeInTheDocument();
  });

  it('nudges when the version could not be determined', () => {
    withVersion(
      { major: 29, raw: '29.0', is30Plus: false, status: 'error' },
      new Error('render blew up')
    );

    expect(screen.getByText(/couldn't be determined/)).toBeInTheDocument();
  });
});
