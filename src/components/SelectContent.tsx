import {
  AddRounded,
  ConstructionRounded,
  DevicesRounded,
  SmartphoneRounded,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Avatar as MuiAvatar,
  ListItemAvatar as MuiListItemAvatar,
  Select,
  selectClasses,
  styled,
} from '@mui/material';
import { useState } from 'react';

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  color: (theme.vars || theme).palette.text.secondary,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

export function SelectContent() {
  const [company, setCompany] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setCompany(event.target.value as string);
  };

  return (
    <Select
      labelId='company-select'
      id='company-simple-select'
      value={company}
      onChange={handleChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Select company' }}
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
    >
      <ListSubheader sx={{ pt: 0 }}>Production</ListSubheader>
      <MenuItem value=''>
        <ListItemAvatar>
          <Avatar alt='Typesense web'>
            <DevicesRounded sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary='Typesense-web' secondary='Web app' />
      </MenuItem>
      <MenuItem value={10}>
        <ListItemAvatar>
          <Avatar alt='Typesense App'>
            <SmartphoneRounded sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary='Typesense-mobile'
          secondary='Mobile application'
        />
      </MenuItem>
      <MenuItem value={20}>
        <ListItemAvatar>
          <Avatar alt='Typesense Store'>
            <DevicesRounded sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary='Typesense-Store' secondary='Web app' />
      </MenuItem>
      <ListSubheader>Development</ListSubheader>
      <MenuItem value={30}>
        <ListItemAvatar>
          <Avatar alt='Typesense Store'>
            <ConstructionRounded sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary='Typesense-Admin' secondary='Web app' />
      </MenuItem>
      <Divider sx={{ mx: -1 }} />
      <MenuItem value={40}>
        <ListItemIcon>
          <AddRounded />
        </ListItemIcon>
        <ListItemText primary='Add product' secondary='Web app' />
      </MenuItem>
    </Select>
  );
}
