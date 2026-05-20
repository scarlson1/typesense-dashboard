import {
  NotificationsOutlined,
  SearchRounded,
  ChevronRightRounded,
} from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import { designTokens } from '@/theme/themePrimitives';

interface Crumb {
  label: ReactNode;
  mono?: boolean;
}

interface TopBarProps {
  crumbs?: Crumb[];
  rightSlot?: ReactNode;
}

export const TopBar = ({ crumbs = [], rightSlot }: TopBarProps) => {
  return (
    <Stack
      direction='row'
      sx={{
        height: 48,
        borderBottom: `1px solid ${designTokens.border}`,
        alignItems: 'center',
        px: 2.75,
        gap: 1,
        background: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          gap: 0.75,
          flex: 1,
          fontSize: 13,
          color: designTokens.textMuted,
          minWidth: 0,
        }}
      >
        {crumbs.map((c, i) => (
          <Stack
            direction='row'
            sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}
            key={i}
          >
            {i > 0 && (
              <ChevronRightRounded
                sx={{ fontSize: 14, color: designTokens.textSubtle }}
              />
            )}
            <Typography
              component='span'
              noWrap
              sx={{
                color:
                  i === crumbs.length - 1
                    ? designTokens.text
                    : designTokens.textMuted,
                fontWeight: i === crumbs.length - 1 ? 500 : 400,
                fontFamily: c.mono ? designTokens.fontMono : undefined,
                fontSize: c.mono ? 12 : 13,
              }}
            >
              {c.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {rightSlot ?? (
        <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
          <Box
            component='button'
            sx={{
              height: 28,
              px: 1.125,
              borderRadius: 0.75,
              background: designTokens.surfaceMuted,
              border: `1px solid ${designTokens.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              color: designTokens.textFaint,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <SearchRounded sx={{ fontSize: 14 }} />
            <span>Search docs</span>
            <Box
              component='span'
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 10.5,
                px: 0.625,
                py: '1px',
                border: `1px solid ${designTokens.border}`,
                borderRadius: '3px',
                background: 'background.paper',
                color: designTokens.textMuted,
                ml: 1.5,
              }}
            >
              ⌘K
            </Box>
          </Box>
          <Box
            component='button'
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.75,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: designTokens.textFaint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <NotificationsOutlined sx={{ fontSize: 16 }} />
            <Box
              component='span'
              sx={{
                position: 'absolute',
                top: 6,
                right: 7,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: designTokens.danger,
                border: '1.5px solid',
                borderColor: 'background.paper',
              }}
            />
          </Box>
          <ThemeModeToggle />
        </Stack>
      )}
    </Stack>
  );
};
