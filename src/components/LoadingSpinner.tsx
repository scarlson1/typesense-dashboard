import {
  Box,
  type BoxProps,
  CircularProgress,
  type CircularProgressProps,
} from '@mui/material';

interface LoadingSpinnerProps extends CircularProgressProps {
  containerSx?: BoxProps;
}

export const LoadingSpinner = ({
  containerSx,
  ...rest
}: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        ...(containerSx || {}),
      }}
    >
      <CircularProgress size={18} {...rest} />
    </Box>
  );
};
