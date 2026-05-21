import {
  filteredParamKeys,
  NEW_EMPTY_OTHER_PARAM,
  searchParamsFormOpts,
} from '@/constants';
import { usePrevious, withForm } from '@/hooks';
import { getArrayVal, splitIfString } from '@/utils';
import { smallButtonSx } from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import {
  AddRounded,
  RemoveRounded,
  SearchRounded,
  StarBorderRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Autocomplete as MuiAutocomplete,
  TextField as MuiTextField,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { isEqual } from 'lodash-es';
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import type {
  DocumentSchema,
  SearchParams,
} from 'typesense/lib/Typesense/Documents';
import type { MultiSearchRequestsSchema } from 'typesense/lib/Typesense/MultiSearch';
import type { PresetSchema } from 'typesense/lib/Typesense/Preset';

const LABEL_COL_WIDTH = 184;

const inputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.paper',
    fontSize: 13,
    minHeight: 36,
    py: '3px',
    px: '8px',
    borderRadius: '6px',
    '& fieldset': {
      borderColor: designTokens.border,
      transition: 'border-color 120ms ease',
    },
    '&:hover fieldset': {
      borderColor: designTokens.borderStrong,
    },
    '&.Mui-focused fieldset': {
      borderColor: designTokens.accent,
      borderWidth: 1,
    },
    '& input': {
      fontSize: 13,
      padding: '4px 4px !important',
      fontFamily: designTokens.fontMono,
    },
    '& input::placeholder': {
      color: designTokens.textFaint,
      opacity: 1,
    },
  },
};

const chipSlotSx: SxProps<Theme> = {
  height: 22,
  fontSize: 12,
  fontFamily: designTokens.fontMono,
  background: designTokens.surfaceMuted,
  border: `1px solid ${designTokens.border}`,
  borderRadius: '4px',
  color: designTokens.text,
  '& .MuiChip-deleteIcon': {
    fontSize: 14,
    color: designTokens.textFaint,
    '&:hover': { color: designTokens.text },
  },
};

interface FieldRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  align?: 'center' | 'flex-start';
}

