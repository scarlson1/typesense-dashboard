import type { SxProps, Theme } from '@mui/material';
import { designTokens } from '@/theme/themePrimitives';

export const smallButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 13,
  height: 32,
  borderRadius: '6px',
  borderColor: designTokens.border,
  color: designTokens.text,
  backgroundColor: 'background.paper',
  boxShadow: designTokens.shadowButton,
  '&:hover': {
    borderColor: designTokens.borderStrong,
    background: designTokens.surfaceMuted,
  },
};

export const primaryButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 13,
  height: 32,
  borderRadius: '6px',
  background: designTokens.accent,
  boxShadow: designTokens.shadowButtonPrimary,
  '&:hover': { background: designTokens.accentHover },
};

export const ghostButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 13,
  height: 32,
  borderRadius: '6px',
  color: designTokens.textMuted,
  '&:hover': {
    color: designTokens.text,
    background: designTokens.surfaceMuted,
  },
};

export const dangerButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 13,
  height: 32,
  borderRadius: '6px',
  backgroundColor: 'background.paper',
  border: `1px solid color-mix(in srgb, ${designTokens.danger} 40%, transparent)`,
  color: designTokens.danger,
  '&:hover': {
    background: designTokens.dangerSoft,
    border: `1px solid ${designTokens.danger}`,
  },
};
