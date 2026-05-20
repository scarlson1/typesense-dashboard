import {
  Badge,
  PageHeader,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Skeleton, Stack } from '@mui/material';
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
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
          gap: 2,
          minHeight: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <SectionCard title='Existing keys' noBodyPadding>
            <Box sx={{ p: 2 }}>
              <Suspense fallback={<Skeleton variant='rounded' height={300} />}>
                <ApiKeyGrid />
              </Suspense>
            </Box>
          </SectionCard>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <SectionCard
            title='Create new key'
            description='Scope this key to specific collections and actions. The full secret will be shown once.'
          >
            <Suspense fallback={<Skeleton variant='rounded' height={260} />}>
              <NewApiKeyEditor />
            </Suspense>
          </SectionCard>
        </Box>
      </Box>
    </Stack>
  );
}
