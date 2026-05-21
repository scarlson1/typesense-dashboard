import { AuthForm } from '@/components/AuthForm';
import { authSchema } from '@/constants/authForm';
import { useAppForm, useAsyncToast } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import type { Environment } from '@/types';
import { getCredsKey, getTypesenseClient, typesenseStore } from '@/utils';
import {
  ArrowForwardRounded,
  DevicesRounded,
  KeyRounded,
  LogoutRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Box,
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

export const authSearchSchema = z.object({
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
      env: search.env ?? '',
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
            T
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
        </Stack>

        <Box
          sx={{
            maxWidth: 420,
            width: '100%',
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
              <span>· cleared on window close</span>
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
          {/* <span>© 2026 Typesense Dashboard</span>
          <span>·</span> */}
          <Link
            href='https://typesense.org/docs/'
            target='_blank'
            rel='noopener noreferrer'
            sx={{ color: 'inherit', textDecoration: 'none' }}
          >
            Documentation
          </Link>
          <Link
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
          </Link>
          <Box component='span' sx={{ flex: 1 }} />
          <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
            v{import.meta.env.VITE_APP_VERSION}
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
          justifyContent: 'center',
          p: 5,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,.12), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.08), transparent 40%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.18,
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,.06) 0 1px, transparent 1px 28px), repeating-linear-gradient(-45deg, rgba(255,255,255,.06) 0 1px, transparent 1px 28px)',
          }}
        />

        <Box sx={{ position: 'relative', maxWidth: 420, color: 'white' }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              opacity: 0.7,
              mb: 1.25,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            What's new
          </Typography>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              mb: 1.75,
            }}
          >
            Geosearch on map view now supports radius & polygon filters.
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              opacity: 0.8,
              lineHeight: 1.6,
              mb: 3.5,
            }}
          >
            Draw a radius around any point or sketch a polygon over a region —
            the dashboard generates the matching filter_by query for you.
            Available on Typesense v29+.
          </Typography>

          <Box
            sx={{
              background: 'rgba(0,0,0,.35)',
              borderRadius: 1.25,
              p: 2,
              border: '1px solid rgba(255,255,255,.1)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Stack
              direction='row'
              sx={{ alignItems: 'center', gap: 0.75, mb: 1.25 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: '#ed5f74',
                }}
              />
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: '#ffce06',
                }}
              />
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: '#00d924',
                }}
              />
              <Typography
                sx={{
                  fontFamily: designTokens.fontMono,
                  fontSize: 11,
                  color: 'rgba(255,255,255,.5)',
                  ml: 1,
                }}
              >
                typesense.sh
              </Typography>
            </Stack>
            <Box
              component='pre'
              sx={{
                m: 0,
                fontFamily: designTokens.fontMono,
                fontSize: 11.5,
                color: '#e1e7ed',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {`$ curl -H "X-TYPESENSE-API-KEY: $KEY" \\
    "https://typesense.example.com/health"
{`}
              <Box component='span' sx={{ color: '#a0eebf' }}>
                "ok"
              </Box>
              {': '}
              <Box component='span' sx={{ color: '#9bc5ff' }}>
                true
              </Box>
              {', '}
              <Box component='span' sx={{ color: '#a0eebf' }}>
                "version"
              </Box>
              {': '}
              <Box component='span' sx={{ color: '#9bc5ff' }}>
                "29.0"
              </Box>
              {'}'}
            </Box>
          </Box>

          <Stack
            direction='row'
            sx={{
              alignItems: 'center',
              gap: 1.25,
              mt: 3,
              fontSize: 13,
              opacity: 0.85,
            }}
          >
            <ArrowForwardRounded sx={{ fontSize: 14 }} />
            Read the v29 changelog →
          </Stack>
        </Box>
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
