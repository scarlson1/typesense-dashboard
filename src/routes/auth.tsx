import { AuthForm, authFormOpts } from '@/components/AuthForm';
import { useAppForm, useAsyncToast } from '@/hooks';
import type { Environment } from '@/types';
import { getTypesenseClient, typesenseStore } from '@/utils';
import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Divider,
  Link,
  Card as MuiCard,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';
import { useStore } from 'zustand';

// https://github.com/bfritscher/typesense-dashboard/blob/1258005f0ba99790de943a5c3b17c1ae7e915987/src/stores/node.ts#L132

// fetch collections (will throw if there's a connection/auth issue)
// https://github.com/amartya-dev/typesense-dashboard/blob/54e78bd1056cfa63e2ca6e1252d69041dc06bacd/src/apps/auth/components/LoginForm.tsx#L24

export const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/auth')({
  component: AuthComponent,
  validateSearch: (search) => authSearchSchema.parse(search),
});

const AuthContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

function AuthComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const toast = useAsyncToast();
  const setCredentials = useStore(
    typesenseStore,
    (state) => state.setCredentials
  );

  const form = useAppForm({
    ...authFormOpts,
    onSubmit: async ({ value: { node, port, protocol, apiKey, env } }) => {
      let creds = {
        node,
        port: Number(port),
        protocol,
        apiKey,
        env: env as Environment,
      };
      const client = getTypesenseClient(creds);
      toast.loading('authenticating...', { id: 'auth' });
      try {
        await client.collections().retrieve();

        setCredentials(creds);
        // TODO: set credentials in context
        toast.success(`Authentication successful`, { id: 'auth' });
        navigate({ to: search?.redirect || '/', replace: true });
      } catch (err) {
        console.error(err);
        toast.error('Failed to connect', { id: 'auth' });
      }
    },
  });

  return (
    <AuthContainer>
      <Card>
        <Box
          component='form'
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <AuthForm form={form} title={'Login'} />
        </Box>
        <Divider />
        <Stack direction='row' spacing={1}>
          <Typography component='div' sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?
          </Typography>
          <Link
            href='https://typesense.org/'
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              display: 'flex',
              alignContent: 'center',
              justifyContent: 'center',
            }}
          >
            Typesense <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
          </Link>
        </Stack>
      </Card>
    </AuthContainer>
  );
}
