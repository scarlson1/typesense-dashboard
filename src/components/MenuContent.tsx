import {
  AddRounded,
  AutoFixHighRounded,
  BackupTableRounded,
  CompareArrowsRounded,
  DatasetRounded,
  DownloadRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  FrontHandRounded,
  HelpRounded,
  HomeRounded,
  InfoRounded,
  InsightsRounded,
  KeyRounded,
  LeakAddRounded,
  SearchRounded,
  SettingsRounded,
  TroubleshootRounded,
} from '@mui/icons-material';
import {
  Collapse,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import type { ListItemButtonProps } from '@mui/material/ListItemButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { LinkComponent, LinkProps } from '@tanstack/react-router';
import {
  createLink,
  useLocation,
  useMatches,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { collectionQueryKeys } from '../constants';
import { usePrevious, useTypesenseClient } from '../hooks';

interface MainListItem {
  text: string;
  icon: ReactNode;
  route: LinkProps; // LinkProps['to'];
  disabled?: boolean;
  children?: Omit<MainListItem, 'children'>[];
}

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRounded /> },
  { text: 'About', icon: <InfoRounded /> },
  { text: 'Feedback', icon: <HelpRounded /> },
];

// https://tanstack.com/router/latest/docs/framework/react/guide/custom-link#mui-example
interface MUIListItemButtonProps extends Omit<ListItemButtonProps, 'href'> {
  // Add any additional props you want to pass to the button
}

const RouterListItemButtonComponent = forwardRef<
  HTMLAnchorElement,
  MUIListItemButtonProps
>((props, ref) => {
  return <ListItemButton component={'a'} ref={ref} {...props} />;
});
const CreatedLinkComponent = createLink(RouterListItemButtonComponent);

export const RouterListItemButton: LinkComponent<
  typeof RouterListItemButtonComponent
> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />;
};

