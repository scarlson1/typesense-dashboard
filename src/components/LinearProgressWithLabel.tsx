import {
  Box,
  Chip,
  LinearProgress,
  Typography,
  type LinearProgressProps,
} from '@mui/material';

export function LinearProgressWithLabel({
  label,
  labelTotal,
  value,
  ...props
}: LinearProgressProps & { value: number; label: string; labelTotal: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <Box sx={{ width: '100%', mr: 1, position: 'relative' }}>
          <LinearProgress
            variant='determinate'
            value={value}
            {...props}
            sx={{ height: 24, borderRadius: 1 }}
          />
          {/* TODO: fix label position */}
          <Chip
            label={label}
            variant='filled'
            size='small'
            color='secondary'
            sx={{
              position: 'absolute',
              left: `${isNaN(value) ? 50 : value}%`,
              top: '50%',
              transform: `translate(-50%, -50%)`,
            }}
          />
        </Box>
      </Box>
      <Box sx={{ minWidth: 72 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {labelTotal}
        </Typography>
      </Box>
    </Box>
  );
}
