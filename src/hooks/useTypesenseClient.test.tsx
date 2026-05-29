import {
  captureHookThrow,
  resetTestState,
  setStoreCreds,
  testCreds,
} from '@/test/utils';
import { typesenseStore } from '@/utils/typesenseStore';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTypesenseClient } from './useTypesenseClient';

afterEach(resetTestState);

describe('useTypesenseClient', () => {
  it('returns a configured client and the active cluster key when authenticated', () => {
    const key = setStoreCreds();

    const { result } = renderHook(() => useTypesenseClient());
    const [client, clusterId] = result.current;

    expect(clusterId).toBe(key);
    expect(client.configuration.apiKey).toBe(testCreds.apiKey);
    expect(client.configuration.nodes[0]).toMatchObject({
      host: testCreds.node,
      port: testCreds.port,
      protocol: testCreds.protocol,
    });
  });

  it('throws a redirect to /auth when there is no active cluster', () => {
    // store left empty (currentCredsKey === null)
    const thrown = captureHookThrow(() => useTypesenseClient()) as {
      options?: { to?: string };
    };
    expect(thrown?.options?.to).toBe('/auth');
  });

  it('throws a redirect when the active key has no matching credentials', () => {
    typesenseStore.setState({ credentials: {}, currentCredsKey: 'http://ghost:1' });
    const thrown = captureHookThrow(() => useTypesenseClient()) as {
      options?: { to?: string };
    };
    expect(thrown?.options?.to).toBe('/auth');
  });
});
