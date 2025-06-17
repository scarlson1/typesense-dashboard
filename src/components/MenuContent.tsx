import {
  CompareArrowsRounded,
  DatasetRounded,
  HelpRounded,
  HomeRounded,
  InfoRounded,
  KeyRounded,
  SettingsRounded,
} from '@mui/icons-material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import type { ListItemButtonProps } from '@mui/material/ListItemButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import type { LinkComponent, LinkProps } from '@tanstack/react-router';
import { createLink } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';

const mainListItems: {
  text: string;
  icon: ReactNode;
  route: LinkProps['to'];
}[] = [
  { text: 'Home', icon: <HomeRounded />, route: '/' },
  // { text: 'Server Status', icon: <AnalyticsRounded />, route: '/status' },
  { text: 'Collections', icon: <DatasetRounded />, route: '/collections' },
  { text: 'Aliases', icon: <CompareArrowsRounded />, route: '/alias' },
  { text: 'API Keys', icon: <KeyRounded />, route: '/keys' },
  // { text: 'Analytics Rules', icon: <KeyRounded />, route: '/analytics' },
  // { text: 'Search Presets', icon: <LocalShippingRounded />, route: '/presets' },
  // { text: 'Stopwords', icon: <AssessmentRounded />, route: '/stop-words' },
];

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
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            {/* <ListItemButton selected={index === 0}> */}
            <RouterListItemButton to={item.route}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </RouterListItemButton>
            {/* </ListItemButton> */}
          </ListItem>
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
