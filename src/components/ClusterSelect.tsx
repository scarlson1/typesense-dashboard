import type { Environment } from '@/types';
import { getCredsKey, queryClient, typesenseStore } from '@/utils';
import {
  BugReportRounded,
  ChecklistRounded,
  CodeRounded,
  DevicesRounded,
  LogoutRounded,
  PlaylistAddRounded,
  PriorityHigh,
  SupervisedUserCircleRounded,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Divider,
  IconButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  Avatar as MuiAvatar,
  ListItemAvatar as MuiListItemAvatar,
  Select,
  selectClasses,
  styled,
} from '@mui/material';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand';

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 24,
  height: 24,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  color: (theme.vars || theme).palette.text.secondary,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

const ADD_CLUSTER_VALUE = 'nav';
function getEnvAvatar(env?: Environment | null) {
  switch (env) {
    case 'production':
      return <DevicesRounded sx={{ fontSize: '1rem' }} />;
    case 'ci':
      return <ChecklistRounded sx={{ fontSize: '1rem' }} />;
    case 'development':
      return <CodeRounded sx={{ fontSize: '1rem' }} />;
    case 'staging':
      return <SupervisedUserCircleRounded sx={{ fontSize: '1rem' }} />;
    case 'testing':
      return <BugReportRounded sx={{ fontSize: '1rem' }} />;
    default:
      return <PriorityHigh sx={{ fontSize: '1rem' }} />;
  }
}

