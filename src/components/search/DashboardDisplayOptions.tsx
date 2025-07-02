import { Alert, Paper, Stack, Typography } from '@mui/material';

export function DashboardDisplayOptions() {
  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, my: 2 }}>
      <Alert severity='warning' sx={{ mb: 2 }}>
        TODO: dashboard display options
      </Alert>
      <Stack direction='column' spacing={1.5}>
        <Stack direction='row' spacing={2} sx={{ display: 'flex' }}>
          <Typography
            sx={{
              textAlign: 'right',
              flex: '0 0 auto',
              width: { xs: 120, sm: 150, md: 200 },
            }}
          >
            Display Fields
          </Typography>
          <Typography>Input Select Field Placeholder</Typography>
        </Stack>

        <Stack direction='row' spacing={2}>
          <Typography
            sx={{
              textAlign: 'right',
              flex: '0 0 auto',
              width: { xs: 120, sm: 150, md: 200 },
            }}
          >
            Image Field
          </Typography>
          <Typography>Input Select Field Placeholder</Typography>
        </Stack>

        <Stack direction='row' spacing={2}>
          <Typography
            sx={{
              textAlign: 'right',
              flex: '0 0 auto',
              width: { xs: 120, sm: 150, md: 200 },
            }}
          >
            Number of Columns in View
          </Typography>
          <Typography>Input Select Field Placeholder</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
