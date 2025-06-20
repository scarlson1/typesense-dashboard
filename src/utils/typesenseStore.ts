import { Client } from 'typesense';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Environment } from '../types';

export interface TypesenseCreds {
  name?: string;
  node: string;
  port: number;
  protocol: string;
  apiKey: string;
  env?: Environment | null; // ['development', 'production', 'staging', '']
}

// use map for credentials instead ??
// type State = { credentials: TypesenseCreds[]; client: any | null };
type State = {
  credentials: Record<string, TypesenseCreds>;
  currentCredsKey: string | null;
  // client: any | null
};

type Actions = {
  // setCredentials: (creds: State['credentials']) => void; // TypesenseClient
  setCredentials: (creds: TypesenseCreds) => void; // TypesenseClient
  setCredsKey: (key: string) => void;
};

type TypesenseStore = State & Actions;

export function getCredsKey({ node, port, protocol }: TypesenseCreds) {
  return `${protocol}:${node}:${port}`;
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
      // setCredentials: (creds) =>
      //   set((state) => ({
      //     ...state,
      //     credentials: [...state.creds, creds],
      //     // client: creds ? getTypesenseClient(creds) : null,
      //   })),
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

// in component:
// const client = useStore(typesenseStore, (state) => state.client)
// const setCredentials = useStore(typesenseStore, (state) => state.setCredentials)
