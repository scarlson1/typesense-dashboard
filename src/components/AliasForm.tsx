import { primaryButtonSx } from '@/components/redesign';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import {
  AddRounded,
  ArrowForwardRounded,
  UnfoldMoreRounded,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField as MuiTextField,
} from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

const newAliasSchema = z.object({
  aliasName: z.string(),
  targetCollection: z.string(),
});
export type NewAliasSchema = z.infer<typeof newAliasSchema>;

export const aliasFormOpts = formOptions({
  defaultValues: {
    aliasName: '',
    targetCollection: '',
  },
  validators: {
    onChange: newAliasSchema,
  },
});

const inlineInputSx = {
  flex: 1,
  maxWidth: 280,
  '& .MuiOutlinedInput-root': {
    backgroundColor: designTokens.surface,
    fontSize: 13,
    fontFamily: designTokens.fontMono,
    height: 34,
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
      fontSize: 13,
      fontFamily: designTokens.fontMono,
      padding: '6px 10px !important',
    },
    '& input::placeholder': {
      color: designTokens.textMuted,
      opacity: 1,
    },
  },
};

const targetInputSx = {
  ...inlineInputSx,
  maxWidth: 320,
  '& .MuiOutlinedInput-root': {
    ...inlineInputSx['& .MuiOutlinedInput-root'],
    '& input': {
      ...inlineInputSx['& .MuiOutlinedInput-root']['& input'],
    },
  },
};

export const AliasForm = withForm({
  ...aliasFormOpts,
  props: {
    targetOptions: [''],
  },
  render: ({ form, targetOptions }) => {
    return (
      <Stack
        sx={{
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 1.25,
          flexWrap: { md: 'wrap' },
        }}
      >
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            gap: 1.25,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <form.AppField name='aliasName'>
            {({ state, handleChange, handleBlur }) => (
              <MuiTextField
                value={state.value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                placeholder='alias-name'
                size='small'
                error={state.meta.isTouched && !state.meta.isValid}
                sx={inlineInputSx}
              />
            )}
          </form.AppField>

          <ArrowForwardRounded
            sx={{ fontSize: 15, color: designTokens.textFaint, flexShrink: 0 }}
          />

          <form.AppField name='targetCollection'>
            {({ state, handleChange, handleBlur }) => (
              <Autocomplete
                disablePortal
                freeSolo
                options={targetOptions}
                size='small'
                value={state.value}
                onChange={(_, newVal) =>
                  handleChange(typeof newVal === 'string' ? newVal : '')
                }
                onInputChange={(_, newVal, reason) => {
                  if (reason === 'input') handleChange(newVal);
                }}
                blurOnSelect
                autoHighlight
                popupIcon={
                  <UnfoldMoreRounded
                    sx={{ fontSize: 16, color: designTokens.textFaint }}
                  />
                }
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    onBlur={handleBlur}
                    placeholder='target: select collection…'
                    error={state.meta.isTouched && !state.meta.isValid}
                    sx={targetInputSx}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      border: `1px solid ${designTokens.border}`,
                      fontFamily: designTokens.fontMono,
                      fontSize: 13,
                    },
                  },
                }}
                sx={{ flex: 1, maxWidth: { md: 320 } }}
              />
            )}
          </form.AppField>
        </Stack>

        <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />

        <form.AppForm>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                variant='contained'
                disableElevation
                size='small'
                startIcon={<AddRounded sx={{ fontSize: 14 }} />}
                loading={isSubmitting}
                disabled={!canSubmit}
                sx={{ ...primaryButtonSx, width: { xs: '100%', md: 'auto' } }}
              >
                Upsert alias
              </Button>
            )}
          </form.Subscribe>
        </form.AppForm>
      </Stack>
    );
  },
});
