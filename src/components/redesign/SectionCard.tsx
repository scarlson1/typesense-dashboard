import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { designTokens } from '@/theme/themePrimitives';

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  noBodyPadding?: boolean;
}

export const SectionCard = ({
  title,
  description,
  actions,
  footer,
  children,
  noBodyPadding,
}: SectionCardProps) => {
  return (
    <Box
      sx={{
        background: 'background.paper',
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {(title || actions) && (
        <Stack
          direction='row'
          sx={{
            px: 2.25,
            py: 1.75,
            borderBottom: `1px solid ${designTokens.border}`,
            gap: 1.5,
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title ? (
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: designTokens.text,
                  letterSpacing: '-0.005em',
                }}
              >
                {title}
              </Typography>
            ) : null}
            {description ? (
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: designTokens.textMuted,
                  mt: 0.5,
                  lineHeight: 1.5,
                  maxWidth: 720,
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
          {actions ? (
            <Stack
              direction='row'
              sx={{ gap: 1, alignItems: 'center', flexShrink: 0 }}
            >
              {actions}
            </Stack>
          ) : null}
        </Stack>
      )}
      <Box
        sx={
          noBodyPadding
            ? {}
            : {
                px: 2.75,
                py: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
              }
        }
      >
        {children}
      </Box>
      {footer ? (
        <Box
          sx={{
            px: 2.75,
            py: 1.5,
            borderTop: `1px solid ${designTokens.border}`,
            background: designTokens.surfaceTinted,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  );
};