function FieldRow({
  label,
  description,
  children,
  align = 'flex-start',
}: FieldRowProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 3 }}
      sx={{ alignItems: { xs: 'stretch', sm: align } }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: LABEL_COL_WIDTH },
          flexShrink: 0,
          pt: { xs: 0, sm: 0.875 },
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: designTokens.text,
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
        {description ? (
          <Typography
            sx={{
              fontSize: 12,
              color: designTokens.textMuted,
              lineHeight: 1.4,
              mt: 0.375,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

type SearchParamsFormFieldsProps = Parameters<typeof SearchParamsForm>[0];

const SearchParamsFormFields = ({
  form,
  presets,
  queryByOptions,
  sortByOptions,
  facetByOptions,
  groupByOptions,
  submitButtonText,
}: SearchParamsFormFieldsProps) => {
  const presetOptions = useMemo(() => presets.map((p) => p.name), [presets]);
  const isDirty = useStore(form.store, (state) => state.isDirty);

  const prevQueryByOptions = usePrevious(queryByOptions);
  useEffect(() => {
    if (prevQueryByOptions && !isEqual(queryByOptions, prevQueryByOptions)) {
      form.setFieldValue('query_by', queryByOptions);
    }
  }, [queryByOptions, prevQueryByOptions]);

  const handlePresetChange = useCallback(
    (newVal: string) => {
      const existingPreset = presets.find((p) => p.name === newVal);
      if (existingPreset) {
        const { query_by, sort_by, facet_by, group_by, ...rest } = getParams(
          existingPreset.value,
        );

        form.setFieldValue('query_by', getArrayVal(splitIfString(query_by)));
        form.setFieldValue('sort_by', getArrayVal(splitIfString(sort_by)));
        form.setFieldValue('facet_by', getArrayVal(splitIfString(facet_by)));
        form.setFieldValue('group_by', getArrayVal(splitIfString(group_by)));

        let otherParams = [NEW_EMPTY_OTHER_PARAM];
        const otherParamsEntries = Object.entries(rest);
        if (otherParamsEntries.length) {
          otherParams = otherParamsEntries.map(([k, v]) => ({
            param: k,
            value: typeof v === 'string' ? v : JSON.stringify(v),
          }));
        }
        form.setFieldValue('other_params', otherParams);
      }
    },
    [presets],
  );

  const handleClear = useCallback(() => {
    form.setFieldValue('preset', '');
    form.setFieldValue('query_by', queryByOptions);
    form.setFieldValue('sort_by', []);
    form.setFieldValue('facet_by', []);
    form.setFieldValue('group_by', []);
    form.setFieldValue('other_params', [NEW_EMPTY_OTHER_PARAM]);
  }, [form.setFieldValue, queryByOptions]);

  const autocompletePaperSx = {
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  };

  return (
    <Box>
      <Stack direction='column' spacing={2.25}>
        <FieldRow
          label='Preset'
          description='Press "esc" to dismiss the dropdown.'
        >
          <form.AppField
            name='preset'
            listeners={{
              onChange: ({ value }) => {
                handlePresetChange(value);
              },
            }}
          >
            {({ Autocomplete }) => (
              <Autocomplete
                freeSolo
                autoSelect
                disablePortal
                label=''
                options={presetOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Preset',
                  sx: inputSx,
                  slotProps: {
                    input: {
                      type: 'search',
                      startAdornment: (
                        <SearchRounded
                          sx={{
                            fontSize: 16,
                            color: designTokens.textFaint,
                            ml: 0.5,
                            mr: 0.25,
                          }}
                        />
                      ),
                    },
                  },
                }}
              />
            )}
          </form.AppField>
        </FieldRow>

        <FieldRow
          label='Query by'
          description='Fields searched at query time. Order = priority.'
        >
          <form.AppField name='query_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label=''
                multiple
                limitTags={4}
                options={queryByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: chipSlotSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Add field…',
                  sx: inputSx,
                }}
              />
            )}
          </form.AppField>
        </FieldRow>

        <FieldRow label='Sort by'>
          <form.AppField name='sort_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label=''
                multiple
                limitTags={4}
                options={sortByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: chipSlotSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Add field…',
                  sx: inputSx,
                }}
              />
            )}
          </form.AppField>
        </FieldRow>

        <FieldRow
          label='Facet & filter by'
          description='Fields exposed as refinements in the right panel.'
        >
          <form.AppField name='facet_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label=''
                multiple
                limitTags={4}
                options={facetByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: chipSlotSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Add field…',
                  sx: inputSx,
                }}
              />
            )}
          </form.AppField>
        </FieldRow>

        <FieldRow label='Group by'>
          <form.AppField name='group_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label=''
                multiple
                limitTags={4}
                options={groupByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: chipSlotSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: '— none —',
                  sx: inputSx,
                }}
              />
            )}
          </form.AppField>
        </FieldRow>

        <FieldRow label='Additional parameters'>
          <form.AppField name='other_params' mode='array'>
            {({ state, pushValue, removeValue }) => (
              <Stack direction='column' spacing={1}>
                {state.value.map((_, i) => (
                  <Fragment key={`param-${i}`}>
                    <Stack
                      direction='row'
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
                      <form.Field name={`other_params[${i}].param`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiAutocomplete
                            disablePortal
                            options={filteredParamKeys}
                            sx={{ flex: 1, minWidth: 0 }}
                            value={state.value}
                            onChange={(_, newVal: string | null) =>
                              handleChange(newVal || '')
                            }
                            blurOnSelect
                            autoHighlight
                            renderInput={(params) => (
                              <MuiTextField
                                {...params}
                                onBlur={handleBlur}
                                placeholder='Parameter name'
                                sx={inputSx}
                              />
                            )}
                            slotProps={{
                              paper: { sx: autocompletePaperSx },
                              chip: { size: 'small', sx: chipSlotSx },
                            }}
                          />
                        )}
                      </form.Field>

                      <form.Field name={`other_params[${i}].value`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiTextField
                            id={`other_params[${i}].value`}
                            placeholder='Param value'
                            value={state.value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            sx={{ ...inputSx, flex: 1, minWidth: 0 }}
                            error={state.meta.isTouched && !state.meta.isValid}
                            color={
                              state.meta.errors.length ? 'error' : 'primary'
                            }
                          />
                        )}
                      </form.Field>
                      <IconButton
                        onClick={() => removeValue(i)}
                        size='small'
                        disabled={state.value.length <= 1 && i === 0}
                        sx={{
                          width: 28,
                          height: 28,
                          border: `1px solid ${designTokens.border}`,
                          borderRadius: '6px',
                          color: designTokens.danger,
                          '&:hover': {
                            background: designTokens.dangerSoft,
                            borderColor: designTokens.danger,
                          },
                          '&.Mui-disabled': {
                            color: designTokens.textFaint,
                            opacity: 0.5,
                          },
                        }}
                      >
                        <RemoveRounded sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  </Fragment>
                ))}
                <Box>
                  <Button
                    onClick={() => pushValue(NEW_EMPTY_OTHER_PARAM)}
                    size='small'
                    startIcon={<AddRounded sx={{ fontSize: 14 }} />}
                    sx={{
                      ...smallButtonSx,
                      border: `1px dashed ${designTokens.border}`,
                      color: designTokens.textMuted,
                      background: 'transparent',
                      boxShadow: 'none',
                      px: 1.25,
                      '&:hover': {
                        borderColor: designTokens.borderStrong,
                        background: designTokens.surfaceMuted,
                        color: designTokens.text,
                      },
                    }}
                  >
                    Add parameter
                  </Button>
                </Box>
              </Stack>
            )}
          </form.AppField>
        </FieldRow>
      </Stack>

      <Box
        sx={{
          mx: { xs: -2, sm: -2.75 },
          mt: 3,
          mb: -2.5,
          px: { xs: 2, sm: 2.75 },
          py: 1.5,
          borderTop: `1px solid ${designTokens.border}`,
          background: designTokens.surfaceTinted,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Stack
          direction='row'
          spacing={1}
          sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}
        >
          {isDirty ? (
            <>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: designTokens.warning,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{ fontSize: 12, color: designTokens.textMuted }}
              >
                unsaved changes
              </Typography>
            </>
          ) : null}
        </Stack>
        <Button
          onClick={handleClear}
          variant='outlined'
          sx={smallButtonSx}
        >
          Clear
        </Button>
        <form.AppForm>
          <form.SubmitButton
            label={submitButtonText}
            startIcon={<StarBorderRounded sx={{ fontSize: 14 }} />}
          />
        </form.AppForm>
      </Box>
    </Box>
  );
};

export const SearchParamsForm = withForm({
  ...searchParamsFormOpts,
  props: {
    presets: [] as PresetSchema<DocumentSchema>[],
    queryByOptions: [] as string[],
    sortByOptions: [] as string[],
    facetByOptions: [] as string[],
    groupByOptions: [] as string[],
    submitButtonText: 'Save as preset',
  },
  render: (props) => <SearchParamsFormFields {...props} />,
});

function getParams<T extends DocumentSchema = DocumentSchema>(
  val: PresetSchema<T>['value'],
) {
  if ((val as MultiSearchRequestsSchema<T, string>).searches !== undefined)
    return (val as MultiSearchRequestsSchema<T, string>).searches[0];
  return val as SearchParams<T>;
}
