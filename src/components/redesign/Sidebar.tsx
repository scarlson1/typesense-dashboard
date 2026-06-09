import { ClusterSelect } from '@/components/ClusterSelect';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Logo } from '@/components/Logo';
import OptionsMenu from '@/components/OptionsMenu';
import { collectionQueryKeys } from '@/constants';
import { usePrevious, useTypesenseClient } from '@/hooks';
import { useTypesenseVersion } from '@/hooks/useTypesenseVersion';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseStore } from '@/utils';
import {
  AddRounded,
  AutoAwesomeRounded,
  AutoFixHighRounded,
  ChatBubbleOutlineRounded,
  CompareArrowsRounded,
  DatasetRounded,
  ExpandMoreRounded,
  FrontHandRounded,
  GitHub,
  HelpOutlineRounded,
  HomeRounded,
  InsightsRounded,
  KeyRounded,
  LeakAddRounded,
  OpenInNewRounded,
  SearchRounded,
  SettingsInputSvideoRounded,
  StarBorderRounded,
  StorageRounded,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { LinkComponent } from '@tanstack/react-router';
import {
  createLink,
  useMatches,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useStore } from 'zustand';

const SIDEBAR_WIDTH = 244;

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  React.HTMLProps<HTMLAnchorElement>
>(function RouterAnchor(props, ref) {
  return <a ref={ref} {...props} />;
});
const CreatedNavLink = createLink(RouterAnchor);
export const NavLink: LinkComponent<typeof RouterAnchor> = (props) => (
  <CreatedNavLink preload='intent' {...props} />
);

const sidebarLinkSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.125,
  px: 1.125,
  py: 0.75,
  borderRadius: 0.75,
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
  cursor: 'pointer',
} as const;

const headerLabelSx = {
  fontSize: 10.5,
  fontWeight: 600,
  color: designTokens.textFaint,
  px: 1,
  pt: 1.75,
  pb: 0.5,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
};

interface SidebarLinkProps {
  to: string;
  params?: Record<string, string>;
  icon: ReactNode;
  label: string;
  rightIcon?: ReactNode;
  disabled?: boolean;
  exact?: boolean;
  nested?: boolean;
}

