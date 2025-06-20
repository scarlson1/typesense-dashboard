import {
  BugReportRounded,
  ChecklistRounded,
  CodeRounded,
  DevicesRounded,
  SupervisedUserCircleRounded,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import {
  ListItemText,
  ListSubheader,
  MenuItem,
  Avatar as MuiAvatar,
  ListItemAvatar as MuiListItemAvatar,
  Select,
  selectClasses,
  styled,
} from '@mui/material';
import { useMemo } from 'react';
import { useStore } from 'zustand';
import { getCredsKey, queryClient, typesenseStore } from '../utils';

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

export function SelectContent() {
  // TODO: allow multiple sets of credentials & add context provider
  const credentials = useStore(typesenseStore, (state) => state.credentials);
  const cluster = useStore(typesenseStore, (state) => state.currentCredsKey);
  const setCluster = useStore(typesenseStore, (state) => state.setCredsKey);
  // const [cluster, setCluster] = useState<string>(credKey || '');

  // BUG: clearing query client not working - need to add cluster in query key ??
  const handleChange = (event: SelectChangeEvent) => {
    setCluster(event.target.value);
    queryClient.clear();
    queryClient.refetchQueries();
  };

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
      displayEmpty
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
      <MenuItem value=''>
        <ListItemAvatar>
          <Avatar alt='No Cluster'>
            <DevicesRounded sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary='No selection' secondary='choose a cluster' />
      </MenuItem>

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
            </MenuItem>
          ))
        : null}
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
