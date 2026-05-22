import {
  filteredParamKeys,
  NEW_EMPTY_OTHER_PARAM,
  searchParamsFormOpts,
} from '@/constants';
import { usePrevious, withForm } from '@/hooks';
import { getArrayVal, splitIfString } from '@/utils';
import {
  FieldRow,
  fieldChipSx,
  fieldInputSx,
  smallButtonSx,
} from '@/components/redesign';
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
  const formValues = useStore(form.store, (state) => state.values);

  const hasUnsavedChanges = useMemo(() => {
    const currentPresetName = formValues.preset;
    if (!currentPresetName) return false;
    const matched = presets.find((p) => p.name === currentPresetName);
    if (!matched) return true;
    return !isEqual(
      omitPreset(formValues),
      omitPreset(presetToFormValues(matched)),
    );
  }, [formValues, presets]);

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
        const values = presetToFormValues(existingPreset);
        form.setFieldValue('query_by', values.query_by);
        form.setFieldValue('sort_by', values.sort_by);
        form.setFieldValue('facet_by', values.facet_by);
        form.setFieldValue('group_by', values.group_by);
        form.setFieldValue('other_params', values.other_params);
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
                label=''
                options={presetOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Preset',
                  sx: fieldInputSx,
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
                label=''
                multiple
                limitTags={4}
                options={queryByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: fieldChipSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Add field…',
                  sx: fieldInputSx,
                }}
              />
            )}
          </form.AppField>
        </FieldRow>

        <FieldRow label='Sort by'>
          <form.AppField name='sort_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                label=''
                multiple
                limitTags={4}
                options={sortByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: fieldChipSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Add field…',
                  sx: fieldInputSx,
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
                label=''
                multiple
                limitTags={4}
                options={facetByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: fieldChipSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: 'Add field…',
                  sx: fieldInputSx,
                }}
              />
            )}
          </form.AppField>
        </FieldRow>

        <FieldRow label='Group by'>
          <form.AppField name='group_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                label=''
                multiple
                limitTags={4}
                options={groupByOptions}
                slotProps={{
                  paper: { sx: autocompletePaperSx },
                  chip: { size: 'small', sx: fieldChipSx },
                }}
                textFieldProps={{
                  label: undefined,
                  placeholder: '— none —',
                  sx: fieldInputSx,
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
                                sx={fieldInputSx}
                              />
                            )}
                            slotProps={{
                              paper: { sx: autocompletePaperSx },
                              chip: { size: 'small', sx: fieldChipSx },
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
                            sx={{ ...fieldInputSx, flex: 1, minWidth: 0 }}
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
          {hasUnsavedChanges ? (
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

function presetToFormValues(preset: PresetSchema<DocumentSchema>) {
  const { query_by, sort_by, facet_by, group_by, ...rest } = getParams(
    preset.value,
  );
  let otherParams = [NEW_EMPTY_OTHER_PARAM];
  const otherParamsEntries = Object.entries(rest);
  if (otherParamsEntries.length) {
    otherParams = otherParamsEntries.map(([k, v]) => ({
      param: k,
      value: typeof v === 'string' ? v : JSON.stringify(v),
    }));
  }
  return {
    preset: preset.name,
    query_by: getArrayVal(splitIfString(query_by)),
    sort_by: getArrayVal(splitIfString(sort_by)),
    facet_by: getArrayVal(splitIfString(facet_by)),
    group_by: getArrayVal(splitIfString(group_by)),
    other_params: otherParams,
  };
}

function omitPreset<T extends { preset?: unknown }>(values: T) {
  const { preset: _preset, ...rest } = values;
  return rest;
}
