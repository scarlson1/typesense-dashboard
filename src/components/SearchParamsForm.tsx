import {
  filteredParamKeys,
  NEW_EMPTY_OTHER_PARAM,
  searchParamsFormOpts,
} from '@/constants';
import { usePrevious, withForm } from '@/hooks';
import { getArrayVal, splitIfString } from '@/utils';
import { AddRounded, RemoveRounded } from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  Link,
  Autocomplete as MuiAutocomplete,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';
import { isEqual } from 'lodash-es';
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import type { SearchParams } from 'typesense/lib/Typesense/Documents';
import type { MultiSearchRequestsSchema } from 'typesense/lib/Typesense/MultiSearch';
import type { PresetSchema } from 'typesense/lib/Typesense/Preset';

export const SearchParamsForm = withForm({
  ...searchParamsFormOpts,
  props: {
    presets: [] as PresetSchema[],
    queryByOptions: [] as string[],
    sortByOptions: [] as string[],
    facetByOptions: [] as string[],
    groupByOptions: [] as string[],
    submitButtonText: 'Save as Preset',
  },
  render: ({
    form,
    presets,
    queryByOptions,
    sortByOptions,
    facetByOptions,
    groupByOptions,
    submitButtonText,
  }) => {
    const presetOptions = useMemo(() => presets.map((p) => p.name), [presets]);

    // reset query by when options change or when collectionId changes ??
    const prevQueryByOptions = usePrevious(queryByOptions);
    useEffect(() => {
      if (prevQueryByOptions && !isEqual(queryByOptions, prevQueryByOptions)) {
        form.setFieldValue('query_by', queryByOptions);
      }
    }, [queryByOptions, prevQueryByOptions]);

    const handlePresetChange = useCallback(
      (newVal: string) => {
        let existingPreset = presets.find((p) => p.name === newVal);
        if (existingPreset) {
          const { query_by, sort_by, facet_by, filter_by, group_by, ...rest } =
            getParams(existingPreset.value);

          form.setFieldValue('query_by', getArrayVal(splitIfString(query_by)));
          form.setFieldValue('sort_by', getArrayVal(splitIfString(sort_by)));
          form.setFieldValue(
            'facet_by',
            getArrayVal(splitIfString(facet_by))
            // uniqueArr([
            //   ...getArrayVal(splitIfString(facet_by)),
            //   ...getArrayVal(splitIfString(filter_by)),
            // ])
          );
          form.setFieldValue('group_by', getArrayVal(splitIfString(group_by)));

          let otherParams = [NEW_EMPTY_OTHER_PARAM];
          let otherParamsEntries = Object.entries(rest);
          if (otherParamsEntries.length) {
            otherParams = otherParamsEntries.map(([k, v]) => ({
              param: k,
              value: typeof v === 'string' ? v : JSON.stringify(v),
            }));
          }
          form.setFieldValue('other_params', otherParams);
        }
      },
      [presets]
    );

    return (
      <Grid container columnSpacing={3} rowSpacing={3}>
        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }} component='div'>
            <Link
              href='https://typesense.org/docs/29.0/api/search.html#presets'
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
            >
              Preset
            </Link>
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
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
                label='Preset'
                options={presetOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                }}
                textFieldProps={{
                  slotProps: {
                    input: {
                      type: 'search',
                    },
                  },
                  helperText: 'press "esc" key to avoid selecting from menu',
                }}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }} component='div'>
            <Link
              href='https://typesense.org/docs/29.0/api/search.html#query-parameters'
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
            >
              Query By
            </Link>
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='query_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Query By'
                multiple
                limitTags={4}
                options={queryByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }} component='div'>
            <Link
              href='https://typesense.org/docs/29.0/api/search.html#ranking-and-sorting-parameters'
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
            >
              Sort By
            </Link>
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='sort_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Sort By'
                multiple
                limitTags={4}
                options={sortByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }} component='div'>
            <Link
              href='https://typesense.org/docs/29.0/api/search.html#faceting-parameters'
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
            >
              Facet
            </Link>{' '}
            &{' '}
            <Link
              href='https://typesense.org/docs/29.0/api/search.html#filter-parameters'
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
            >
              Filter By
            </Link>
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='facet_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Facet & Filter By'
                multiple
                limitTags={4}
                options={facetByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }} component='div'>
            <Link
              href='https://typesense.org/docs/29.0/api/search.html#grouping-parameters'
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
            >
              Group By
            </Link>
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='group_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Group By'
                multiple
                limitTags={4}
                options={groupByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}
        >
          <Typography sx={{ textAlign: 'right', mt: 1 }} component='div'>
            Additional Parameters
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='other_params' mode='array'>
            {({ state, pushValue, removeValue }) => (
              <Stack direction='column' spacing={2}>
                {state.value.map((_, i) => (
                  <Fragment key={`param-${i}`}>
                    <Stack direction='row' spacing={2}>
                      <form.Field name={`other_params[${i}].param`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiAutocomplete
                            disablePortal
                            options={filteredParamKeys}
                            sx={{ minWidth: 180, maxWidth: 300 }}
                            value={state.value}
                            onChange={(_, newVal: string | null) =>
                              handleChange(newVal || '')
                            }
                            blurOnSelect
                            autoHighlight
                            renderInput={(params: object) => (
                              <MuiTextField
                                {...params}
                                onBlur={handleBlur}
                                label='Parameter Name'
                              />
                            )}
                            slotProps={{
                              paper: {
                                sx: {
                                  border: (theme) =>
                                    `1px solid ${theme.palette.divider}`,
                                },
                              },
                              chip: { size: 'small' },
                            }}
                          />
                        )}
                      </form.Field>

                      <form.Field name={`other_params[${i}].value`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiTextField
                            id={`other_params[${i}].value`}
                            label='Param Value'
                            placeholder='e.g. 1,4,8'
                            value={state.value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            fullWidth
                            variant='outlined'
                            sx={{ maxWidth: 300 }}
                            error={state.meta.isTouched && !state.meta.isValid}
                            color={
                              state.meta.errors.length ? 'error' : 'primary'
                            }
                          />
                        )}
                      </form.Field>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}
                      >
                        <IconButton
                          onClick={() => removeValue(i)}
                          size='small'
                          color='error'
                          disabled={state.value.length <= 1 && i === 0}
                        >
                          <RemoveRounded fontSize='inherit' />
                        </IconButton>
                      </Box>
                    </Stack>
                  </Fragment>
                ))}
                <Box>
                  <IconButton
                    onClick={() => pushValue(NEW_EMPTY_OTHER_PARAM)}
                    size='small'
                    color='primary'
                  >
                    <AddRounded fontSize='inherit' />
                  </IconButton>
                </Box>
              </Stack>
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12 }}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <form.AppForm>
            <form.SubmitButton label={submitButtonText} />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});

function getParams(val: PresetSchema['value']) {
  // TODO: handle multi-index
  if ((val as MultiSearchRequestsSchema).searches !== undefined)
    return (val as MultiSearchRequestsSchema).searches[0];
  return val as SearchParams;
}
