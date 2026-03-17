import { useCallback } from 'react';

const storageKey = (clusterId: string, collectionId: string) =>
  `ts-preset:${clusterId}:${collectionId}`;

const displayKey = (clusterId: string, collectionId: string) =>
  `ts-display:${clusterId}:${collectionId}`;

export interface StoredDisplayOptions {
  displayFields?: string[];
  imgField?: string;
  backgroundSize?: string;
  columns?: number; // stored as the column count (1-4), not the grid size
}

export function useCollectionSearchPreset(
  clusterId: string,
  collectionId: string,
) {
  const getStoredPreset = useCallback((): string | null => {
    try {
      return localStorage.getItem(storageKey(clusterId, collectionId));
    } catch {
      return null;
    }
  }, [clusterId, collectionId]);

  const setStoredPreset = useCallback(
    (presetName: string | null) => {
      try {
        if (presetName) {
          localStorage.setItem(storageKey(clusterId, collectionId), presetName);
        } else {
          localStorage.removeItem(storageKey(clusterId, collectionId));
        }
      } catch {
        // ignore
      }
    },
    [clusterId, collectionId],
  );

  const getStoredDisplayOptions =
    useCallback((): StoredDisplayOptions | null => {
      try {
        const raw = localStorage.getItem(displayKey(clusterId, collectionId));
        return raw ? (JSON.parse(raw) as StoredDisplayOptions) : null;
      } catch {
        return null;
      }
    }, [clusterId, collectionId]);

  const setStoredDisplayOptions = useCallback(
    (options: StoredDisplayOptions | null) => {
      try {
        if (options) {
          localStorage.setItem(
            displayKey(clusterId, collectionId),
            JSON.stringify(options),
          );
        } else {
          localStorage.removeItem(displayKey(clusterId, collectionId));
        }
      } catch {
        console.log('error storing display pref');
      }
    },
    [clusterId, collectionId],
  );

  return {
    getStoredPreset,
    setStoredPreset,
    getStoredDisplayOptions,
    setStoredDisplayOptions,
  };
}
