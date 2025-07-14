import { collectionQueryKeys } from '@/constants';
import { usePrevious, useTypesenseClient } from '@/hooks';
import { useMutationObservable } from '@/hooks/useMutationObservable';
import {
  AddRounded,
  AutoFixHighRounded,
  CompareArrowsRounded,
  DatasetRounded,
  DownloadRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  FrontHandRounded,
  GitHub,
  HelpRounded,
  HomeRounded,
  InsightsRounded,
  KeyRounded,
  LeakAddRounded,
  OpenInNewRounded,
  SearchRounded,
  SettingsInputSvideoRounded,
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
import { animated, useSpring } from '@react-spring/web';
import { useSuspenseQuery } from '@tanstack/react-query';
import type {
  AnyContext,
  AnySchema,
  LinkComponent,
  LinkProps,
  RouteMatch,
} from '@tanstack/react-router';
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
  useRef,
  useState,
} from 'react';

// TODO: clean up syncing collectionId between select/context/url
// TODO: fix collection select not updating on $collectionId change

interface MainListItem {
  text: string;
  icon: ReactNode;
  route: LinkProps; // LinkProps['to'];
  disabled?: boolean;
  children?: Omit<MainListItem, 'children'>[];
}

const secondaryListItems = [
  {
    text: 'Settings',
    route: { to: '/server' }, // TODO: settings page ??
    icon: <SettingsRounded fontSize='small' />,
  },
  {
    text: 'Feedback',
    route: {
      to: 'https://github.com/scarlson1/typesense-dashboard/issues' as LinkProps['to'],
      target: '_blank',
      rel: 'noopener noreferrer',
    }, // TODO: feedback page (link to github for now ??)
    icon: <HelpRounded fontSize='small' />,
    textEndIcon: <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />,
  },
  {
    text: 'Github',
    route: {
      to: 'https://github.com/scarlson1/typesense-dashboard' as LinkProps['to'],
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    icon: <GitHub fontSize='small' />,
    textEndIcon: <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />,
  },
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

const TestListItemButton = ({
  children,
  setSelected,
  setSelectedId,
  selectedId,
  selected,
}: {
  children: ReactNode;
  setSelected: (el: HTMLDivElement | null, id?: string | null) => void;
  setSelectedId: (id: string | null) => void;
  selectedId: string;
  selected: boolean;
}) => {
  let testRef = useRef<HTMLDivElement>(null);

  const handleClassChange = useCallback(
    (mutations: MutationRecord[], observer: MutationObserver) => {
      console.log(mutations, observer);
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const currentState = (mutation.target as Element).classList.contains(
            'Mui-selected'
          );
          console.log(`'Mui-selected': ${currentState}`);
          if (currentState && testRef.current)
            setSelected(testRef.current, selectedId);
          else {
            setSelected(null);
          }
        }
      });
    },
    [selectedId]
  );

  useMutationObservable(testRef, handleClassChange);

  const handleClick = () => {
    console.log('clicked');
    setSelectedId(selected ? null : selectedId);
  };

  return (
    <ListItemButton
      ref={testRef}
      component='div'
      selected={selected}
      onClick={() => handleClick()}
      sx={{ zIndex: 11 }}
    >
      {children}
    </ListItemButton>
  );
};