export function MenuContent() {
  const matchRoute = useMatchRoute();
  const matches = useMatches();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<string | null>('Collections');

  const [typesense, clusterId] = useTypesenseClient();
  // const currentCollection = useStore(typesenseStore, (state) => state.currentCollection);
  // const setCurrentCollection = useStore(typesenseStore, (state) => state.setCurrentCollection);

  const { data: collections } = useSuspenseQuery({
    queryKey: collectionQueryKeys.all(clusterId),
    queryFn: () => typesense.collections().retrieve(),
  });
  // better to pull up selected collection to context provider ??
  const [selectedCollection, setSelectedCollection] = useState<string>(() =>
    Boolean(collections.length) ? collections[0].name : ''
  );

  const prevCollection = usePrevious(selectedCollection);
  useEffect(() => {
    // only navigate if current path includes collectionId param
    let match = matches.find((m) => m.fullPath.includes('$collectionId'));

    if (
      selectedCollection &&
      prevCollection !== null &&
      selectedCollection !== prevCollection &&
      match?.fullPath && // @ts-ignore
      match?.params?.collectionId !== selectedCollection
    ) {
      console.log('NAVIGATING...');
      navigate({
        to: match.fullPath,
        params: { collectionId: selectedCollection },
      });
    }
  }, [navigate, prevCollection, matches, selectedCollection]);

  const prevClusterId = usePrevious(clusterId);
  useEffect(() => {
    if (clusterId !== prevClusterId)
      setSelectedCollection(
        Boolean(collections.length) ? collections[0].name : ''
      );
  }, [collections, clusterId]);

  // TODO: navigate on selected collection change (if current path includes collectionId)

  const mainListItems = useMemo<MainListItem[]>(() => {
    let collectionChildren = [
      {
        text: 'Search',
        icon: <SearchRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: `/collections/$collectionId/search` as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
      {
        text: 'Curation',
        icon: <AutoFixHighRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: '/collections/$collectionId/curation' as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
      {
        text: 'Synonyms',
        icon: <LeakAddRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: '/collections/$collectionId/synonyms' as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
      {
        text: 'Documents',
        icon: <BackupTableRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: '/collections/$collectionId/documents' as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
      {
        text: 'Add Documents',
        icon: <AddRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: '/collections/$collectionId/documents/new' as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
      {
        text: 'Export Documents',
        icon: <DownloadRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: '/collections/$collectionId/documents/export' as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
      {
        text: 'Collection Settings',
        icon: <SettingsRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: '/collections/$collectionId/config' as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
    ];

    return [
      { text: 'Home', icon: <HomeRounded />, route: { to: '/' } },
      // { text: 'Server Status', icon: <AnalyticsRounded />, route: '/status' },
      {
        text: 'Collections',
        icon: <DatasetRounded fontSize='small' />,
        route: { to: '/collections' },
        children: collectionChildren,
      },
      {
        text: 'Aliases',
        icon: <CompareArrowsRounded fontSize='small' />,
        route: { to: '/alias' },
      },
      {
        text: 'API Keys',
        icon: <KeyRounded fontSize='small' />,
        route: { to: '/keys' },
      },
      {
        text: 'Analytics Rules',
        icon: <InsightsRounded fontSize='small' />,
        route: { to: '/analytics' },
      },
      {
        text: 'Search Presets',
        icon: <TroubleshootRounded fontSize='small' />,
        route: { to: '/presets' },
      },
      {
        text: 'Stopwords',
        icon: <FrontHandRounded fontSize='small' />,
        route: { to: '/stopwords' },
      },
      // { text: 'Stop Words', icon: <AssessmentRounded />, route: '/stop-words' },
    ];
  }, [collections, selectedCollection]);

  const handleOpen = useCallback(
    (id: string) => {
      setOpen(open === id ? null : id);
    },
    [open]
  );

  const handleChange = useCallback((event: SelectChangeEvent) => {
    setSelectedCollection(event.target.value);
  }, []);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, i) => (
          <Fragment key={i}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <RouterListItemButton
                to={item.route.to}
                selected={Boolean(matchRoute({ to: item.route.to }))}
                disabled={item.disabled}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {Boolean(item.children?.length) ? (
                  open === item.text ? (
                    <ExpandLessRounded
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleOpen(`${item.text}`);
                      }}
                    />
                  ) : (
                    <ExpandMoreRounded
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleOpen(`${item.text}`);
                      }}
                    />
                  )
                ) : null}
              </RouterListItemButton>
            </ListItem>
            {item.text === 'Collections' && Boolean(collections.length) ? (
              <Select
                value={selectedCollection}
                onChange={handleChange}
                fullWidth
                size='small'
                sx={{ my: 1 }}
              >
                <MenuItem value={''}>{'--'}</MenuItem>
                {collections?.map((c) => (
                  <MenuItem value={c.name}>{c.name}</MenuItem>
                ))}
              </Select>
            ) : null}
            {item.children
              ? item.children.map((child, j) => (
                  <Collapse
                    in={open === `${item.text}`}
                    timeout='auto'
                    unmountOnExit
                    key={`${item.text}-${child.text}-${i}-${j}`}
                  >
                    {/* <List component='div' disablePadding> */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                      <RouterListItemButton
                        from={child.route.from}
                        to={child.route.to}
                        params={child.route.params}
                        search={child.route.search}
                        state={child.route.state}
                        preload={child.route.preload}
                        activeOptions={child.route.activeOptions}
                        // activeProps={child.route.activeProps}
                        // inactiveProps={child.route.inactiveProps}
                        selected={Boolean(
                          matchRoute(child.route) && selectedCollection
                        )}
                        disabled={item.disabled}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText primary={child.text} />
                      </RouterListItemButton>
                    </ListItem>
                    {/* </List> */}
                  </Collapse>
                ))
              : null}
          </Fragment>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

// const mainListItems: MainListItem[] = [
//   { text: 'Home', icon: <HomeRounded />, route: '/' },
//   // { text: 'Server Status', icon: <AnalyticsRounded />, route: '/status' },
//   { text: 'Collections', icon: <DatasetRounded />, route: '/collections' },
//   { text: 'Aliases', icon: <CompareArrowsRounded />, route: '/alias' },
//   { text: 'API Keys', icon: <KeyRounded />, route: '/keys' },
//   // { text: 'Analytics Rules', icon: <KeyRounded />, route: '/analytics' },
//   // { text: 'Search Presets', icon: <LocalShippingRounded />, route: '/presets' },
//   // { text: 'Stopwords', icon: <AssessmentRounded />, route: '/stop-words' },
// ];
