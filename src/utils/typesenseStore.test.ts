import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCredsKey,
  getTypesenseClient,
  typesenseStore,
  type TypesenseCreds,
} from './typesenseStore';

const credsA: TypesenseCreds = {
  name: 'A',
  node: 'a.example.com',
  port: 443,
  protocol: 'https',
  apiKey: 'key-a',
};

const credsB: TypesenseCreds = {
  name: 'B',
  node: 'b.example.com',
  port: 8108,
  protocol: 'http',
  apiKey: 'key-b',
};

const keyA = getCredsKey(credsA); // https://a.example.com:443
const keyB = getCredsKey(credsB); // http://b.example.com:8108

// The store is a module-level singleton; reset its in-memory state between
// tests (sessionStorage is cleared by the global setup).
beforeEach(() => {
  typesenseStore.setState({ credentials: {}, currentCredsKey: null });
});

describe('getCredsKey', () => {
  it('builds a protocol://node:port key', () => {
    expect(getCredsKey(credsA)).toBe('https://a.example.com:443');
    expect(getCredsKey(credsB)).toBe('http://b.example.com:8108');
  });

  it('does not depend on the apiKey', () => {
    expect(getCredsKey({ ...credsA, apiKey: 'different' })).toBe(keyA);
  });
});

describe('setCredentials', () => {
  it('adds credentials keyed by their creds key and makes them current', () => {
    typesenseStore.getState().setCredentials(credsA);

    const { credentials, currentCredsKey } = typesenseStore.getState();
    expect(credentials).toEqual({ [keyA]: credsA });
    expect(currentCredsKey).toBe(keyA);
  });

  it('keeps existing clusters when adding a second one', () => {
    const { setCredentials } = typesenseStore.getState();
    setCredentials(credsA);
    setCredentials(credsB);

    const { credentials, currentCredsKey } = typesenseStore.getState();
    expect(Object.keys(credentials)).toEqual([keyA, keyB]);
    expect(currentCredsKey).toBe(keyB);
  });

  it('overwrites a cluster that shares the same creds key', () => {
    const { setCredentials } = typesenseStore.getState();
    setCredentials(credsA);
    setCredentials({ ...credsA, apiKey: 'rotated-key' });

    const { credentials } = typesenseStore.getState();
    expect(Object.keys(credentials)).toEqual([keyA]);
    expect(credentials[keyA].apiKey).toBe('rotated-key');
  });
});

describe('setCredsKey', () => {
  it('switches the active cluster', () => {
    const { setCredentials, setCredsKey } = typesenseStore.getState();
    setCredentials(credsA);
    setCredentials(credsB);

    setCredsKey(keyA);
    expect(typesenseStore.getState().currentCredsKey).toBe(keyA);
  });
});

describe('logout', () => {
  it('clears all credentials when called with no cluster', () => {
    const { setCredentials, logout } = typesenseStore.getState();
    setCredentials(credsA);
    setCredentials(credsB);

    logout();

    const { credentials } = typesenseStore.getState();
    expect(credentials).toEqual({});
  });

  it('removes only the named cluster when it is not the active one', () => {
    const { setCredentials, setCredsKey, logout } = typesenseStore.getState();
    setCredentials(credsA);
    setCredentials(credsB);
    setCredsKey(keyB); // active = B, log out A

    logout(keyA);

    const { credentials, currentCredsKey } = typesenseStore.getState();
    expect(Object.keys(credentials)).toEqual([keyB]);
    expect(currentCredsKey).toBe(keyB);
  });

  it('falls back to a remaining cluster when logging out of the active one', () => {
    const { setCredentials, setCredsKey, logout } = typesenseStore.getState();
    setCredentials(credsA); // inserted first
    setCredentials(credsB);
    setCredsKey(keyA); // active = A (also the first key)

    logout(keyA);

    const { credentials, currentCredsKey } = typesenseStore.getState();
    expect(Object.keys(credentials)).toEqual([keyB]); // A is gone from creds
    // currentCredsKey now points at the surviving cluster, not the removed one.
    expect(currentCredsKey).toBe(keyB);
  });

  it('sets currentCredsKey to null when logging out of the last cluster', () => {
    const { setCredentials, setCredsKey, logout } = typesenseStore.getState();
    setCredentials(credsA);
    setCredsKey(keyA);

    logout(keyA);

    const { credentials, currentCredsKey } = typesenseStore.getState();
    expect(credentials).toEqual({});
    expect(currentCredsKey).toBeNull();
  });
});

describe('getTypesenseClient', () => {
  it('constructs a client from the single-node creds', () => {
    const client = getTypesenseClient(credsA);
    expect(client.configuration.nodes).toHaveLength(1);
    expect(client.configuration.nodes[0]).toMatchObject({
      host: credsA.node,
      port: credsA.port,
      protocol: credsA.protocol,
    });
    expect(client.configuration.apiKey).toBe(credsA.apiKey);
  });
});
