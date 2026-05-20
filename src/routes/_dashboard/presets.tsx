import { PresetsList } from '@/components/PresetsList';
import {
  Badge,
  PageHeader,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/presets')({
  component: RouteComponent,
  staticData: { crumb: 'Presets' },
});

function RouteComponent() {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Search presets'
        badges={<Badge tone='neutral'>reusable search configs</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/search.html#presets'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            Preset docs
          </Button>
        }
      />
      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <SectionCard
          title='Saved presets'
          description='Manage Typesense search parameter sets and reference them by name from your application. Change behaviour without code changes.'
        >
          <PresetsList />
        </SectionCard>
      </Box>
    </Stack>
  );
}
