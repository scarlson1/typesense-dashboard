import { authFormOpts } from '@/constants/authForm';
import { withForm } from '@/hooks';
import { environment } from '@/types';
import { Stack, Typography } from '@mui/material';

// TODO: implement "remember" - use localStorage instead of sessionStorage ??

export const AuthForm = withForm({
  ...authFormOpts,
  props: {
    title: 'Login' as string | null,
  },
  render: ({ form, title }) => {
    return (
      <>
        {title ? (
          <Typography
            component='h1'
            variant='h4'
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            {title}
          </Typography>
        ) : null}
        <form.AppField name='node'>
          {({ TextField, state }) => (
            <TextField
              id='node'
              label='Node'
              placeholder='localhost or [CLUSTER_ID]-1.a1.typesense.net'
              autoFocus
              required
              fullWidth
              variant='outlined'
              color={state.meta.errors.length ? 'error' : 'primary'}
            />
          )}
        </form.AppField>
        <Stack direction='row' spacing={3}>
          <form.AppField name='protocol'>
            {({ Select, state }) => (
              <Select
                id='protocol'
                label='Protocol'
                placeholder='http'
                options={['https', 'http']}
                required
                fullWidth
                variant='outlined'
                color={state.meta.errors.length ? 'error' : 'primary'}
              />
            )}
          </form.AppField>
          <form.AppField name='port'>
            {({ TextField, state }) => (
              <TextField
                id='port'
                label='Port'
                placeholder='443'
                required
                fullWidth
                variant='outlined'
                color={state.meta.errors.length ? 'error' : 'primary'}
              />
            )}
          </form.AppField>
        </Stack>

        <Stack
          direction='row'
          spacing={3}
          // sx={{ justifyContent: 'space-between' }}
        >
          <form.AppField name='apiKey'>
            {({ TextField, state }) => (
              <TextField
                id='apiKey'
                label='API Key'
                type='password'
                required
                fullWidth
                variant='outlined'
                color={state.meta.errors.length ? 'error' : 'primary'}
              />
            )}
          </form.AppField>
          <form.AppField name='env'>
            {({ Select, state }) => (
              <Select
                id='env'
                label='Environment'
                placeholder='development'
                options={environment.options}
                required
                fullWidth
                variant='outlined'
                color={state.meta.errors.length ? 'error' : 'primary'}
              />
            )}
          </form.AppField>
        </Stack>
        {/* <form.AppField name='remember'>
          {({ Checkbox }) => <Checkbox label='Remember me' />}
        </form.AppField> */}
        <form.AppForm>
          <form.SubmitButton label='Submit' fullWidth />
        </form.AppForm>
      </>
    );
  },
});