export function ClusterSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  // TODO: allow multiple sets of credentials & add context provider
  const credentials = useStore(typesenseStore, (state) => state.credentials);
  const cluster = useStore(typesenseStore, (state) => state.currentCredsKey);
  const setCluster = useStore(typesenseStore, (state) => state.setCredsKey);
  const [open, setOpen] = useState(false);

  // BUG: clearing query client not working - need to add cluster in query key ??
  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      if (event.target.value === ADD_CLUSTER_VALUE) {
        navigate({ to: '/auth' });
      } else {
        setCluster(event.target.value);
        // queryClient.clear();
        queryClient.refetchQueries();
      }
    },
    [navigate]
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleLogout = useCallback(
    async (key: string) => {
      navigate({
        to: '/logout',
        search: {
          redirect: location.href,
          clusterId: key,
        },
      });
    },
    [location, navigate]
  );

  const { prodCreds, devCreds, stagingCreds, testingCreds, ciCreds } =
    useMemo(() => {
      let creds = Object.values(credentials);

      let prodCreds = creds.filter((c) => c.env === 'production');
      let devCreds = creds.filter((c) => c.env === 'development');
      let stagingCreds = creds.filter((c) => c.env === 'staging');
      let testingCreds = creds.filter((c) => c.env === 'testing');
      let ciCreds = creds.filter((c) => c.env === 'ci');

      // return [prodCreds, devCreds, stagingCreds, testingCreds, ciCreds].filter(
      //   (c) => c.length
      // );
      return { prodCreds, devCreds, stagingCreds, testingCreds, ciCreds };
    }, [credentials]);

  return (
    <Select
      labelId='env-select-label'
      id='env-select'
      value={cluster}
      // @ts-ignore
      onChange={handleChange}
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      displayEmpty
      renderValue={(val) => {
        let cred = val ? credentials[val] : null;

        return (
          <MenuItem disableGutters sx={{ maxWidth: '100%' }}>
            <ListItemAvatar sx={{ px: 1, mr: 0 }}>
              <Avatar alt={cred ? cred.env || cred.node : 'No Cluster'}>
                {getEnvAvatar(cred?.env)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                cred ? cred.name || cred.env || cred.node : 'No selection'
              }
              secondary={cred ? val : 'choose a cluster'}
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              slotProps={{
                secondary: {
                  sx: {
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  },
                },
              }}
            />
          </MenuItem>
        );
      }}
      inputProps={{ 'aria-label': 'Select cluster' }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 215,
        '&.MuiList-root': {
          p: '8px',
        },
        [`& .${selectClasses.select}`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          pl: 1,
        },
      }}
      MenuProps={{
        sx: { maxWidth: 300 },
      }}
    >
      {/* <MenuItem value=''>
        <ListItemAvatar>
          <Avatar alt='No Cluster'>
            <DevicesRounded sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary='No selection' secondary='choose a cluster' />
      </MenuItem> */}

      {prodCreds.length ? (
        <ListSubheader sx={{ pt: 0 }}>Production</ListSubheader>
      ) : null}
      {prodCreds.length
        ? prodCreds.map((i) => (
            // <RenderOption option={i} />
            <MenuItem value={getCredsKey(i)} key={getCredsKey(i)}>
              <ListItemAvatar>
                <Avatar alt={`${i.protocol}:${i.node}:${i.port}`}>
                  <DevicesRounded sx={{ fontSize: '1rem' }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={i.name ?? i.env ?? 'no name'}
                secondary={`${i.protocol}:${i.node}:${i.port}`}
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                slotProps={{
                  secondary: {
                    sx: {
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    },
                  },
                }}
              />
              <IconButton
                aria-label='logout'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout(
                    getCredsKey({
                      protocol: i.protocol,
                      node: i.node,
                      port: i.port,
                    })
                  );
                }}
                size='small'
                sx={{ visibility: open ? 'visible' : 'hidden' }}
              >
                <LogoutRounded fontSize='inherit' />
              </IconButton>
            </MenuItem>
          ))
        : null}
      {stagingCreds.length ? (
        <ListSubheader sx={{ pt: 0 }}>Staging</ListSubheader>
      ) : null}
      {stagingCreds.length
        ? stagingCreds.map((i) => (
            // <RenderOption option={i} />
            <MenuItem value={getCredsKey(i)} key={getCredsKey(i)}>
              <ListItemAvatar>
                <Avatar alt={`${i.protocol}:${i.node}:${i.port}`}>
                  <SupervisedUserCircleRounded sx={{ fontSize: '1rem' }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={i.name ?? i.env ?? 'no name'}
                secondary={`${i.protocol}:${i.node}:${i.port}`}
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                slotProps={{
                  secondary: {
                    sx: {
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    },
                  },
                }}
              />
              <IconButton
                aria-label='logout'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout(
                    getCredsKey({
                      protocol: i.protocol,
                      node: i.node,
                      port: i.port,
                    })
                  );
                }}
                size='small'
                sx={{ visibility: open ? 'visible' : 'hidden' }}
              >
                <LogoutRounded fontSize='inherit' />
              </IconButton>
            </MenuItem>
          ))
        : null}
      {devCreds.length ? (
        <ListSubheader sx={{ pt: 0 }}>Development</ListSubheader>
      ) : null}
      {devCreds.length
        ? devCreds.map((i) => (
            // <RenderOption option={i} />
            <MenuItem value={getCredsKey(i)} key={getCredsKey(i)}>
              <ListItemAvatar>
                <Avatar alt={`${i.protocol}:${i.node}:${i.port}`}>
                  <CodeRounded sx={{ fontSize: '1rem' }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={i.name ?? i.env ?? 'no name'}
                secondary={`${i.protocol}:${i.node}:${i.port}`}
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                slotProps={{
                  secondary: {
                    sx: {
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    },
                  },
                }}
              />
              <IconButton
                aria-label='logout'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout(
                    getCredsKey({
                      protocol: i.protocol,
                      node: i.node,
                      port: i.port,
                    })
                  );
                }}
                size='small'
                sx={{ visibility: open ? 'visible' : 'hidden' }}
              >
                <LogoutRounded fontSize='inherit' />
              </IconButton>
            </MenuItem>
          ))
        : null}
      {testingCreds.length ? (
        <ListSubheader sx={{ pt: 0 }}>Testing</ListSubheader>
      ) : null}
      {testingCreds.length
        ? testingCreds.map((i) => (
            // <RenderOption option={i} />
            <MenuItem value={getCredsKey(i)} key={getCredsKey(i)}>
              <ListItemAvatar>
                <Avatar alt={`${i.protocol}:${i.node}:${i.port}`}>
                  <BugReportRounded sx={{ fontSize: '1rem' }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={i.name ?? i.env ?? 'no name'}
                secondary={`${i.protocol}:${i.node}:${i.port}`}
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                slotProps={{
                  secondary: {
                    sx: {
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    },
                  },
                }}
              />
              <IconButton
                aria-label='logout'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout(
                    getCredsKey({
                      protocol: i.protocol,
                      node: i.node,
                      port: i.port,
                    })
                  );
                }}
                size='small'
                sx={{ visibility: open ? 'visible' : 'hidden' }}
              >
                <LogoutRounded fontSize='inherit' />
              </IconButton>
            </MenuItem>
          ))
        : null}
      {ciCreds.length ? <ListSubheader sx={{ pt: 0 }}>CI</ListSubheader> : null}
      {ciCreds.length
        ? ciCreds.map((i) => (
            // <RenderOption option={i} />
            <MenuItem value={getCredsKey(i)} key={getCredsKey(i)}>
              <ListItemAvatar>
                <Avatar alt={`${i.protocol}:${i.node}:${i.port}`}>
                  <ChecklistRounded sx={{ fontSize: '1rem' }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={i.name ?? i.env ?? 'no name'}
                secondary={`${i.protocol}:${i.node}:${i.port}`}
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                slotProps={{
                  secondary: {
                    sx: {
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    },
                  },
                }}
              />
              <IconButton
                aria-label='logout'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout(
                    getCredsKey({
                      protocol: i.protocol,
                      node: i.node,
                      port: i.port,
                    })
                  );
                }}
                size='small'
                sx={{ visibility: open ? 'visible' : 'hidden' }}
              >
                <LogoutRounded fontSize='inherit' />
              </IconButton>
            </MenuItem>
          ))
        : null}
      <Divider />
      <MenuItem value={ADD_CLUSTER_VALUE}>
        <ListItemAvatar>
          <Avatar alt='Add Cluster'>
            <PlaylistAddRounded sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary='Add new Cluster' />
      </MenuItem>
    </Select>
  );
}

// function RenderOption({ option }: { option: TypesenseCreds }) {
//   return (
//     <MenuItem value={getCredsKey(option)}>
//       <ListItemAvatar>
//         <Avatar alt={`${option.protocol}:${option.node}:${option.port}`}>
//           <DevicesRounded sx={{ fontSize: '1rem' }} />
//         </Avatar>
//       </ListItemAvatar>
//       <ListItemText
//         primary={option.name ?? option.env ?? 'no name'}
//         secondary={`${option.protocol}:${option.node}:${option.port}`}
//       />
//     </MenuItem>
//   );
// }
