import { designTokens } from '@/theme/themePrimitives';
import {
  CompareArrowsRounded,
  DatasetRounded,
  HomeRounded,
  KeyRounded,
  MoreHorizRounded,
} from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import {
  createLink,
  useMatchRoute,
  type LinkComponent,
} from '@tanstack/react-router';
import { forwardRef, useState, type ReactNode } from 'react';
import { MobileMoreSheet } from './MobileMoreSheet';

export const MOBILE_BOTTOM_NAV_HEIGHT = 60;

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  React.HTMLProps<HTMLAnchorElement>
>(function RouterAnchor(props, ref) {
  return <a ref={ref} {...props} />;
});
const CreatedLink = createLink(RouterAnchor);
const NavLink: LinkComponent<typeof RouterAnchor> = (props) => (
  <CreatedLink preload='intent' {...props} />
);

interface BottomNavItemProps {
  icon: ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  exact?: boolean;
  onClick?: () => void;
}

const BottomNavItem = ({
  icon,
  label,
  to,
  active,
  exact,
  onClick,
}: BottomNavItemProps) => {
  const matchRoute = useMatchRoute();
  const matched = to
    ? Boolean(
        matchRoute({
          to: to as never,
          fuzzy: !exact,
        }),
      )
    : false;
  const isActive = active ?? matched;

  const content = (
    <Stack
      sx={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.375,
        py: 0.75,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 28,
          borderRadius: '14px',
          background: isActive ? designTokens.accentSoft : 'transparent',
          color: isActive ? designTokens.accent : designTokens.textMuted,
          transition: 'background 150ms, color 150ms',
          '& svg': { fontSize: 22 },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: isActive ? 600 : 500,
          lineHeight: 1,
          letterSpacing: '-0.005em',
          color: isActive ? designTokens.accent : designTokens.textMuted,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );

  if (!to) {
    return (
      <Box
        component='button'
        onClick={onClick}
        sx={{
          flex: 1,
          background: 'transparent',
          border: 0,
          p: 0,
          display: 'flex',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <NavLink
      {...({ to } as unknown as React.ComponentProps<typeof NavLink>)}
      style={{
        flex: 1,
        display: 'flex',
        textDecoration: 'none',
      }}
    >
      {content}
    </NavLink>
  );
};

export function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <Box
        component='nav'
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar + 1,
          height: MOBILE_BOTTOM_NAV_HEIGHT,
          backgroundColor: 'background.paper',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
          pb: 'env(safe-area-inset-bottom)',
          alignItems: 'stretch',
        }}
      >
        <BottomNavItem
          to='/'
          exact
          label='Home'
          icon={<HomeRounded />}
        />
        <BottomNavItem
          to='/collections'
          label='Collections'
          icon={<DatasetRounded />}
        />
        <BottomNavItem
          to='/alias'
          label='Aliases'
          icon={<CompareArrowsRounded />}
        />
        <BottomNavItem
          to='/keys'
          label='API keys'
          icon={<KeyRounded />}
        />
        <BottomNavItem
          label='More'
          icon={<MoreHorizRounded />}
          active={moreOpen}
          onClick={() => setMoreOpen(true)}
        />
      </Box>
      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
