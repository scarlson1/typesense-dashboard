import { Badge, smallButtonSx } from '@/components/redesign';
import { collectionFormOpts, NEW_EMPTY_FIELD } from '@/constants';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseFieldType } from '@/types';
import {
  AddRounded,
  AutoFixHighRounded,
  RemoveRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  MenuItem,
  Checkbox as MuiCheckbox,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';
import type { FieldType } from 'typesense/lib/Typesense/Collection';

// Redesigned (Option A) field editor — one card per field with a numbered
// badge, name + type inputs, a remove action and a wrapped row of flag toggles.
// Mirrors the legacy CollectionFieldsForm but rebuilt to match the redesign.

const FIELD_FLAGS = [
  { key: 'index', label: 'Index' },
  { key: 'store', label: 'Store' },
  { key: 'facet', label: 'Facet' },
  { key: 'sort', label: 'Sort' },
  { key: 'optional', label: 'Optional' },
  { key: 'infix', label: 'Infix' },
  { key: 'range_index', label: 'Range' },
] as const;

const fieldInputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: designTokens.surface,
    minHeight: 38,
    borderRadius: '7px',
    '& fieldset': { borderColor: designTokens.border },
    '&:hover fieldset': { borderColor: designTokens.borderStrong },
    '&.Mui-focused fieldset': {
      borderColor: designTokens.accent,
      borderWidth: 1,
    },
    '& input': {
      fontSize: 13,
      fontFamily: designTokens.fontMono,
      color: designTokens.text,
    },
    '& input::placeholder': { color: designTokens.textFaint, opacity: 1 },
  },
  '& .MuiSelect-select': {
    fontFamily: designTokens.fontMono,
    fontSize: 13,
    color: designTokens.text,
  },
};

export const CollectionFieldsForm = withForm({
  ...collectionFormOpts,
  render: ({ form }) => {
    return (
      <form.AppField name='fields' mode='array'>
        {({ state, pushValue, removeValue }) => (
          <Box
            sx={{
              backgroundColor: designTokens.surface,
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Stack
              direction='row'
              sx={{
                px: 2.25,
                py: 1.75,
                borderBottom: `1px solid ${designTokens.border}`,
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: designTokens.text,
                  letterSpacing: '-0.005em',
                }}
              >
                Fields
              </Typography>
              <Badge tone='neutral'>{state.value.length} defined</Badge>
              <Box sx={{ flex: 1 }} />
              <Button
                size='small'
                variant='outlined'
                startIcon={<AddRounded sx={{ fontSize: 16 }} />}
                onClick={() => pushValue(NEW_EMPTY_FIELD)}
                sx={smallButtonSx}
              >
                Add field
              </Button>
            </Stack>

            {/* Field cards */}
            <Stack spacing={1.25} sx={{ p: 2.25 }}>
              {state.value.map((_, i) => (
                <Box
                  key={`${i}`}
                  sx={{
                    border: `1px solid ${designTokens.border}`,
                    borderRadius: '9px',
                    background: designTokens.surface,
                    p: 1.5,
                  }}
                >
                  <Stack
                    direction='row'
                    spacing={1.25}
                    sx={{ alignItems: 'center' }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '6px',
                        flexShrink: 0,
                        background: designTokens.surfaceMuted,
                        border: `1px solid ${designTokens.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 600,
                        color: designTokens.textFaint,
                        fontFamily: designTokens.fontMono,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <form.Field name={`fields[${i}].name`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiTextField
                            id={`fields[${i}].name`}
                            value={state.value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            placeholder='field_name'
                            required
                            fullWidth
                            error={
                              state.meta.isTouched && !!state.meta.errors.length
                            }
                            sx={fieldInputSx}
                          />
                        )}
                      </form.Field>
                    </Box>
                    <Box sx={{ width: { xs: 110, sm: 200 }, flexShrink: 0 }}>
                      <form.Field name={`fields[${i}].type`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiTextField
                            select
                            id={`fields[${i}].type`}
                            value={state.value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            required
                            fullWidth
                            error={
                              state.meta.isTouched && !!state.meta.errors.length
                            }
                            sx={fieldInputSx}
                            slotProps={{
                              select: {
                                displayEmpty: true,
                                renderValue: (v) =>
                                  (v as string) || (
                                    <Box
                                      component='span'
                                      sx={{ color: designTokens.textFaint }}
                                    >
                                      type *
                                    </Box>
                                  ),
                              },
                            }}
                          >
                            {typesenseFieldType.options.map((o: FieldType) => (
                              <MenuItem
                                value={o}
                                key={o}
                                dense
                                sx={{
                                  fontFamily: designTokens.fontMono,
                                  fontSize: 13,
                                }}
                              >
                                {o}
                              </MenuItem>
                            ))}
                          </MuiTextField>
                        )}
                      </form.Field>
                    </Box>
                    <IconButton
                      onClick={() => removeValue(i)}
                      aria-label='remove field'
                      sx={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: '7px',
                        border: `1px solid ${designTokens.border}`,
                        color: designTokens.textFaint,
                        '&:hover': {
                          borderColor: designTokens.borderStrong,
                          background: designTokens.surfaceMuted,
                        },
                      }}
                    >
                      <RemoveRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      columnGap: 2.5,
                      rowGap: 0.5,
                      mt: 1.5,
                      pt: 1.5,
                      pl: { xs: 0, sm: 4 },
                      borderTop: `1px solid ${designTokens.border}`,
                    }}
                  >
                    {FIELD_FLAGS.map((fl) => (
                      <form.Field key={fl.key} name={`fields[${i}].${fl.key}`}>
                        {({ state, handleChange, handleBlur }) => (
                          <FormControlLabel
                            sx={{
                              m: 0,
                              gap: 0.75,
                              '& .MuiFormControlLabel-label': {
                                fontSize: 13,
                                fontWeight: state.value ? 500 : 400,
                                color: state.value
                                  ? designTokens.text
                                  : designTokens.textMuted,
                              },
                            }}
                            control={
                              <MuiCheckbox
                                size='small'
                                color='primary'
                                checked={!!state.value}
                                onChange={(e) => handleChange(e.target.checked)}
                                onBlur={handleBlur}
                                sx={{ p: 0.5 }}
                              />
                            }
                            label={fl.label}
                          />
                        )}
                      </form.Field>
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* Tip footer */}
            <Box
              sx={{
                mx: 2.25,
                mb: 2.25,
                px: 1.75,
                py: 1.25,
                borderRadius: '8px',
                background: designTokens.accentSoft,
                border: `1px solid ${designTokens.accentBorder}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.125,
              }}
            >
              <AutoFixHighRounded
                sx={{ fontSize: 16, color: designTokens.accent }}
              />
              <Typography sx={{ fontSize: 12, color: designTokens.accentDeep }}>
                Tip — add a field named{' '}
                <Box
                  component='span'
                  sx={{ fontFamily: designTokens.fontMono }}
                >
                  .*
                </Box>{' '}
                with type{' '}
                <Box
                  component='span'
                  sx={{ fontFamily: designTokens.fontMono }}
                >
                  auto
                </Box>{' '}
                to index every field automatically.
              </Typography>
            </Box>
          </Box>
        )}
      </form.AppField>
    );
  },
});
