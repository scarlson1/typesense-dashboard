import { designTokens } from '@/theme/themePrimitives';
import {
  CompareArrowsRounded,
  DatasetRounded,
  HomeRounded,
  KeyRounded,
  MoreHorizRounded,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import {
  createLink,
  useMatchRoute,
  type LinkComponent,
} from '@tanstack/react-router';
import { forwardRef, useState, type ReactNode } from 'react';
import { MobileMoreSheet } from './MobileMoreSheet';

// nav height (58) + bottom inset (14) + safe clearance (12) — used by
// consumers as the base for bottom padding (env(safe-area-inset-bottom) added separately)
export const MOBILE_BOTTOM_NAV_HEIGHT = 84;

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
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        mx: '2px',
        my: '5px',
        borderRadius: 999,
        background: isActive ? designTokens.accentSoft : 'transparent',
        color: isActive ? designTokens.accent : designTokens.textFaint,
        transition: 'background 150ms, color 150ms',
        cursor: 'pointer',
        userSelect: 'none',
        '& svg': { fontSize: 18 },
      }}
    >
      {icon}
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: isActive ? 600 : 500,
          lineHeight: 1,
          letterSpacing: '-0.005em',
          color: 'inherit',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  if (!to) {
    return (
      <Box
        component='button'
        onClick={onClick}
        sx={{ flex: 1, background: 'transparent', border: 0, p: 0, display: 'flex' }}
      >
        {content}
      </Box>
    );
  }

  return (
    <NavLink
      {...({ to } as unknown as React.ComponentProps<typeof NavLink>)}
      style={{ flex: 1, display: 'flex', textDecoration: 'none' }}
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
          left: '14px',
          right: '14px',
          bottom: 'calc(14px + env(safe-area-inset-bottom, 12px))',
          zIndex: (theme) => theme.zIndex.appBar + 1,
          height: 58,
          backgroundColor: 'background.paper',
          border: `1px solid ${designTokens.border}`,
          borderRadius: '999px',
          boxShadow: designTokens.shadowNav,
          px: '4px',
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
