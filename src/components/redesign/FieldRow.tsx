import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { designTokens } from '@/theme/themePrimitives';

export const FIELD_LABEL_COL_WIDTH = 184;

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
    '& input::placeholder': {
      color: designTokens.textFaint,
      opacity: 1,
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

interface FieldRowProps {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  align?: 'center' | 'flex-start';
}

export function FieldRow({
  label,
  description,
  children,
  align = 'flex-start',
}: FieldRowProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 3 }}
      sx={{ alignItems: { xs: 'stretch', sm: align } }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: FIELD_LABEL_COL_WIDTH },
          flexShrink: 0,
          pt: { xs: 0, sm: 0.875 },
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: designTokens.text,
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
        {description ? (
          <Typography
            sx={{
              fontSize: 12,
              color: designTokens.textMuted,
              lineHeight: 1.4,
              mt: 0.375,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}
