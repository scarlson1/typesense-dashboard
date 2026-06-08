import { AuthForm } from '@/components/AuthForm';
import { Logo } from '@/components/Logo';
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import { authSchema } from '@/constants/authForm';
import { useAppForm, useAsyncToast } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import type { Environment } from '@/types';
import { getCredsKey, getTypesenseClient, typesenseStore } from '@/utils';
import {
  Check,
  DevicesRounded,
  GitHub,
  KeyRounded,
  LogoutRounded,
  OpenInNewRounded,
  PlayArrowRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { useCallback } from 'react';
import { z } from 'zod/v4';
import { useStore } from 'zustand';

const authSearchSchema = z.object({
  redirect: z.string().optional(),
  node: z.string().optional(),
  port: z.coerce.string().optional(),
  protocol: z.string().optional(),
  apiKey: z.string().optional(),
  env: z.string().optional(),
});

export const Route = createFileRoute('/auth')({
  component: AuthComponent,
  validateSearch: (search) => authSearchSchema.parse(search),
});

function AuthComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const toast = useAsyncToast();
  const setCredentials = useStore(
    typesenseStore,
    (state) => state.setCredentials,
  );

  const form = useAppForm({
    defaultValues: {
      node: search.node ?? '',
      port: search.port ?? '',
      protocol: search.protocol ?? '',
      apiKey: search.apiKey ?? '',
      env: search.env ?? 'development',
    },
    validators: { onChange: authSchema },
    onSubmit: async ({ value: { node, port, protocol, apiKey, env } }) => {
      const creds = {
        node: node.trim(),
        port: Number(port.trim()),
        protocol,
        apiKey: apiKey.trim(),
        env: env as Environment,
      };
      const client = getTypesenseClient(creds);
      toast.loading('authenticating...', { id: 'auth' });
      try {
        await client.collections().retrieve();
        setCredentials(creds);
        toast.dismiss();
        navigate({ to: search?.redirect || '/', replace: true });
      } catch (err) {
        console.error('AUTH ERROR: ', err);
        toast.error('Failed to connect', { id: 'auth' });
        await new Promise((resolve) => setTimeout(resolve, 200));
        toast.dismiss();
      }
    },
  });

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: designTokens.text,
        backgroundColor: 'background.default',
      }}
    >
      {/* Left: form */}
      <Stack
        sx={{
          flex: { xs: 1, md: '0 0 50%' },
          flexDirection: 'column',
          px: { xs: 3, sm: 5, md: 7 },
          py: { xs: 4, md: 5 },
          minWidth: 0,
        }}
      >
        <Stack direction='row' sx={{ alignItems: 'center', gap: 1.25, mb: 6 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.875,
              background: `linear-gradient(135deg, ${designTokens.accent}, hsl(212, 85%, 60%))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '-0.02em',
            }}
          >
            <Logo />
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              letterSpacing: '-0.015em',
              fontSize: 16,
              color: designTokens.text,
            }}
          >
            Typesense
          </Typography>
          <Box
            component='span'
            sx={{
              fontSize: 11.5,
              color: designTokens.textFaint,
              fontWeight: 500,
              px: 1,
              py: 0.25,
              borderRadius: '4px',
              background: designTokens.surfaceMuted,
              ml: 0.5,
            }}
          >
            Dashboard
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <ThemeModeToggle />
          </Box>
        </Stack>

        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            mx: { xs: 'auto', md: 0 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography
            component='h1'
            sx={{
              m: 0,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              color: designTokens.text,
            }}
          >
            Connect to your cluster
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: designTokens.textMuted,
              mt: 1.25,
              mb: 3.5,
              lineHeight: 1.55,
              maxWidth: 420,
            }}
          >
            Point this dashboard at any Typesense node — local, self-hosted, or
            Typesense Cloud. Credentials are stored in session storage only.
          </Typography>

          <Box
            component='form'
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}
          >
            <AuthForm form={form} title={null as unknown as string} />

            <Stack
              direction='row'
              sx={{
                alignItems: 'center',
                gap: 1.25,
                fontSize: 12,
                color: designTokens.textFaint,
                justifyContent: 'center',
                mt: 0.5,
              }}
            >
              <KeyRounded sx={{ fontSize: 12 }} />
              <span>Credentials stored in</span>
              <Box
                component='span'
                sx={{
                  fontFamily: designTokens.fontMono,
                  color: designTokens.textMuted,
                }}
              >
                sessionStorage
              </Box>
              <Box
                component='span'
                sx={{ display: { xs: 'none', lg: 'inline' } }}
              >
                · cleared on window close
              </Box>
            </Stack>
          </Box>

          <AuthenticatedAccounts />
        </Box>

        <Stack
          direction='row'
          sx={{
            fontSize: 12,
            color: designTokens.textFaint,
            pt: 4,
            borderTop: `1px solid ${designTokens.border}`,
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {/* <span>© 2026 Spencer</span>
          <span>·</span> */}
          <Link
            href='https://typesense.org/docs/'
            target='_blank'
            rel='noopener noreferrer'
            sx={{ color: 'inherit', textDecoration: 'none' }}
          >
            Documentation <OpenInNewRounded sx={{ fontSize: 'inherit' }} />
          </Link>
          <Typography
            variant='body2'
            sx={{ color: 'inherit', fontSize: 'inherit' }}
          >
            · Not associated with Typesense
          </Typography>
          {/* <Link
            href='https://typesense.org/'
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
            }}
          >
            Open in Cloud
            <OpenInNewRounded sx={{ fontSize: 'inherit' }} />
          </Link> */}
          <Box component='span' sx={{ flex: 1 }} />
          {import.meta.env.VITE_APP_VERSION ? (
            <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
              {import.meta.env.VITE_APP_VERSION}
            </Box>
          ) : null}
          <Box>
            <IconButton
              href='https://github.com/scarlson1/typesense-dashboard'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub Repo'
              size='small'
            >
              <GitHub fontSize='inherit' />
            </IconButton>
          </Box>
        </Stack>
      </Stack>

      {/* Right: hero panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          background: `linear-gradient(135deg, var(--ts-heroFrom) 0%, var(--ts-heroMid) 45%, var(--ts-heroTo) 100%)`,
          alignItems: 'center',
          px: { md: 6, lg: 9 },
          py: 8,
          overflow: 'hidden',
        }}
      >
        {/* ambient glow + grid overlays */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'radial-gradient(circle at 18% 22%, rgba(108,177,255,.18), transparent 42%), radial-gradient(circle at 85% 78%, rgba(29,77,140,.4), transparent 48%)',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.5,
            maskImage:
              'radial-gradient(circle at 28% 18%, #000 0%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(circle at 28% 18%, #000 0%, transparent 72%)',
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 1px 34px), repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 34px)',
          }}
        />

        <Stack
          spacing={3}
          sx={{ position: 'relative', maxWidth: 560, width: '100%' }}
        >
          {/* eyebrow */}
          <Stack direction='row' sx={{ alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 2,
                borderRadius: 1,
                background: '#4ba0f5',
                opacity: 0.85,
              }}
            />
            <Box
              component='span'
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7cb6ff',
              }}
            >
              Open source · Self-hosted
            </Box>
          </Stack>

          {/* headline */}
          <Typography
            component='h1'
            sx={{
              m: 0,
              fontWeight: 800,
              fontSize: { md: 40, lg: 52 },
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Manage your{' '}
            <Box
              component='span'
              sx={{
                background:
                  'linear-gradient(120deg, #8cc2ff, #4ba0f5 55%, #cfe1f7)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Typesense cluster
            </Box>{' '}
            without touching the terminal
          </Typography>

          {/* lead */}
          <Typography
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.68)',
              maxWidth: 480,
            }}
          >
            A fast, polished UI to manage self-hosted and local Typesense
            instances — search, schemas, geosearch, API keys and more. 100%
            client-side, no backend, your admin keys never leave the browser.
          </Typography>

          {/* CTAs */}
          <Stack direction='row' spacing={1.5} sx={{ mt: 0.5 }}>
            <Button
              variant='contained'
              href='https://scarlson1.github.io/typesense-dashboard/#/auth?node=163.192.220.255.nip.io&port=443&protocol=https&apiKey=q0DAf2GWCdw0LPCzM72UytDVh719h4Tk&env=development'
              target='_blank'
              rel='noopener'
              startIcon={<PlayArrowRounded />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                px: 2.5,
                py: 1.25,
                boxShadow: '0 10px 28px -10px rgba(75,160,245,.65)',
              }}
            >
              Try the live demo
            </Button>
            <Button
              variant='outlined'
              href='https://github.com/scarlson1/typesense-dashboard'
              target='_blank'
              rel='noopener'
              startIcon={<GitHub />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                px: 2.5,
                py: 1.25,
                color: '#fff',
                borderColor: 'rgba(255,255,255,.28)',
                background: 'rgba(255,255,255,.04)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,.5)',
                  background: 'rgba(255,255,255,.1)',
                },
              }}
            >
              View on GitHub
            </Button>
          </Stack>

          {/* meta checklist */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { md: '1fr', lg: '1fr 1fr' },
              columnGap: 3,
              rowGap: 1.25,
              mt: 1,
            }}
          >
            {[
              'Compatible with Typesense v29 & v30',
              'No telemetry, no accounts',
              'Deploy in one command',
            ].map((label) => (
              <Stack
                key={label}
                direction='row'
                sx={{ alignItems: 'center', gap: 1 }}
              >
                <Check sx={{ fontSize: 14, color: '#4ade80' }} />
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: 'rgba(255,255,255,0.72)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function AuthenticatedAccounts() {
  const navigate = Route.useNavigate();
  const location = useLocation();
  const search = Route.useSearch();
  const credentials = useStore(typesenseStore, (state) => state.credentials);
  const setCredsKey = useStore(typesenseStore, (state) => state.setCredsKey);

  const credEntries = Object.entries(credentials);

  const handleSelect = useCallback(
    (key: string) => {
      setCredsKey(key);
      navigate({ to: search?.redirect || '/', replace: true });
    },
    [navigate, setCredsKey, search?.redirect],
  );

  const handleLogout = useCallback(
    async (key: string) => {
      navigate({
        to: '/logout',
        search: { redirect: location.href, clusterId: key },
      });
    },
    [location, navigate],
  );

  if (!credEntries.length) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: designTokens.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 1,
        }}
      >
        Recent clusters
      </Typography>
      <List
        dense
        sx={{
          border: `1px solid ${designTokens.border}`,
          borderRadius: 1,
          p: 0,
          overflow: 'hidden',
          maxHeight: 220,
          overflowY: 'auto',
        }}
      >
        {credEntries.map(([key, creds], i) => (
          <ListItemButton
            LinkComponent='div'
            onClick={() => handleSelect(key)}
            key={key}
            sx={{
              borderTop: i === 0 ? 'none' : `1px solid ${designTokens.border}`,
              borderRadius: 0,
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <DevicesRounded sx={{ fontSize: '1rem' }} />
            </ListItemIcon>
            <ListItemText
              primary={creds.name ?? creds.env ?? key}
              secondary={creds?.env ? key : ''}
              slotProps={{
                primary: {
                  sx: { fontSize: 13, fontWeight: 500 },
                },
                secondary: {
                  sx: {
                    fontFamily: designTokens.fontMono,
                    fontSize: 11,
                    color: designTokens.textFaint,
                  },
                },
              }}
            />
            <IconButton
              aria-label='logout'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout(
                  getCredsKey({
                    protocol: creds.protocol,
                    node: creds.node,
                    port: creds.port,
                  }),
                );
              }}
              size='small'
            >
              <LogoutRounded fontSize='inherit' />
            </IconButton>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
