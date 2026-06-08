import { ChipMultiField, smallButtonSx } from '@/components/redesign';
import {
  filteredParamKeys,
  NEW_EMPTY_OTHER_PARAM,
  searchParamsFormOpts,
} from '@/constants';
import { dividerPaperSx as paperSx } from '@/constants/redesignSx';
import { usePrevious, withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { getArrayVal, splitIfString } from '@/utils';
import {
  AddRounded,
  ExpandMoreRounded,
  RemoveRounded,
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

type SearchParamsFormFieldsProps = Parameters<typeof SearchParamsForm>[0];

const sectionLabelSx: SxProps<Theme> = {
  fontSize: 10,
  fontWeight: 600,
  color: designTokens.textFaint,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  mb: 0.5,
};
// TODO: add style as variant ??
const compactInputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: 12.5,
    minHeight: 28,
    py: 0,
    px: '8px',
    borderRadius: '5px',
    fontFamily: designTokens.fontMono,
    '& fieldset': {
      borderColor: designTokens.border,
      transition: 'border-color 120ms ease',
    },
    '&:hover fieldset': { borderColor: designTokens.borderStrong },
    '&.Mui-focused fieldset': {
      borderColor: designTokens.accent,
      borderWidth: '1px',
    },
    '& input': {
      fontSize: 12.5,
      padding: '0 4px !important',
      fontFamily: designTokens.fontMono,
    },
    '& input::placeholder': { color: designTokens.textFaint, opacity: 1 },
    '& .MuiAutocomplete-endAdornment': { right: 4 },
  },
};

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

  const prevPresetValue = usePrevious(formValues.preset);
  useEffect(() => {
    const preset = formValues.preset;
    if (preset && preset !== prevPresetValue) {
      handlePresetChange(preset);
    }
  }, [formValues.preset, prevPresetValue, handlePresetChange]);

  const handleClear = useCallback(() => {
    form.setFieldValue('preset', '');
    form.setFieldValue('query_by', queryByOptions);
    form.setFieldValue('sort_by', []);
    form.setFieldValue('facet_by', []);
    form.setFieldValue('group_by', []);
    form.setFieldValue('other_params', [NEW_EMPTY_OTHER_PARAM]);
  }, [form.setFieldValue, queryByOptions]);

  const queryByValues = useMemo(
    () => (formValues.query_by as string[]).filter(Boolean),
    [formValues.query_by],
  );
  const sortByValues = useMemo(
    () => (formValues.sort_by as string[]).filter(Boolean),
    [formValues.sort_by],
  );
  const facetByValues = useMemo(
    () => (formValues.facet_by as string[]).filter(Boolean),
    [formValues.facet_by],
  );
  const groupByValues = useMemo(
    () => (formValues.group_by as string[]).filter(Boolean),
    [formValues.group_by],
  );

  return (
    <Box>
      {/* Preset row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          mb: 2.5,
          px: 0.25,
        }}
      >
        <StarBorderRounded
          sx={{
            fontSize: 15,
            color: hasUnsavedChanges
              ? designTokens.warning
              : designTokens.textFaint,
            flexShrink: 0,
          }}
        />
        <MuiAutocomplete
          freeSolo
          autoSelect
          options={presetOptions}
          value={formValues.preset || ''}
          onChange={(_, newVal) => {
            form.setFieldValue('preset', (newVal as string) || '');
          }}
          sx={{ flex: 1, minWidth: 0 }}
          renderInput={(params) => (
            <MuiTextField
              {...params}
              placeholder='No preset'
              sx={{
                '& .MuiOutlinedInput-root': {
                  py: 0,
                  px: '4px',
                  '& fieldset': { border: 'none' },
                  '& input': {
                    fontSize: 13,
                    fontFamily: designTokens.fontMono,
                    color: designTokens.text,
                    padding: '2px 4px !important',
                  },
                  '& input::placeholder': {
                    color: designTokens.textFaint,
                    opacity: 1,
                  },
                },
              }}
            />
          )}
          slotProps={{ paper: { sx: paperSx } }}
        />
        {hasUnsavedChanges && (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: designTokens.warningDeep,
              flexShrink: 0,
            }}
          >
            unsaved
          </Typography>
        )}
      </Box>

      <Stack direction='column' spacing={2}>
        {/* QUERY BY */}
        <Box>
          <Typography sx={sectionLabelSx}>Query by</Typography>
          <ChipMultiField
            values={queryByValues}
            options={queryByOptions}
            onAdd={(val) => {
              if (!queryByValues.includes(val))
                form.setFieldValue('query_by', [...queryByValues, val]);
            }}
            onRemove={(i) =>
              form.setFieldValue(
                'query_by',
                queryByValues.filter((_, idx) => idx !== i),
              )
            }
          />
        </Box>

        {/* SORT BY */}
        <Box>
          <Typography sx={sectionLabelSx}>Sort by</Typography>
          <ChipMultiField
            values={sortByValues}
            options={sortByOptions}
            onAdd={(val) => {
              if (!sortByValues.includes(val))
                form.setFieldValue('sort_by', [...sortByValues, val]);
            }}
            onRemove={(i) =>
              form.setFieldValue(
                'sort_by',
                sortByValues.filter((_, idx) => idx !== i),
              )
            }
          />
        </Box>

        {/* FACET & FILTER BY */}
        <Box>
          <Typography sx={sectionLabelSx}>Facet & filter by</Typography>
          <ChipMultiField
            values={facetByValues}
            options={facetByOptions}
            onAdd={(val) => {
              if (!facetByValues.includes(val))
                form.setFieldValue('facet_by', [...facetByValues, val]);
            }}
            onRemove={(i) =>
              form.setFieldValue(
                'facet_by',
                facetByValues.filter((_, idx) => idx !== i),
              )
            }
          />
        </Box>

        {/* GROUP BY */}
        <Box>
          <Typography sx={sectionLabelSx}>Group by</Typography>
          <ChipMultiField
            values={groupByValues}
            options={groupByOptions}
            onAdd={(val) => {
              if (!groupByValues.includes(val))
                form.setFieldValue('group_by', [...groupByValues, val]);
            }}
            onRemove={(i) =>
              form.setFieldValue(
                'group_by',
                groupByValues.filter((_, idx) => idx !== i),
              )
            }
            placeholder='— none —'
          />
        </Box>

        {/* ADDITIONAL */}
        <Box>
          <Typography sx={sectionLabelSx}>Additional</Typography>
          <form.AppField name='other_params' mode='array'>
            {({ state, pushValue, removeValue }) => (
              <Stack direction='column' spacing={0.75}>
                {state.value.map((_, i) => (
                  <Fragment key={`param-${i}`}>
                    <Stack
                      direction='row'
                      spacing={0.75}
                      sx={{ alignItems: 'center' }}
                    >
                      <form.Field name={`other_params[${i}].param`}>
                        {({ state: fState, handleChange, handleBlur }) => (
                          <MuiAutocomplete
                            options={filteredParamKeys}
                            value={fState.value}
                            onChange={(_, newVal: string | null) =>
                              handleChange(newVal || '')
                            }
                            blurOnSelect
                            autoHighlight
                            renderInput={(params) => (
                              <MuiTextField
                                {...params}
                                onBlur={handleBlur}
                                placeholder='Parameter'
                                sx={compactInputSx}
                              />
                            )}
                            slotProps={{ paper: { sx: paperSx } }}
                            popupIcon={
                              <ExpandMoreRounded
                                sx={{
                                  fontSize: 15,
                                  color: designTokens.textFaint,
                                }}
                              />
                            }
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              '& .MuiAutocomplete-popupIndicator': {
                                mr: '-2px',
                              },
                            }}
                          />
                        )}
                      </form.Field>

                      <form.Field name={`other_params[${i}].value`}>
                        {({ state: fState, handleChange, handleBlur }) => (
                          <MuiTextField
                            placeholder='Value'
                            value={fState.value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            size='small'
                            sx={{ ...compactInputSx, width: 80 }}
                          />
                        )}
                      </form.Field>

                      <IconButton
                        onClick={() => removeValue(i)}
                        size='small'
                        disabled={state.value.length <= 1 && i === 0}
                        sx={{
                          width: 24,
                          height: 24,
                          border: `1px solid ${designTokens.border}`,
                          borderRadius: '5px',
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
                        <RemoveRounded sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Stack>
                  </Fragment>
                ))}
                <Box>
                  <Button
                    onClick={() => pushValue(NEW_EMPTY_OTHER_PARAM)}
                    size='small'
                    startIcon={<AddRounded sx={{ fontSize: 13 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: 12.5,
                      fontWeight: 500,
                      height: 28,
                      borderRadius: '5px',
                      border: `1px dashed ${designTokens.border}`,
                      color: designTokens.textMuted,
                      background: 'transparent',
                      boxShadow: 'none',
                      px: 1,
                      '&:hover': {
                        borderColor: designTokens.borderStrong,
                        background: designTokens.surfaceMuted,
                        color: designTokens.text,
                      },
                    }}
                  >
                    Add
                  </Button>
                </Box>
              </Stack>
            )}
          </form.AppField>
        </Box>
      </Stack>

      {/* Footer */}
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
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button onClick={handleClear} variant='outlined' sx={smallButtonSx}>
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
