import { designTokens } from '@/theme/themePrimitives';
import { Box, Stack, Typography, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  delta?: ReactNode;
  deltaPositive?: boolean;
  children?: ReactNode;
  sx?: SxProps;
}

export const StatCard = ({
  label,
  value,
  unit,
  sub,
  delta,
  deltaPositive,
  children,
  sx = {},
}: StatCardProps) => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        px: 2,
        py: 1.75,
        boxShadow: 'none',
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontSize: 11.5,
          color: designTokens.textFaint,
          fontWeight: 600,
          mb: 0.75,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </Typography>
      <Stack
        direction='row'
        sx={{ alignItems: 'baseline', gap: 0.5, mb: 0.75 }}
      >
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 600,
            color: designTokens.text,
            fontFeatureSettings: '"tnum"',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        {unit ? (
          <Typography
            sx={{
              fontSize: 13,
              color: designTokens.textMuted,
              fontWeight: 500,
            }}
          >
            {unit}
          </Typography>
        ) : null}
      </Stack>
      {children}
      <Stack
        direction='row'
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'nowrap',
        }}
      >
        {sub ? (
          <Typography
            noWrap
            sx={{ fontSize: 11.5, color: designTokens.textMuted, minWidth: 0 }}
          >
            {sub}
          </Typography>
        ) : (
          <span />
        )}
        {delta ? (
          <Typography
            noWrap
            sx={{
              fontSize: 11.5,
              color: deltaPositive
                ? designTokens.successDeep
                : designTokens.textMuted,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {delta}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
};
