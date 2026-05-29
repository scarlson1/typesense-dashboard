import { useTypesenseVersion } from '@/hooks/useTypesenseVersion';
import { designTokens } from '@/theme/themePrimitives';
import {
  Box,
  Box as MuiBox,
  Stack,
  type BoxProps as MuiBoxProps,
} from '@mui/material';
import { createLink, useMatchRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

const CustomMuiLinkComponent = (props: MuiBoxProps<'a'>) => {
  return <MuiBox component='a' {...props} />;
};

export const RouterBoxLink = createLink(CustomMuiLinkComponent);

interface Tab {
  label: string;
  to: string;
  hide?: boolean;
}

interface CollectionTabBarProps {
  collectionId: string;
}

export const CollectionTabBar = ({ collectionId }: CollectionTabBarProps) => {
  const matchRoute = useMatchRoute();
  const { is30Plus } = useTypesenseVersion();

  const tabs = useMemo<Tab[]>(() => {
    return [
      { label: 'Search', to: '/collections/$collectionId/documents/search' },
      { label: 'Documents', to: '/collections/$collectionId/documents/new' },
      { label: 'Schema', to: '/collections/$collectionId/config' },
      {
        label: 'Synonyms',
        to: '/collections/$collectionId/synonyms',
        hide: is30Plus,
      },
      {
        label: 'Curation',
        to: '/collections/$collectionId/curation',
        hide: is30Plus,
      },
    ].filter((x) => !x.hide);
  }, [is30Plus]);

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        borderBottom: `1px solid ${designTokens.border}`,
        backgroundColor: 'background.paper',
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
        {tabs.map((tab) => {
          const active = Boolean(
            matchRoute({
              to: tab.to,
              params: { collectionId },
              fuzzy: true,
            }),
          );
          return (
            <RouterBoxLink
              key={tab.label}
              // component={Link}
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
            </RouterBoxLink>
          );
        })}
      </Stack>
    </Box>
  );
};
