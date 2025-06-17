import { NotificationsRounded } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
// import dayjs, { Dayjs } from 'dayjs';
import { ColorModeIconDropdown } from './ColorModeIconDropdown';
import { MenuButton } from './MenuButton';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
// import Search from './Search';

// const date = dayjs().startOf('hour')

export function Header() {
  // const [value, setValue] = useState<Dayjs | null>(date); // (dayjs('2025-04-21'));

  return (
    <Stack
      direction='row'
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction='row' sx={{ gap: 1 }}>
        {/* <Search /> */}
        {/* <CustomDatePicker value={value} setValue={setValue} /> */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MenuButton
            showBadge
            aria-label='Open notifications'
            sx={{ maxHeight: 28 }}
          >
            <NotificationsRounded fontSize='inherit' />
          </MenuButton>
        </Box>

        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
