import { Client } from 'typesense';
import { create } from 'zustand';

interface TypesenseCreds {
  node: string;
  port: number;
  protocol: string;
  apiKey: string;
}

type State = { credentials: TypesenseCreds | null; client: any | null };

type Actions = {
  setCredentials: (creds: State['credentials']) => void; // TypesenseClient
  // client: () => any // TypesenseClient
};

type TypesenseStore = State & Actions;

export const typesenseStore = create<TypesenseStore>()((set) => ({
  credentials: null,
  client: null,
  setCredentials: (creds) =>
    set({
      credentials: creds,
      client: creds ? getTypesenseClient(creds) : null,
    }),
}));

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
