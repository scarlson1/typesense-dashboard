import { designTokens } from '@/theme/themePrimitives';
import { type SxProps, type Theme } from '@mui/material';

export const fieldInputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: designTokens.surface,
    fontSize: 13,
    minHeight: 36,
    py: '3px',
    px: '8px',
    borderRadius: '6px',
    '& fieldset': {
      borderColor: designTokens.border,
      transition: 'border-color 120ms ease',
    },
    '&:hover fieldset': { borderColor: designTokens.borderStrong },
    '&.Mui-focused fieldset': {
      borderColor: designTokens.accent,
      borderWidth: 1,
    },
    '& input': {
      fontSize: 13,
      padding: '4px 4px !important',
      fontFamily: designTokens.fontMono,
    },
  },
};

export const fieldChipSx: SxProps<Theme> = {
  height: 22,
  fontSize: 12,
  fontFamily: designTokens.fontMono,
  background: designTokens.surfaceMuted,
  border: `1px solid ${designTokens.border}`,
  borderRadius: '4px',
  color: designTokens.text,
  '& .MuiChip-deleteIcon': {
    fontSize: 14,
    color: designTokens.textFaint,
    '&:hover': { color: designTokens.text },
  },
};
