import { ClusterSelect } from '@/components/ClusterSelect';
import { useTypesenseVersion } from '@/hooks/useTypesenseVersion';
import { designTokens } from '@/theme/themePrimitives';
import {
  AutoAwesomeRounded,
  AutoFixHighRounded,
  ChatBubbleOutlineRounded,
  CloseRounded,
  DarkModeRounded,
  FrontHandRounded,
  GitHub,
  InsightsRounded,
  LaptopRounded,
  LightModeRounded,
  LogoutRounded,
  OpenInNewRounded,
  PersonAddRounded,
  SettingsInputSvideoRounded,
  SpellcheckRounded,
  StarBorderRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useColorScheme,
} from '@mui/material';
import {
  createLink,
  useLocation,
  useNavigate,
  type LinkComponent,
} from '@tanstack/react-router';
import { forwardRef, useEffect, useRef, type ReactNode } from 'react';

interface MobileMoreSheetProps {
  open: boolean;
  onClose: () => void;
}

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

interface SheetItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  to?: string;
  href?: string;
  trailing?: ReactNode;
  onClick?: () => void;
}

const SheetItem = ({
  icon,
  label,
  description,
  to,
  href,
  trailing,
  onClick,
}: SheetItemProps) => {
  const inner = (
    <Stack
      direction='row'
      sx={{
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        cursor: 'pointer',
        '&:hover': { background: designTokens.surfaceMuted },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: designTokens.textMuted,
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: designTokens.text,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
        {description ? (
          <Typography
            sx={{
              fontSize: 12,
              color: designTokens.textFaint,
              fontFamily: designTokens.fontMono,
              mt: 0.25,
              lineHeight: 1.2,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      {trailing}
    </Stack>
  );

  if (href) {
    return (
      <Box
        component='a'
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {inner}
      </Box>
    );
  }
  if (to) {
    return (
      <NavLink
        {...({ to } as unknown as React.ComponentProps<typeof NavLink>)}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {inner}
      </NavLink>
    );
  }
  return inner;
};

const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme();
  if (!mode) return null;

  return (
    <Box sx={{ px: 2, pb: 1.5 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: designTokens.textFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          mb: 1,
        }}
      >
        Theme
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        fullWidth
        onChange={(_, next) => {
          if (next) setMode(next);
        }}
        sx={{
          background: designTokens.surfaceMuted,
          borderRadius: '8px',
          p: 0.5,
          gap: 0.5,
          '& .MuiToggleButton-root': {
            border: 0,
            textTransform: 'none',
            color: designTokens.textMuted,
            fontSize: 13,
            fontWeight: 500,
            py: 0.875,
            gap: 0.75,
            borderRadius: '6px !important',
            '&.Mui-selected': {
              backgroundColor: 'background.paper',
              color: designTokens.text,
              fontWeight: 600,
              boxShadow: designTokens.shadowSheet,
            },
            '&:hover': { backgroundColor: 'transparent' },
            '&.Mui-selected:hover': { backgroundColor: 'background.paper' },
          },
        }}
      >
        <ToggleButton value='light'>
          <LightModeRounded sx={{ fontSize: 16 }} /> Light
        </ToggleButton>
        <ToggleButton value='dark'>
          <DarkModeRounded sx={{ fontSize: 16 }} /> Dark
        </ToggleButton>
        <ToggleButton value='system'>
          <LaptopRounded sx={{ fontSize: 16 }} /> System
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export function MobileMoreSheet({ open, onClose }: MobileMoreSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { is30Plus } = useTypesenseVersion();

  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      if (open) onClose();
    }
  }, [location.pathname, open, onClose]);

  const handleLogout = () => {
    onClose();
    navigate({ to: '/logout', search: { redirect: location.href } });
  };

  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90vh',
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
          },
        },
      }}
    >
      {/* Grab handle */}
      <Box
        sx={{
          width: 36,
          height: 4,
          borderRadius: 2,
          background: designTokens.border,
          mx: 'auto',
          mt: 1,
        }}
      />
      {/* Account switcher row */}
      <Stack
        direction='row'
        sx={{ alignItems: 'center', gap: 1, px: 2, py: 1.5 }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            '& .MuiInputBase-root': {
              width: '100% !important',
              background: designTokens.surfaceMuted,
              borderRadius: '10px',
            },
          }}
        >
          <ClusterSelect />
        </Box>
        <IconButton onClick={onClose} size='small'>
          <CloseRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <Divider sx={{ borderColor: designTokens.border }} />

      {/* Navigation items */}
      <Box sx={{ py: 0.5 }}>
        {/* <SheetItem
          icon={<ChatBubbleOutlineRounded />}
          label='Conversational search'
          to='/conversational-search'
        /> */}
        <SheetItem
          icon={<AutoAwesomeRounded />}
          label='NL models'
          to='/nl-models'
        />
        <SheetItem
          icon={<ChatBubbleOutlineRounded />}
          label='Conversation models'
          to='/conversation-models'
        />
        <SheetItem
          icon={<InsightsRounded />}
          label='Analytics rules'
          to='/analytics'
        />
        <SheetItem icon={<StarBorderRounded />} label='Presets' to='/presets' />
        <SheetItem
          icon={<FrontHandRounded />}
          label='Stopwords'
          to='/stopwords'
        />
        <SheetItem
          icon={<SpellcheckRounded />}
          label='Stemming'
          to='/stemming'
        />
        {is30Plus ? (
          <SheetItem
            icon={<AutoFixHighRounded />}
            label='Curation'
            to='/curation'
          />
        ) : null}
        {is30Plus ? (
          <SheetItem
            icon={<FrontHandRounded />}
            label='Synonyms'
            to='/synonyms'
          />
        ) : null}
        <SheetItem
          icon={<SettingsInputSvideoRounded />}
          label='Cluster config'
          to='/server'
        />

        <SheetItem
          icon={<PersonAddRounded />}
          label='Sign into another cluster'
          to='/auth'
        />
      </Box>

      <Divider sx={{ borderColor: designTokens.border }} />

      <ThemeToggle />

      <Divider sx={{ borderColor: designTokens.border }} />

      <SheetItem
        icon={<GitHub />}
        label='Open on GitHub'
        description='typesense/typesense-dashboard'
        href='https://github.com/scarlson1/typesense-dashboard'
        trailing={
          <OpenInNewRounded
            sx={{ fontSize: 14, color: designTokens.textFaint }}
          />
        }
      />

      <Box
        sx={{ p: 2, pt: 1.5, pb: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <Button
          fullWidth
          variant='outlined'
          color='error'
          startIcon={<LogoutRounded />}
          onClick={handleLogout}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.06em',
            borderColor: designTokens.dangerSoft,
            py: 1.25,
          }}
        >
          LOGOUT
        </Button>
      </Box>
    </Drawer>
  );
}
