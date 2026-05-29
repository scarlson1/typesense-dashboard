import {
  Badge,
  PageHeader,
  primaryButtonSx,
  smallButtonSx,
} from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import {
  AddRounded,
  CloseRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useState } from 'react';

const NewApiKeyEditor = lazy(() => import('../../components/NewApiKeyEditor'));
const ApiKeyGrid = lazy(() => import('@/components/ApiKeyGrid'));

export const Route = createFileRoute('/_dashboard/keys')({
  component: RouteComponent,
  staticData: { crumb: 'API keys' },
});

// function ApiKeyCountChip() {
//   const [client, clusterId] = useTypesenseClient();
//   const { data } = useQuery({
//     queryKey: apiKeyQueryKeys.all(clusterId),
//     queryFn: () => client.keys().retrieve(),
//   });
//   const count = data?.keys?.length ?? 0;
//   if (!data) return null;
//   return (
//     <Box
//       component='span'
//       sx={{
//         display: 'inline-block',
//         fontSize: 12.5,
//         color: designTokens.textMuted,
//         background: designTokens.surfaceMuted,
//         border: `1px solid ${designTokens.border}`,
//         borderRadius: '100px',
//         px: 1.25,
//         py: 0.375,
//       }}
//     >
//       {count} active
//     </Box>
//   );
// }

function RouteComponent() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='API keys'
        badges={<Badge tone='neutral'>scoped access tokens</Badge>}
        actions={
          <Stack direction='row' sx={{ gap: 1, alignItems: 'center' }}>
            <Button
              variant='contained'
              size='small'
              startIcon={<AddRounded sx={{ fontSize: 14 }} />}
              onClick={() => setDrawerOpen(true)}
              sx={{
                ...primaryButtonSx,
                display: { xs: 'inline-flex', md: 'none' },
                color: designTokens.onAccent,
              }}
            >
              Key
            </Button>
            <Button
              component='a'
              href='https://typesense.org/docs/29.0/api/api-keys.html#generate-scoped-search-key'
              target='_blank'
              rel='noopener noreferrer'
              variant='outlined'
              size='small'
              startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
              sx={{
                ...smallButtonSx,
                display: { xs: 'none', md: 'inline-flex' },
              }}
            >
              Scoped key docs
            </Button>
          </Stack>
        }
      />

      {/* Mobile count strip */}
      {/* <Box
        sx={{
          display: { xs: 'block', lg: 'none' },
          px: 2.5,
          pb: 1.5,
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${designTokens.border}`,
        }}
      >
        <ApiKeyCountChip />
      </Box> */}

      <Box
        sx={{
          flex: 1,
          px: { xs: 0, md: 3.5 },
          py: { xs: 0, md: 2.25 },
          background: designTokens.surfaceTinted,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2.25,
          alignItems: { lg: 'flex-start' },
          minHeight: 0,
        }}
      >
        {/* Keys table / card list */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              background: designTokens.surface,
              border: { xs: 'none', md: `1px solid ${designTokens.border}` },
              borderTop: {
                xs: `1px solid ${designTokens.border}`,
                md: `1px solid ${designTokens.border}`,
              },
              borderRadius: { xs: 0, md: 1 },
              overflow: 'hidden',
            }}
          >
            <Suspense
              fallback={
                <Skeleton variant='rounded' height={300} sx={{ m: 2 }} />
              }
            >
              <ApiKeyGrid />
            </Suspense>
          </Box>
        </Box>

        {/* Right: create panel — desktop only */}
        <Box
          sx={{
            width: { lg: 340 },
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
            background: designTokens.surface,
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            p: 2.25,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: designTokens.text,
              mb: 0.5,
              letterSpacing: '-0.01em',
            }}
          >
            Create new key
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: designTokens.textMuted,
              lineHeight: 1.5,
              mb: 1.5,
            }}
          >
            Scope this key to specific collections and actions. The full secret
            will be shown once.
          </Typography>
          <Suspense fallback={<Skeleton variant='rounded' height={260} />}>
            <NewApiKeyEditor />
          </Suspense>
        </Box>
      </Box>

      {/* Mobile create drawer */}
      <Drawer
        anchor='bottom'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '92vh',
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
            mb: 0.5,
            flexShrink: 0,
          }}
        />

        <Box
          sx={{
            overflow: 'auto',
            px: 2.5,
            pb: 'calc(env(safe-area-inset-bottom) + 24px)',
            pt: 1,
          }}
        >
          <Stack
            direction='row'
            sx={{
              mb: 0.5,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: designTokens.text,
                letterSpacing: '-0.01em',
              }}
            >
              Create new key
            </Typography>
            <IconButton size='small' onClick={() => setDrawerOpen(false)}>
              <CloseRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
          <Typography
            sx={{
              fontSize: 12,
              color: designTokens.textMuted,
              lineHeight: 1.5,
              mb: 2,
            }}
          >
            Scope this key to specific collections and actions. The full secret
            will be shown once.
          </Typography>
          <Suspense fallback={<Skeleton variant='rounded' height={260} />}>
            <NewApiKeyEditor onSuccess={() => setDrawerOpen(false)} />
          </Suspense>
        </Box>
      </Drawer>
    </Stack>
  );
}