function SidebarLink({
  to,
  params,
  icon,
  label,
  rightIcon,
  disabled,
  exact,
  nested,
}: SidebarLinkProps) {
  const matchRoute = useMatchRoute();
  const active = Boolean(
    matchRoute({
      to: to as never,
      params: params as never,
      fuzzy: !exact && !nested,
    }),
  );
  if (disabled) {
    return (
      <Box
        sx={{
          ...sidebarLinkSx,
          color: designTokens.textSubtle,
          opacity: 0.55,
          cursor: 'not-allowed',
          ...(nested && { fontSize: 12.5, py: 0.625, pl: 1.125 }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            color: designTokens.textSubtle,
            '& svg': { fontSize: nested ? 14 : 16 },
          }}
        >
          {icon}
        </Box>
        <Box component='span' sx={{ flex: 1 }}>
          {label}
        </Box>
      </Box>
    );
  }
  const linkProps = params ? { to, params } : { to };
  return (
    <NavLink
      {...(linkProps as unknown as React.ComponentProps<typeof NavLink>)}
      style={{ textDecoration: 'none' }}
    >
      <Box
        sx={{
          ...sidebarLinkSx,
          color: active ? designTokens.text : designTokens.textMuted,
          background: active ? designTokens.accentSoft : 'transparent',
          ...(nested && {
            fontSize: 12.5,
            py: 0.625,
            pl: 1.125,
            color: active ? designTokens.accentDeep : designTokens.textMuted,
            fontWeight: active ? 500 : 400,
          }),
          '&:hover': {
            background: active
              ? designTokens.accentSoft
              : designTokens.surfaceMuted,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            color: active ? designTokens.accent : designTokens.textFaint,
            '& svg': { fontSize: nested ? 14 : 16 },
          }}
        >
          {icon}
        </Box>
        <Box component='span' sx={{ flex: 1 }}>
          {label}
        </Box>
        {rightIcon}
      </Box>
    </NavLink>
  );
}

export function Sidebar() {
  const matches = useMatches();
  const navigate = useNavigate();
  const [typesense, clusterId] = useTypesenseClient();
  const { is30Plus } = useTypesenseVersion();

  const { data: collections } = useSuspenseQuery({
    queryKey: collectionQueryKeys.all(clusterId),
    queryFn: () => typesense.collections().retrieve(),
  });

  const getParamCollectionId = useCallback(() => {
    const match = matches.find((m) => m.fullPath.includes('$collectionId'));
    if (match && 'collectionId' in match.params) {
      return (match.params as { collectionId?: string }).collectionId;
    }
    return undefined;
  }, [matches]);

  const [selectedCollection, setSelectedCollection] = useState<string>(() => {
    const colId = getParamCollectionId();
    if (colId && collections.map((c) => c.name).includes(colId)) {
      return colId;
    }
    return collections.length ? collections[0].name : '';
  });

  const prevClusterId = usePrevious(clusterId);
  useEffect(() => {
    if (clusterId !== prevClusterId && prevClusterId) {
      const colId = getParamCollectionId();
      if (colId && collections.map((c) => c.name).includes(colId)) {
        setSelectedCollection(colId);
      } else {
        setSelectedCollection(collections.length ? collections[0].name : '');
      }
    }
  }, [collections, clusterId, prevClusterId, getParamCollectionId]);

  // Route is the single source of truth: when a collection is in the URL
  // (e.g. selecting a row in the collections table, or any external nav),
  // mirror it into the picker. State→route is handled imperatively in the
  // picker's onChange below, so the two never fight in an effect loop.
  const paramCollectionId = getParamCollectionId();
  useEffect(() => {
    if (
      paramCollectionId &&
      paramCollectionId !== selectedCollection &&
      collections.some((c) => c.name === paramCollectionId)
    ) {
      setSelectedCollection(paramCollectionId);
    }
  }, [paramCollectionId, selectedCollection, collections]);

  const handleSelectCollection = useCallback(
    (name: string) => {
      // On a collection route, switch collections by navigating (keeping the
      // same sub-page); the sync effect above then mirrors the new param back
      // into state. Off a collection route there's nothing to navigate to, so
      // just remember the choice for the nested links.
      const match = matches.find((m) => m.fullPath.includes('$collectionId'));
      if (name && match?.fullPath && 'collectionId' in (match.params ?? {})) {
        navigate({
          // @ts-expect-error route type
          to: match.fullPath,
          params: { collectionId: name },
        });
      } else {
        setSelectedCollection(name);
      }
    },
    [navigate, matches],
  );

  // Note: design's "Workspace" grouping puts search/curation/etc under
  // Collections. We preserve current route layout but mirror that grouping.
  const collectionChildren = useMemo(
    () =>
      [
        {
          text: 'Search',
          icon: <SearchRounded fontSize='small' />,
          to: '/collections/$collectionId/documents/search',
        },
        {
          text: 'Add documents',
          icon: <AddRounded fontSize='small' />,
          to: '/collections/$collectionId/documents/new',
        },
        {
          text: 'Curation',
          icon: <AutoFixHighRounded fontSize='small' />,
          to: '/collections/$collectionId/curation',
          hide: is30Plus,
        },
        {
          text: 'Synonyms',
          icon: <LeakAddRounded fontSize='small' />,
          to: '/collections/$collectionId/synonyms',
          hide: is30Plus,
        },
        {
          text: 'Schema',
          icon: <StorageRounded fontSize='small' />,
          to: '/collections/$collectionId/config',
        },
      ].filter((x) => !x.hide),
    [is30Plus],
  );

  return (
    <Box
      component='aside'
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        background: designTokens.surface,
        borderRight: `1px solid ${designTokens.border}`,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        px: 1.25,
        pt: 1.75,
        pb: 1.25,
      }}
    >
      <Stack
        direction='row'
        sx={{ alignItems: 'center', gap: 1, px: 1, pb: 1.75 }}
      >
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: 0.75,
            background: `linear-gradient(135deg, ${designTokens.accent}, hsl(212, 85%, 60%))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '-0.02em',
          }}
        >
          {/* T */}
          <Logo sx={{ fontSize: 16 }} />
        </Box>
        <Typography
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.01em',
            fontSize: 14,
            color: designTokens.text,
          }}
        >
          Typesense
        </Typography>
      </Stack>

      <Box
        sx={{
          mb: 1.75,
        }}
      >
        <ClusterSelect />
      </Box>

      <Box
        component='nav'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <SidebarLink
          to='/'
          icon={<HomeRounded fontSize='small' />}
          label='Home'
          exact
        />

        <Typography sx={headerLabelSx}>Workspace</Typography>

        <SidebarLink
          to='/collections'
          icon={<DatasetRounded fontSize='small' />}
          label='Collections'
          rightIcon={
            <ExpandMoreRounded
              sx={{ fontSize: 14, color: designTokens.textFaint }}
            />
          }
        />

        <Box
          sx={{
            pl: 1,
            ml: 1.375,
            borderLeft: `1px solid ${designTokens.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
          }}
        >
          {collections.length ? (
            <Select
              value={selectedCollection}
              onChange={(e: SelectChangeEvent) =>
                handleSelectCollection(e.target.value)
              }
              displayEmpty
              size='small'
              fullWidth
              MenuProps={{ sx: { maxHeight: 360 } }}
              sx={{
                my: 0.5,
                fontSize: 12,
                fontFamily: designTokens.fontMono,
                background: designTokens.surfaceMuted,
                borderRadius: '6px',
                color: designTokens.text,
                '& .MuiSelect-select': {
                  py: 0.625,
                  px: 1.125,
                  minHeight: 'unset',
                },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiSelect-icon': {
                  color: designTokens.textFaint,
                  fontSize: 16,
                },
              }}
            >
              <MenuItem value='' sx={{ fontSize: 12 }}>
                —
              </MenuItem>
              {collections.map((c) => (
                <MenuItem
                  key={c.name}
                  value={c.name}
                  sx={{ fontSize: 12, fontFamily: designTokens.fontMono }}
                >
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          ) : null}
          {collectionChildren.map((c) => (
            <SidebarLink
              key={c.text}
              to={c.to}
              params={
                selectedCollection
                  ? { collectionId: selectedCollection }
                  : undefined
              }
              icon={c.icon}
              label={c.text}
              disabled={!selectedCollection}
              nested
            />
          ))}
        </Box>

        <SidebarLink
          to='/alias'
          icon={<CompareArrowsRounded fontSize='small' />}
          label='Aliases'
        />
        <SidebarLink
          to='/presets'
          icon={<StarBorderRounded fontSize='small' />}
          label='Presets'
        />
        <SidebarLink
          to='/stopwords'
          icon={<FrontHandRounded fontSize='small' />}
          label='Stopwords'
        />
        {is30Plus ? (
          <SidebarLink
            to='/curation'
            icon={<AutoFixHighRounded fontSize='small' />}
            label='Curation'
          />
        ) : null}
        {is30Plus ? (
          <SidebarLink
            to='/synonyms'
            icon={<LeakAddRounded fontSize='small' />}
            label='Synonyms'
          />
        ) : null}

        <Typography sx={headerLabelSx}>Cluster</Typography>

        <SidebarLink
          to='/conversational-search'
          icon={<ChatBubbleOutlineRounded fontSize='small' />}
          label='Conversational search'
        />
        <SidebarLink
          to='/keys'
          icon={<KeyRounded fontSize='small' />}
          label='API keys'
        />
        <SidebarLink
          to='/analytics'
          icon={<InsightsRounded fontSize='small' />}
          label='Analytics'
        />
        <SidebarLink
          to='/nl-models'
          icon={<AutoAwesomeRounded fontSize='small' />}
          label='NL models'
        />
        <SidebarLink
          to='/conversation-models'
          icon={<ChatBubbleOutlineRounded fontSize='small' />}
          label='Conversation models'
        />
        <SidebarLink
          to='/server'
          icon={<SettingsInputSvideoRounded fontSize='small' />}
          label='Server status'
        />

        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Divider sx={{ mb: 0.5, borderColor: designTokens.border }} />
          <Box
            component='a'
            href='https://typesense.org/docs/'
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              ...sidebarLinkSx,
              color: designTokens.textMuted,
              textDecoration: 'none',
              '&:hover': { background: designTokens.surfaceMuted },
            }}
          >
            <HelpOutlineRounded
              sx={{ fontSize: 14, color: designTokens.textFaint }}
            />
            <Box component='span' sx={{ flex: 1 }}>
              Documentation
            </Box>
            <OpenInNewRounded
              sx={{ fontSize: 12, color: designTokens.textFaint }}
            />
          </Box>
          <Box
            component='a'
            href='https://github.com/scarlson1/typesense-dashboard'
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              ...sidebarLinkSx,
              color: designTokens.textMuted,
              textDecoration: 'none',
              '&:hover': { background: designTokens.surfaceMuted },
            }}
          >
            <GitHub sx={{ fontSize: 14, color: designTokens.textFaint }} />
            <Box component='span' sx={{ flex: 1 }}>
              GitHub
            </Box>
            <OpenInNewRounded
              sx={{ fontSize: 12, color: designTokens.textFaint }}
            />
          </Box>
        </Box>
      </Box>

      <SidebarFooter />
    </Box>
  );
}

