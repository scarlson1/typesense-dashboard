import { fieldLabelSx } from '@/constants/redesignSx';
import { designTokens } from '@/theme/themePrimitives';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  helperText?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

export const FormField = ({
  label,
  hint,
  helperText,
  required,
  htmlFor,
  children,
}: FormFieldProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
    {label ? (
      <Typography
        component='label'
        htmlFor={htmlFor}
        sx={{ ...fieldLabelSx, lineHeight: 1.2 }}
      >
        {label}
        {hint ? (
          <Box
            component='span'
            sx={{ color: designTokens.textFaint, fontWeight: 500, ml: 0.5 }}
          >
            · {hint}
          </Box>
        ) : null}
        {required ? (
          <Box
            component='span'
            sx={{ color: designTokens.danger, ml: 0.375 }}
            aria-hidden
          >
            *
          </Box>
        ) : null}
      </Typography>
    ) : null}
    {children}
    {helperText ? (
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textMuted,
          lineHeight: 1.4,
        }}
      >
        {helperText}
      </Typography>
    ) : null}
  </Box>
);