const TestAnimation = () => {
  // const selectedRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef<HTMLDivElement>(null);
  const [selectedEl, setSelectedEl] = useState<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    height: 26,
    width: 222,
    opacity: Boolean(selectedEl) ? 1 : 0,
  }));
  // usePrevious for "to" and "from" ??
  const prevEl = usePrevious(selectedEl);

  useEffect(() => {
    if (!selectedEl) {
      api.start({
        to: { opacity: 0 },
      });
      return;
    }
    const { x, y } = selectedEl.getBoundingClientRect() || {};

    console.log(
      'X Y: ',
      x,
      y,
      selectedEl.clientHeight,
      selectedEl.clientWidth,
      selectedEl.offsetLeft,
      selectedEl.offsetTop
    );

    const prev = prevEl?.getBoundingClientRect();
    console.log('PREV: ', prevEl);
    console.log('PREV RECT; ', prev);

    const targetRect = selectedEl.getBoundingClientRect();
    const referenceRect =
      animatedRef.current?.getBoundingClientRect() || ({} as DOMRect);

    const relativeX = targetRect.left - referenceRect?.left || 0;
    const relativeY = targetRect.top - referenceRect?.top || 0;

    console.log('relativeX; relativeY: ', relativeX, relativeY);

    if (x && y)
      api.start({
        to: {
          x: selectedEl.offsetLeft, // relativeX, //: 0,
          y: selectedEl.offsetTop, // relativeY, //: 0,
          height: selectedEl.clientHeight,
          width: selectedEl.clientWidth,
          opacity: 1,
        },
      });
  }, [prevEl, selectedEl]);

  const handleNewSelected = (el: HTMLDivElement | null, id?: string | null) => {
    setSelectedEl(el || null);
    setSelectedId(id ?? null);
    // const { x, y } = el.getBoundingClientRect() || {};
    // console.log('X Y: ', x, y, el.clientHeight, el.clientWidth);
    // if (x && y)
    //   api.start({ x, y, height: el.clientHeight, width: el.clientWidth }); // Animate to target's x and y
  };

  // props.x.

  return (
    <>
      <List dense sx={{ position: 'relative' }}>
        <TestListItemButton
          setSelected={handleNewSelected}
          setSelectedId={(id: string | null) => setSelectedId(id)}
          selectedId={'1'}
          selected={selectedId === '1'}
        >
          Test 1
        </TestListItemButton>
        <TestListItemButton
          setSelected={handleNewSelected}
          setSelectedId={(id: string | null) => setSelectedId(id)}
          selectedId={'2'}
          selected={selectedId === '2'}
          // selected={selectedEl === this}
        >
          Test 2
        </TestListItemButton>
        <animated.div
          ref={animatedRef}
          style={{
            // width: '222px',
            // height: '29px',
            top: 0,
            left: 0,
            background: 'red',
            position: 'absolute',
            zIndex: 10,
            ...props,
            // transform: props.y.to((y) => `translateY(${y}px)`),
            // transform: props.x.to(
            //   (x) => `translate3d(${x}px, ${props.y.get()}px, 0)`
            // ),
          }}
        />
      </List>
    </>
  );
};

export function MenuContent() {
  const matchRoute = useMatchRoute();
  const matches = useMatches();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<string | null>('Collections');

  const [typesense, clusterId] = useTypesenseClient();

  const { data: collections } = useSuspenseQuery({
    queryKey: collectionQueryKeys.all(clusterId),
    queryFn: () => typesense.collections().retrieve(),
  });

  const getParamCollectionId = useCallback(() => {
    // @ts-ignore
    let match:
      | RouteMatch<
          string,
          string,
          { collectionId?: string },
          AnySchema,
          any,
          AnyContext,
          {}
        >
      | undefined = matches.find((m) => m.fullPath.includes('$collectionId'));
    return match?.params?.collectionId;
  }, [matches]);

  // better to pull up selected collection to context provider ??
  const [selectedCollection, setSelectedCollection] = useState<string>(() => {
    let colId = getParamCollectionId();
    if (colId && collections.map((c) => c.name).includes(colId)) {
      return colId;
    }
    return Boolean(collections.length) ? collections[0].name : '';
  });

  // navigate to current page with updated collection ID on select change
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
      navigate({
        to: match.fullPath,
        params: { collectionId: selectedCollection },
      });
    }
  }, [navigate, prevCollection, matches, selectedCollection]);

  // update selected collection when clusterId changes
  const prevClusterId = usePrevious(clusterId);
  useEffect(() => {
    if (clusterId !== prevClusterId && prevClusterId) {
      let colId = getParamCollectionId();
      if (colId && collections.map((c) => c.name).includes(colId)) {
        setSelectedCollection(colId);
      } else {
        setSelectedCollection(
          Boolean(collections.length) ? collections[0].name : ''
        );
      }
    }
  }, [collections, clusterId, getParamCollectionId]);

  const mainListItems = useMemo<MainListItem[]>(() => {
    let collectionChildren = [
      {
        text: 'Search',
        icon: <SearchRounded fontSize='small' />,
        route: selectedCollection
          ? {
              to: `/collections/$collectionId/documents/search` as LinkProps['to'],
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
        text: 'Presets',
        icon: <TroubleshootRounded fontSize='small' />,
        route: { to: '/presets' },
      },
      {
        text: 'Stopwords',
        icon: <FrontHandRounded fontSize='small' />,
        route: { to: '/stopwords' },
      },
      {
        text: 'Cluster Config',
        icon: <SettingsInputSvideoRounded fontSize='small' />,
        route: { to: '/server' },
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
        {/* <TestListItemButton>Test</TestListItemButton> */}
        <TestAnimation />
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
                  </Collapse>
                ))
              : null}
          </Fragment>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <RouterListItemButton
              // to={item.route.to}
              // selected={Boolean(matchRoute({ to: item.route.to }))}
              {...item.route}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <>
                    {`${item.text}`}
                    {item.textEndIcon || null}
                  </>
                }
                slotProps={{
                  primary: {
                    component: 'div',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              />
            </RouterListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
