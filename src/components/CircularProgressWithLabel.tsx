import {
  Box,
  CircularProgress,
  Typography,
  type CircularProgressProps,
} from '@mui/material';

export interface CircularProgressWithLabelProps extends CircularProgressProps {}
// {
// val: number;
// }

export function CircularProgressWithLabel({
  value,
  ...props
}: CircularProgressWithLabelProps) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Box sx={{ position: 'relative', display: 'grid' }}>
        <CircularProgress
          variant='determinate'
          value={value}
          sx={{
            zIndex: 2,
            gridColumn: 1,
            gridRow: 1,
          }}
          {...props}
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
          {...props}
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
        >{`${value}%`}</Typography>
      </Box>
    </Box>
  );
}
