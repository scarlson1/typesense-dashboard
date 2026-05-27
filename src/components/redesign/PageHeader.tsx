import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { designTokens } from '@/theme/themePrimitives';

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const PageHeader = ({
  title,
  eyebrow,
  badges,
  actions,
  tabs,
  activeTab,
  onTabChange,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3.5 },
        pt: { xs: 2, md: 2.75 },
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${designTokens.border}`,
      }}
    >
      {eyebrow ? (
        <Typography
          sx={{
            fontSize: 12,
            color: designTokens.textFaint,
            fontFamily: designTokens.fontMono,
            mb: 0.75,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Stack
        direction='row'
        sx={{
          alignItems: 'flex-start',
          gap: { xs: 1, sm: 1.75 },
          mb: 1.75,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component='h1'
            sx={{
              m: 0,
              fontSize: { xs: 18, md: 22 },
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: designTokens.text,
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              flexWrap: 'wrap',
            }}
          >
            <Box
              component='span'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {title}
            </Box>
            {badges ? (
              <Box
                component='span'
                sx={{ display: { xs: 'none', md: 'contents' } }}
              >
                {badges}
              </Box>
            ) : null}
          </Typography>
        </Box>
        {actions ? (
          <Stack
            direction='row'
            sx={{
              gap: 1,
              alignItems: 'center',
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </Stack>
        ) : null}
      </Stack>
      {tabs ? (
        <Stack
          direction='row'
          sx={{
            gap: 0.5,
            mt: 0.75,
            display: { xs: 'none', md: 'flex' },
          }}
        >
          {tabs.map((t) => {
            const active = t === activeTab;
            return (
              <Box
                key={t}
                onClick={() => onTabChange?.(t)}
                sx={{
                  px: 1.5,
                  py: 1,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? designTokens.text : designTokens.textMuted,
                  cursor: 'pointer',
                  borderBottom: active
                    ? `2px solid ${designTokens.accent}`
                    : '2px solid transparent',
                  mb: '-1px',
                  '&:hover': {
                    color: designTokens.text,
                  },
                }}
              >
                {t}
              </Box>
            );
          })}
        </Stack>
      ) : null}
    </Box>
  );
};
