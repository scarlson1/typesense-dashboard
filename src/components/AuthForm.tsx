import { authFormOpts } from '@/constants/authForm';
import { fieldLabelSx } from '@/constants/redesignSx';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { ArrowForwardRounded } from '@mui/icons-material';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

// TODO: implement "remember" - use localStorage instead of sessionStorage ??

// Environments offered in the segmented control, with the status-dot color
// shown for each. Ordered to match the connect screen design.
const ENV_OPTIONS = [
  { value: 'development', color: designTokens.success },
  { value: 'staging', color: designTokens.warning },
  { value: 'production', color: designTokens.danger },
] as const;

const FieldLabel = ({
  htmlFor,
  id,
  children,
}: {
  htmlFor?: string;
  id?: string;
  children: ReactNode;
}) => (
  <Typography
    component='label'
    htmlFor={htmlFor}
    id={id}
    sx={{ ...fieldLabelSx, display: 'block' }}
  >
    {children}
  </Typography>
);

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

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 0.9fr 1.1fr',
            gap: 1.5,
          }}
        >
          <Box>
            <FieldLabel htmlFor='node'>Host</FieldLabel>
            <form.AppField name='node'>
              {({ TextField, state }) => (
                <TextField
                  id='node'
                  placeholder='localhost or [CLUSTER_ID]-1.a1.typesense.net'
                  autoFocus
                  required
                  fullWidth
                  variant='outlined'
                  color={state.meta.errors.length ? 'error' : 'primary'}
                  size='small'
                />
              )}
            </form.AppField>
          </Box>
          <Box>
            <FieldLabel htmlFor='port'>Port</FieldLabel>
            <form.AppField name='port'>
              {({ TextField, state }) => (
                <TextField
                  id='port'
                  placeholder='443'
                  required
                  fullWidth
                  variant='outlined'
                  color={state.meta.errors.length ? 'error' : 'primary'}
                  size='small'
                />
              )}
            </form.AppField>
          </Box>
          <Box>
            <FieldLabel>Protocol</FieldLabel>
            <form.AppField name='protocol'>
              {({ Select, state }) => (
                <Select
                  id='protocol'
                  placeholder='https'
                  options={['https', 'http']}
                  required
                  fullWidth
                  variant='outlined'
                  color={state.meta.errors.length ? 'error' : 'primary'}
                  slotProps={{ select: { 'aria-label': 'Protocol' } }}
                  size='small'
                />
              )}
            </form.AppField>
          </Box>
        </Box>

        <Box>
          <FieldLabel htmlFor='apiKey'>API Key</FieldLabel>
          <form.AppField name='apiKey'>
            {({ TextField, state }) => (
              <TextField
                id='apiKey'
                type='password'
                required
                fullWidth
                variant='outlined'
                color={state.meta.errors.length ? 'error' : 'primary'}
                size='small'
              />
            )}
          </form.AppField>
        </Box>

        <Box>
          <FieldLabel htmlFor='env'>Environment</FieldLabel>
          <form.AppField name='env'>
            {(field) => (
              <Stack
                direction='row'
                role='group'
                aria-label='Environment'
                sx={{
                  p: 0.5,
                  gap: 0.5,
                  borderRadius: 2,
                  backgroundColor: designTokens.surfaceMuted,
                  border: `1px solid ${designTokens.border}`,
                }}
              >
                {ENV_OPTIONS.map(({ value: env, color }) => {
                  const selected = field.state.value === env;
                  return (
                    <ButtonBase
                      key={env}
                      aria-pressed={selected}
                      disableRipple
                      onClick={() => {
                        field.handleChange(env);
                        field.handleBlur();
                      }}
                      sx={{
                        flex: 1,
                        gap: 0.875,
                        py: 1,
                        px: 1.5,
                        borderRadius: 1.5,
                        fontSize: 13,
                        fontWeight: selected ? 600 : 500,
                        color: selected
                          ? designTokens.text
                          : designTokens.textMuted,
                        backgroundColor: selected
                          ? 'background.paper'
                          : 'transparent',
                        border: `1px solid ${selected ? designTokens.border : 'transparent'}`,
                        boxShadow: selected
                          ? designTokens.shadowButton
                          : 'none',
                        transition:
                          'background-color .12s, color .12s, box-shadow .12s',
                        '&:hover': {
                          color: designTokens.text,
                        },
                      }}
                    >
                      <Box
                        component='span'
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          flexShrink: 0,
                          backgroundColor: color,
                        }}
                      />
                      {env}
                    </ButtonBase>
                  );
                })}
              </Stack>
            )}
          </form.AppField>
        </Box>

        <form.AppForm>
          <form.SubmitButton
            label='Connect to cluster'
            fullWidth
            endIcon={<ArrowForwardRounded />}
            sx={{
              height: 48,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 1.5,
              mt: 0.5,
            }}
          />
        </form.AppForm>
      </>
    );
  },
});
