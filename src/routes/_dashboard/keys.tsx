import {
  Badge,
  PageHeader,
  smallButtonSx,
} from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const NewApiKeyEditor = lazy(() => import('../../components/NewApiKeyEditor'));
const ApiKeyGrid = lazy(() => import('@/components/ApiKeyGrid'));

export const Route = createFileRoute('/_dashboard/keys')({
  component: RouteComponent,
  staticData: { crumb: 'API keys' },
});

function RouteComponent() {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='API keys'
        badges={<Badge tone='neutral'>scoped access tokens</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/api-keys.html#generate-scoped-search-key'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            Scoped key docs
          </Button>
        }
      />
      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          display: 'flex',
          gap: 2.25,
          alignItems: 'flex-start',
          minHeight: 0,
        }}
      >
        {/* Left: keys table */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              background: designTokens.surface,
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Suspense
              fallback={<Skeleton variant='rounded' height={300} sx={{ m: 2 }} />}
            >
              <ApiKeyGrid />
            </Suspense>
          </Box>
        </Box>

        {/* Right: create panel */}
        <Box
          sx={{
            width: 340,
            flexShrink: 0,
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
            Scope this key to specific collections and actions. The full
            secret will be shown once.
          </Typography>
          <Suspense
            fallback={<Skeleton variant='rounded' height={260} />}
          >
            <NewApiKeyEditor />
          </Suspense>
        </Box>
      </Box>
    </Stack>
  );
}
