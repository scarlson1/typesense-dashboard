import { Box, CircularProgress } from '@mui/material';

export const LoadingHits = () => {
  return (
    <Box
      sx={{
        height: 200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress size={20} />
    </Box>
  );
};
