import { Box, CircularProgress, Typography } from '@mui/material';

export function CircularProgressWithLabel({ val }: { val: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Box sx={{ position: 'relative', display: 'grid' }}>
        <CircularProgress
          variant='determinate'
          value={Number(val)}
          sx={{
            zIndex: 2,
            gridColumn: 1,
            gridRow: 1,
          }}
        />
        <CircularProgress
          variant='determinate'
          value={100}
          color='secondary'
          sx={{
            opacity: 0.25,
            gridColumn: 1,
            gridRow: 1,
            zIndex: 1,
          }}
        />
      </Box>
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant='caption'
          component='div'
          sx={{ color: 'text.secondary' }}
        >{`${Number(val)}%`}</Typography>
      </Box>
    </Box>
  );
}
