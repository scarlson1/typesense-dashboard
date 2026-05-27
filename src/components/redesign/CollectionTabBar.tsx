import { designTokens } from '@/theme/themePrimitives';
import { Box, Stack } from '@mui/material';
import { Link, useMatchRoute } from '@tanstack/react-router';

interface Tab {
  label: string;
  to: string;
}

const TABS: Tab[] = [
  { label: 'Search', to: '/collections/$collectionId/documents/search' },
  { label: 'Documents', to: '/collections/$collectionId/documents/new' },
  { label: 'Schema', to: '/collections/$collectionId/config' },
  { label: 'Synonyms', to: '/collections/$collectionId/synonyms' },
  { label: 'Curation', to: '/collections/$collectionId/curation' },
];

interface CollectionTabBarProps {
  collectionId: string;
}

export const CollectionTabBar = ({ collectionId }: CollectionTabBarProps) => {
  const matchRoute = useMatchRoute();

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        borderBottom: `1px solid ${designTokens.border}`,
        background: 'background.paper',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      <Stack
        direction='row'
        sx={{
          gap: 0,
          px: 1.5,
          minWidth: 'max-content',
        }}
      >
        {TABS.map((tab) => {
          const active = Boolean(
            matchRoute({
              to: tab.to,
              params: { collectionId },
              fuzzy: true,
            }),
          );
          return (
            <Box
              key={tab.label}
              component={Link}
              to={tab.to}
              params={{ collectionId }}
              sx={{
                px: 1.5,
                py: 1.25,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? designTokens.text : designTokens.textMuted,
                textDecoration: 'none',
                borderBottom: active
                  ? `2px solid ${designTokens.accent}`
                  : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'color 120ms ease',
                '&:hover': {
                  color: designTokens.text,
                },
              }}
            >
              {tab.label}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