function SidebarFooter() {
  const creds = useStore(typesenseStore, (state) => state.credentials);
  const currKey = useStore(typesenseStore, (state) => state.currentCredsKey);
  const current = currKey ? creds[currKey] : null;
  const envLabel = current?.env
    ? current.env.charAt(0).toUpperCase() + current.env.slice(1)
    : 'Connected';
  const hostLabel = current
    ? `${current.protocol}://${current.node}${
        current.protocol === 'http' && current.port ? `:${current.port}` : ''
      }`
    : '—';
  return (
    <Stack
      direction='row'
      sx={{
        borderTop: `1px solid ${designTokens.border}`,
        mt: 1,
        pt: 1.25,
        gap: 1.125,
        alignItems: 'center',
        px: 1,
        pb: 0.5,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: designTokens.success,
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 500,
            lineHeight: 1.2,
            color: designTokens.text,
          }}
        >
          {envLabel}
        </Typography>
        <Typography
          noWrap
          title={hostLabel}
          sx={{
            fontSize: 11,
            color: designTokens.textFaint,
            mt: 0.25,
            fontFamily: designTokens.fontMono,
          }}
        >
          {hostLabel}
        </Typography>
      </Box>
      <Box
        sx={{
          color: designTokens.textFaint,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <OptionsMenu />
      </Box>
    </Stack>
  );
}

export function SidebarBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(err: unknown) => captureException(err)}
    >
      <Sidebar />
    </ErrorBoundary>
  );
}
