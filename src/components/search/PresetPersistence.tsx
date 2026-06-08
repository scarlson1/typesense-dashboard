import { presetQueryKeys } from '@/constants';
import {
  useCollectionSearchPreset,
  usePreset,
  useTypesenseClient,
} from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export interface PresetPersistenceProps {
  collectionId: string;
}

/**
 * Headless effect-only component that persists the active search preset to
 * localStorage per collection. Kept separate from the (conditionally mounted)
 * Params UI so the preset is always synced regardless of which configure tab /
 * mobile drawer is open.
 */
export function PresetPersistence({ collectionId }: PresetPersistenceProps) {
  const [client, clusterId] = useTypesenseClient();
  const [preset, setPreset] = usePreset();
  const { getStoredPreset, setStoredPreset } = useCollectionSearchPreset(
    clusterId,
    collectionId,
  );

  const { data: presets } = useQuery({
    queryKey: presetQueryKeys.all(clusterId),
    queryFn: async () => {
      const { presets } = await client.presets().retrieve();
      return presets;
    },
  });

  // persist the active preset whenever it changes
  useEffect(() => {
    if (preset) setStoredPreset(preset);
  }, [preset, setStoredPreset]);

  // auto-default to the first preset when nothing is active or stored
  useEffect(() => {
    if (preset) return;
    if (!presets?.length) return;
    if (getStoredPreset()) return;
    setPreset(presets[0].name);
  }, [preset, presets, getStoredPreset, setPreset]);

  return null;
}
