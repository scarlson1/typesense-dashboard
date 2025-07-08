import type { Environment, OptionalProperty } from '@/types';
import { Client } from 'typesense';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface TypesenseCreds {
  name?: string;
  node: string;
  port: number;
  protocol: string;
  apiKey: string;
  env?: Environment | null; // ['development', 'production', 'staging', '']
}

type State = {
  credentials: Record<string, TypesenseCreds>;
  currentCredsKey: string | null;
};

type Actions = {
  // setCredentials: (creds: State['credentials']) => void; // TypesenseClient
  setCredentials: (creds: TypesenseCreds) => void; // TypesenseClient
  setCredsKey: (key: string) => void;
  logout: (key?: string) => void;
};

type TypesenseStore = State & Actions;

export function getCredsKey({
  node,
  port,
  protocol,
}: OptionalProperty<TypesenseCreds, 'apiKey'>) {
  return `${protocol}://${node}:${port}`;
}

export const typesenseStore = create<TypesenseStore>()(
  persist(
    (set) => ({
      credentials: {}, // new Map(),
      currentCredsKey: null,
      setCredsKey: (key: string) => set(() => ({ currentCredsKey: key })),
      setCredentials: (creds) => {
        set((state) => ({
          ...state,
          currentCredsKey: getCredsKey(creds),
          credentials: {
            ...state.credentials,
            [getCredsKey(creds)]: creds,
          }, // state.credentials.set(getCredsKey(creds), creds),
        }));
      },
      logout: (cluster?: string) =>
        set((state) => {
          let creds = {};
          if (cluster) {
            let { [cluster]: _, ...rest } = state.credentials;
            creds = rest;
          }
          return {
            credentials: creds,
            currentCredsKey:
              state.currentCredsKey === cluster ? null : state.currentCredsKey,
          };
        }),
    }),
    {
      name: 'typesense-store',
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export function getTypesenseClient(creds: TypesenseCreds) {
  return new Client({
    nodes: [
      {
        host: creds.node,
        port: creds.port,
        protocol: creds.protocol,
      },
    ],
    apiKey: creds.apiKey,
  });
}
