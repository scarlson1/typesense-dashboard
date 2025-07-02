import { Typography } from '@mui/material';
import type { ComponentType } from 'react';
import { useHits } from '../../hooks';
import { Hit, type HitProps } from './Hit';

interface HitsProps {
  HitComponent?: ComponentType<HitProps>;
}

export function Hits({ HitComponent = Hit }: HitsProps) {
  const hits = useHits();

  if (!hits?.hits) return null;

  if (!hits?.hits.length)
    return (
      <Typography sx={{ textAlign: 'center', py: 2 }}>No results</Typography>
    );

  return (
    <>
      {hits.hits.map((hit, i) => (
        <HitComponent hit={hit} key={`hit-${i}`} />
      ))}
    </>
  );
}
