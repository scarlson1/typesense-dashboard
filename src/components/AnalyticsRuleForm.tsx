import { primaryButtonSx } from '@/components/redesign';
import { analyticsFormOpts, analyticsRuleType } from '@/constants';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { AddRounded } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';

const labelSx = {
  fontSize: 10.5,
  fontWeight: 700,
  color: designTokens.textFaint,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  mb: 0.75,
  mt: 1.5,
};

const compactInputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: designTokens.surface,
    fontSize: 12.5,
    fontFamily: designTokens.fontMono,
    minHeight: 32,
    borderRadius: '6px',
    '& fieldset': {
      borderColor: designTokens.border,
      transition: 'border-color 120ms ease',
    },
    '&:hover fieldset': { borderColor: designTokens.borderStrong },
    '&.Mui-focused fieldset': {
      borderColor: designTokens.accent,
      borderWidth: 1,
    },
    '& input': {
      fontSize: 12.5,
      fontFamily: designTokens.fontMono,
      padding: '6px 10px !important',
    },
    // '& input::placeholder': {
    //   color: designTokens.textMuted,
    //   opacity: 1,
    // },
  },
};

const RULE_TYPES = analyticsRuleType.options;

export const AnalyticsRuleForm = withForm({
  ...analyticsFormOpts,
  props: {
    sourceOptions: [''],
    destinationOptions: [''],
    submitButtonText: 'Add rule',
  },
  render: ({ form, sourceOptions, destinationOptions, submitButtonText }) => {
    return (
      <Box>
        {/* Rule type grid */}
        <Typography sx={labelSx}>Rule type</Typography>
        <form.Field name='type'>
          {({ state, handleChange }: any) => (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0.75,
                mb: 1.5,
              }}
            >
              {RULE_TYPES.map((t) => {
                const active = state.value === t;
                return (
                  <Box
                    key={t}
                    component='button'
                    type='button'
                    onClick={() => handleChange(t)}
                    sx={{
                      py: 1,
                      px: 1.25,
                      borderRadius: '5px',
                      fontSize: 11.5,
                      fontFamily: designTokens.fontMono,
                      textAlign: 'left',
                      border: `1px solid ${active ? designTokens.accentBorder : designTokens.border}`,
                      background: active
                        ? designTokens.accentSoft
                        : designTokens.surface,
                      color: active
                        ? designTokens.accentDeep
                        : designTokens.text,
                      cursor: 'pointer',
                      font: 'inherit',
                      fontWeight: active ? 600 : 400,
                      transition: 'all 120ms ease',
                      '&:hover': {
                        borderColor: active
                          ? designTokens.accentBorder
                          : designTokens.borderStrong,
                      },
                    }}
                  >
                    {t}
                  </Box>
                );
              })}
            </Box>
          )}
        </form.Field>

        {/* Name */}
        <Typography sx={labelSx}>Name</Typography>
        <form.AppField name='name'>
          {({ state, handleChange, handleBlur }) => (
            <MuiTextField
              value={state.value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder='suggested_searches'
              fullWidth
              size='small'
              required
              error={state.meta.isTouched && !state.meta.isValid}
              sx={compactInputSx}
            />
          )}
        </form.AppField>

        {/* Source collection */}
        <Typography sx={labelSx}>Source collection</Typography>
        <form.Field name='params.source.collections'>
          {({ state, handleChange, handleBlur }: any) => (
            <Autocomplete
              multiple
              freeSolo
              options={sourceOptions}
              size='small'
              value={state.value ?? []}
              onChange={(_, newVal) => handleChange(newVal)}
              renderInput={(params) => (
                <MuiTextField
                  {...params}
                  onBlur={handleBlur}
                  placeholder='select collections…'
                  required
                  sx={compactInputSx}
                />
              )}
              slotProps={{
                paper: {
                  sx: {
                    border: `1px solid ${designTokens.border}`,
                    fontFamily: designTokens.fontMono,
                    fontSize: 12.5,
                  },
                },
              }}
            />
          )}
        </form.Field>

        {/* Destination collection */}
        <Typography sx={labelSx}>Destination collection</Typography>
        <form.Field name='params.destination.collection'>
          {({ state, handleChange, handleBlur }: any) => (
            <Autocomplete
              freeSolo
              options={destinationOptions}
              size='small'
              value={state.value ?? ''}
              onChange={(_, newVal) =>
                handleChange(typeof newVal === 'string' ? newVal : '')
              }
              onInputChange={(_, newVal, reason) => {
                if (reason === 'input') handleChange(newVal);
              }}
              renderInput={(params) => (
                <MuiTextField
                  {...params}
                  onBlur={handleBlur}
                  placeholder='queries_suggestions'
                  sx={compactInputSx}
                />
              )}
              slotProps={{
                paper: {
                  sx: {
                    border: `1px solid ${designTokens.border}`,
                    fontFamily: designTokens.fontMono,
                    fontSize: 12.5,
                  },
                },
              }}
            />
          )}
        </form.Field>

        {/* Limit */}
        <Typography sx={labelSx}>Limit</Typography>
        <form.AppField name='params.limit'>
          {({ state, handleChange, handleBlur }) => (
            <MuiTextField
              value={state.value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder='1000'
              fullWidth
              size='small'
              sx={compactInputSx}
            />
          )}
        </form.AppField>

        {/* Event type */}
        {/* v30 implementation - one rule per event (instead of array of event types in v29) */}
        {/* <Stack direction='row' spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          <Box>

            <Typography sx={labelSx}>Event Type</Typography>
            <form.AppField name='event_type'>
              {({ state, handleChange, handleBlur }) => (
                <MuiTextField
                  value={state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  fullWidth
                  size='small'
                  sx={compactInputSx}
                  select
                >
                  {analyticsEventType.options.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </MuiTextField>
              )}
            </form.AppField>
          </Box>
        </Stack> */}

        {/* Checkboxes */}
        <Stack direction='row' spacing={2} sx={{ mt: 1.5, mb: 1.75 }}>
          <form.Field name='params.expand_query'>
            {({ state, handleChange }: any) => (
              <FormControlLabel
                control={
                  <Checkbox
                    size='small'
                    checked={Boolean(state.value)}
                    onChange={(_, c) => handleChange(c)}
                    sx={{ p: 0.375 }}
                  />
                }
                label='Expand partial queries'
                slotProps={{
                  typography: {
                    sx: {
                      fontSize: 12,
                      color: designTokens.textMuted,
                    },
                  },
                }}
              />
            )}
          </form.Field>
          <form.Field name='params.enable_auto_aggregation'>
            {({ state, handleChange }: any) => (
              <FormControlLabel
                control={
                  <Checkbox
                    size='small'
                    checked={Boolean(state.value)}
                    onChange={(_, c) => handleChange(c)}
                    sx={{ p: 0.375 }}
                  />
                }
                label='Enable auto aggregation'
                slotProps={{
                  typography: {
                    sx: {
                      fontSize: 12,
                      color: designTokens.textMuted,
                    },
                  },
                }}
              />
            )}
          </form.Field>
        </Stack>

        {/* Submit */}
        <form.AppForm>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                variant='contained'
                fullWidth
                disableElevation
                startIcon={<AddRounded sx={{ fontSize: 14 }} />}
                loading={isSubmitting}
                disabled={!canSubmit}
                sx={{ ...primaryButtonSx, height: 36 }}
              >
                {submitButtonText}
              </Button>
            )}
          </form.Subscribe>
        </form.AppForm>
      </Box>
    );
  },
});
