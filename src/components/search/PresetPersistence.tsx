import { presetQueryKeys } from '@/constants';
import {
  useCollectionSearchPreset,
  usePreset,
  useTypesenseClient,
} from '@/hooks';
import { presetAppliesToCollection } from '@/utils';
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

  // Drop the active preset if it no longer exists (deleted) or pins a different
  // collection than the one being searched. Clearing the stored key (rather
  // than writing the '' cleared sentinel) lets the auto-default below reselect
  // a compatible preset, so a leaked preset self-heals on the next render.
  useEffect(() => {
    if (!preset) return;
    if (presets === undefined) return; // not loaded yet
    const active = presets.find((p) => p.name === preset);
    if (!active || !presetAppliesToCollection(active.value, collectionId)) {
      setPreset(null);
      setStoredPreset(null);
    }
  }, [preset, presets, collectionId, setPreset, setStoredPreset]);

  // persist the active preset whenever it changes
  useEffect(() => {
    if (preset) setStoredPreset(preset);
  }, [preset, setStoredPreset]);

  // auto-default to the first applicable preset when nothing is active or
  // stored. '' (explicitly cleared) suppresses the default; only an absent key
  // (null, never chosen) auto-selects.
  useEffect(() => {
    if (preset) return;
    if (!presets?.length) return;
    if (getStoredPreset() !== null) return;
    const firstApplicable = presets.find((p) =>
      presetAppliesToCollection(p.value, collectionId),
    );
    if (firstApplicable) setPreset(firstApplicable.name);
  }, [preset, presets, collectionId, getStoredPreset, setPreset]);

  return null;
}
