import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MapboxState {
  mapboxToken: string;
}

interface MapboxActions {
  setMapboxToken: (token: string) => void;
}

type MapboxStore = MapboxState & MapboxActions;

export const mapboxStore = create<MapboxStore>()(
  persist(
    (set) => ({
      mapboxToken: '',
      setMapboxToken: (token) => set(() => ({ mapboxToken: token.trim() })),
    }),
    {
      name: 'typesense-mapbox-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Resolves the Mapbox access token, preferring the user-supplied value stored
 * in the browser and falling back to a token baked in at build time
 * (VITE_MAPBOX_TOKEN). Published images/installers ship without a baked token,
 * so each operator supplies their own via the UI.
 */
export const getMapboxToken = (storedToken: string): string =>
  storedToken || import.meta.env.VITE_MAPBOX_TOKEN || '';
