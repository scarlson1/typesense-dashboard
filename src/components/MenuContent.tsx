import {
  AddRounded,
  BackupTableRounded,
  CompareArrowsRounded,
  DatasetRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  HelpRounded,
  HomeRounded,
  InfoRounded,
  InsightsRounded,
  KeyRounded,
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
import { createLink, useLocation, useMatchRoute } from '@tanstack/react-router';
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

// const useCollections = () => {
//   const [typesense, clusterId] = useTypesenseClient();

//   return useSuspenseQuery({
//     // queryKey: [credKey, ...collectionQueryKeys.all],
//     queryKey: collectionQueryKeys.all(clusterId),
//     queryFn: () => typesense.collections().retrieve(),
//   });
// };

export function MenuContent() {
  const matchRoute = useMatchRoute();
  const location = useLocation();
  // const { data: collections } = useCollections();
  const [open, setOpen] = useState<string | null>('Collections');
  const [typesense, clusterId] = useTypesenseClient();
  const { data: collections } = useSuspenseQuery({
    queryKey: collectionQueryKeys.all(clusterId),
    queryFn: () => typesense.collections().retrieve(),
  });
  // better to pull up selected collection to context provider ??
  const [selectedCollection, setSelectedCollection] = useState<string>(() =>
    Boolean(collections.length) ? collections[0].name : ''
  );

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
        icon: <SearchRounded />,
        route: selectedCollection
          ? {
              to: `/collections/$collectionId/search` as LinkProps['to'],
              params: { collectionId: selectedCollection },
            }
          : { to: location.pathname as LinkProps['to'] },
        disabled: !Boolean(selectedCollection),
      },
      {
        text: 'Documents',
        icon: <BackupTableRounded />,
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
        icon: <AddRounded />,
        route: selectedCollection
          ? {
              to: '/collections/$collectionId/documents/new' as LinkProps['to'],
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
        icon: <DatasetRounded />,
        route: { to: '/collections' },
        children: collectionChildren,
      },
      {
        text: 'Aliases',
        icon: <CompareArrowsRounded />,
        route: { to: '/alias' },
      },
      { text: 'API Keys', icon: <KeyRounded />, route: { to: '/keys' } },
      {
        text: 'Analytics Rules',
        icon: <InsightsRounded />,
        route: { to: '/analytics' },
      },
      {
        text: 'Search Presets',
        icon: <TroubleshootRounded />,
        route: { to: '/presets' },
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
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
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
                    <List component='div' disablePadding>
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
                        // {...child.route}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText primary={child.text} />
                      </RouterListItemButton>
                    </List>
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
              <ListItemIcon>{item.icon}</ListItemIcon>
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
