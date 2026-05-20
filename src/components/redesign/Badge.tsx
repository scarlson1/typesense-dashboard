import { Box, type BoxProps } from '@mui/material';
import type { ReactNode } from 'react';
import { designTokens } from '@/theme/themePrimitives';

export type BadgeTone =
  | 'neutral'
  | 'indigo'
  | 'success'
  | 'warn'
  | 'danger';

interface BadgeProps extends Omit<BoxProps, 'children'> {
  tone?: BadgeTone;
  children: ReactNode;
  size?: number;
}

const toneStyles: Record<
  BadgeTone,
  { bg: string; fg: string; br: string }
> = {
  neutral: {
    bg: designTokens.surfaceMuted,
    fg: designTokens.textMuted,
    br: designTokens.border,
  },
  indigo: {
    bg: designTokens.accentSoft,
    fg: designTokens.accentDeep,
    br: designTokens.accentBorder,
  },
  success: {
    bg: designTokens.successSoft,
    fg: designTokens.successDeep,
    br: designTokens.successBorder,
  },
  warn: {
    bg: designTokens.warningSoft,
    fg: designTokens.warningDeep,
    br: designTokens.warningBorder,
  },
  danger: {
    bg: designTokens.dangerSoft,
    fg: designTokens.danger,
    br: designTokens.danger,
  },
};

export const Badge = ({
  tone = 'neutral',
  children,
  size = 11,
  sx,
  ...rest
}: BadgeProps) => {
  const t = toneStyles[tone];
  return (
    <Box
      component='span'
      {...rest}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.625,
          px: '7px',
          py: '2px',
          borderRadius: '12px',
          fontSize: `${size}px`,
          fontWeight: 500,
          lineHeight: 1.4,
          background: t.bg,
          color: t.fg,
          border: `1px solid ${t.br}`,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};
