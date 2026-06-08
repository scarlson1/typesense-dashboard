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

// Compact monospace field used by the redesign forms (analytics, curation,
// synonyms, stopwords). Previously copy-pasted into each form file.
export const compactMonoInputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: designTokens.surface,
    fontSize: 12.5,
    fontFamily: designTokens.fontMono,
    minHeight: 32,
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
      fontSize: 12.5,
      fontFamily: designTokens.fontMono,
      padding: '6px 10px !important',
    },
    '& input::placeholder': { color: designTokens.textMuted, opacity: 1 },
  },
};

// Uppercase section label used above redesign form fields.
export const sectionLabelSx: SxProps<Theme> = {
  fontSize: 10,
  fontWeight: 700,
  color: designTokens.textFaint,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  mb: 0.5,
  mt: 1,
};

// Hairline border for popover/autocomplete Paper surfaces.
export const dividerPaperSx: SxProps<Theme> = {
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
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
