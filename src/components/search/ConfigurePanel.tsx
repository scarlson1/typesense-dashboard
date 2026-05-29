import { designTokens } from '@/theme/themePrimitives';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import type { ReactNode } from 'react';

interface ConfigurePanelProps {
  refineContent: ReactNode;
  paramsContent: ReactNode;
  displayContent: ReactNode;
  filterCount?: number;
  hasUnsavedChanges?: boolean;
  tab: number;
  onTabChange: (tab: number) => void;
}

export const ConfigurePanel = ({
  refineContent,
  paramsContent,
  displayContent,
  filterCount = 0,
  hasUnsavedChanges = false,
  tab,
  onTabChange,
}: ConfigurePanelProps) => (
  <Box>
    <Box sx={{ borderBottom: `1px solid ${designTokens.border}`, px: 1 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => onTabChange(v)}
        sx={{
          minHeight: 40,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 500,
            minHeight: 40,
            px: 1.5,
            color: designTokens.textMuted,
            '&.Mui-selected': {
              color: designTokens.text,
              fontWeight: 600,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: designTokens.accent,
            height: 2,
          },
        }}
      >
        <Tab
          label={
            <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
              Refine
              {filterCount > 0 && (
                <Box
                  component='span'
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 18,
                    height: 18,
                    borderRadius: '9px',
                    fontSize: 11,
                    fontWeight: 600,
                    px: 0.5,
                    lineHeight: 1,
                    backgroundColor: designTokens.accent,
                    color: designTokens.onAccent,
                  }}
                >
                  {filterCount}
                </Box>
              )}
            </Stack>
          }
        />
        <Tab
          label={
            <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
              Params
              {hasUnsavedChanges && (
                <Box
                  component='span'
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: designTokens.warning,
                  }}
                />
              )}
            </Stack>
          }
        />
        <Tab label='Display' />
      </Tabs>
    </Box>
    <Box sx={{ px: 2.75, py: 2.5 }}>
      {tab === 0 && refineContent}
      {tab === 1 && paramsContent}
      {tab === 2 && displayContent}
    </Box>
  </Box>
);
