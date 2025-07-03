import { Box, Typography } from '@mui/material';
import type { ComponentType } from 'react';
import { useHits } from '../../hooks';
import { Hit, type HitProps } from './Hit';

interface HitsProps {
  HitComponent?: ComponentType<HitProps>;
}

export function Hits({ HitComponent = Hit }: HitsProps) {
  const hits = useHits();

  if (!hits?.hits) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}
      >
        <Typography>Enter a search above</Typography>
      </Box>
    );
  }

  if (!hits?.hits.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}
      >
        <Typography>{`No results for "${hits?.request_params?.q}"`}</Typography>
      </Box>
      // <Typography sx={{ textAlign: 'center', py: 2 }}>No results</Typography>
    );
  }
  return (
    <>
      {hits.hits.map((hit, i) => (
        <HitComponent hit={hit} key={`hit-${i}`} />
      ))}
    </>
  );
}
