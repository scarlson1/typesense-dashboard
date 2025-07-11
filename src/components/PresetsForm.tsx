import {
  EMPTY_PRESET_PARAMS,
  multiParameterKeys,
  parameterKeys,
  presetsFormOpts,
  presetType,
} from '@/constants';
import { withForm } from '@/hooks';
import { AddRounded, CloseRounded, RemoveRounded } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Grid,
  IconButton,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';
import { Fragment } from 'react/jsx-runtime';

export const PresetsForm = withForm({
  ...presetsFormOpts,
  props: {
    submitButtonText: 'Submit',
  },
  render: ({ form, submitButtonText }) => {
    return (
      <Stack direction='column' spacing={2} sx={{ alignItems: 'flex-start' }}>
        <form.AppField name='presetId'>
          {({ TextField }) => (
            <TextField
              id='presetId'
              label='Preset Name'
              placeholder='e.g. default_view'
              required
              fullWidth
              variant='outlined'
              sx={{ maxWidth: 300 }}
            />
          )}
        </form.AppField>
        <form.AppField name='presetType'>
          {({ Select }) => (
            <Select
              id='presetType'
              label='Preset Type'
              required
              fullWidth
              variant='outlined'
              options={presetType.options}
              sx={{ maxWidth: 300 }}
            />
          )}
        </form.AppField>

        <Typography variant='subtitle1'>Search Parameters</Typography>

        <form.Subscribe
          selector={(state) => state.values.presetType}
          children={(presetTypeVal) => (
            <>
              {presetTypeVal === presetType.enum['Multi-Search'] ? (
                <form.AppField name='multiSearchParams' mode='array'>
                  {({ state, pushValue, removeValue }) => (
                    <>
                      {state.value.map((_, i) => (
                        <Box
                          key={`multi-searchParam-${i}`}
                          sx={{
                            width: '100%',
                          }}
                        >
                          <Stack
                            direction='row'
                            spacing={2}
                            sx={{
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant='subtitle1'>{`Search ${i}`}</Typography>
                            <IconButton
                              onClick={() => removeValue(i)}
                              size='small'
                              color='error'
                            >
                              <CloseRounded fontSize='inherit' />
                            </IconButton>
                          </Stack>

                          <form.AppField
                            name={`multiSearchParams[${i}]`}
                            mode='array'
                          >
                            {({
                              state: searchState,
                              pushValue: pushParamVal,
                              removeValue: removeParamVal,
                            }) => (
                              <>
                                {searchState.value.map((_, j) => (
                                  <Grid
                                    container
                                    spacing={1.5}
                                    key={`multiSearchParams-[${i}]-[${j}]`}
                                    sx={{ py: 1 }}
                                  >
                                    <Grid size={{ xs: 5 }}>
                                      <form.Field
                                        name={`multiSearchParams[${i}][${j}].name`}
                                      >
                                        {({
                                          state: nameState,
                                          handleChange,
                                          handleBlur,
                                        }) => (
                                          <Autocomplete
                                            disablePortal
                                            options={multiParameterKeys.options}
                                            sx={{ maxWidth: 300 }}
                                            value={nameState.value}
                                            onChange={(
                                              _,
                                              newVal: string | null
                                            ) => handleChange(newVal || '')}
                                            blurOnSelect
                                            renderInput={(params: object) => (
                                              <MuiTextField
                                                {...params}
                                                onBlur={handleBlur}
                                                label='Parameter Name'
                                                required
                                                fullWidth
                                                error={
                                                  nameState.meta.isTouched &&
                                                  !nameState.meta.isValid
                                                }
                                              />
                                            )}
                                            slotProps={{
                                              paper: {
                                                sx: {
                                                  border: (theme) =>
                                                    `1px solid ${theme.palette.divider}`,
                                                },
                                              },
                                            }}
                                          />
                                        )}
                                      </form.Field>
                                    </Grid>
                                    <Grid size={{ xs: 5 }}>
                                      <form.Field
                                        name={`multiSearchParams[${i}][${j}].value`}
                                      >
                                        {({
                                          state: fieldValueState,
                                          handleChange,
                                          handleBlur,
                                        }) => (
                                          <MuiTextField
                                            id={`multiSearchParams[${i}][${j}].value`}
                                            value={fieldValueState.value}
                                            onChange={(e) =>
                                              handleChange(e.target.value)
                                            }
                                            onBlur={handleBlur}
                                            label='Parameter Value'
                                            required
                                            fullWidth
                                            variant='outlined'
                                            error={
                                              fieldValueState.meta.isTouched &&
                                              Boolean(
                                                fieldValueState.meta.errors
                                                  .length
                                              )
                                            }
                                            color={
                                              fieldValueState.meta.errors.length
                                                ? 'error'
                                                : 'primary'
                                            }
                                          />
                                        )}
                                      </form.Field>
                                    </Grid>
                                    <Grid
                                      size={{ xs: 2, md: 1 }}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <IconButton
                                        onClick={() => removeParamVal(j)}
                                        aria-label='remove'
                                        size='small'
                                        color='error'
                                      >
                                        <RemoveRounded fontSize='inherit' />
                                      </IconButton>
                                    </Grid>
                                  </Grid>
                                ))}
                                <IconButton
                                  onClick={() =>
                                    pushParamVal(EMPTY_PRESET_PARAMS)
                                  }
                                  aria-label='add another search parameter'
                                >
                                  <AddRounded />
                                </IconButton>
                              </>
                            )}
                          </form.AppField>
                        </Box>
                      ))}
                      <IconButton
                        onClick={() => pushValue([EMPTY_PRESET_PARAMS])}
                        aria-label='add another search parameter'
                        color='primary'
                      >
                        <AddRounded />
                      </IconButton>
                    </>
                  )}
                </form.AppField>
              ) : (
                <form.AppField name='searchParameters' mode='array'>
                  {({ state, pushValue, removeValue }) => (
                    <Box
                      sx={{
                        width: '100%',
                      }}
                    >
                      <Grid container spacing={1.5}>
                        {state.value.map((_, i) => (
                          <Fragment key={`searchParam-${i}`}>
                            <Grid size={{ xs: 5, sm: 4 }}>
                              <form.Field name={`searchParameters[${i}].name`}>
                                {({ state, handleChange, handleBlur }) => (
                                  <Autocomplete
                                    disablePortal
                                    options={parameterKeys.options}
                                    sx={{ maxWidth: 300 }}
                                    value={state.value}
                                    onChange={(_, newVal: string | null) =>
                                      handleChange(newVal || '')
                                    }
                                    blurOnSelect
                                    autoHighlight
                                    autoSelect
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
                                    }}
                                  />
                                )}
                              </form.Field>
                            </Grid>
                            <Grid size={{ xs: 5, sm: 6 }}>
                              <form.Field name={`searchParameters[${i}].value`}>
                                {({ state, handleChange, handleBlur }) => (
                                  <MuiTextField
                                    id={`searchParameters[${i}].value`}
                                    value={state.value}
                                    onChange={(e) =>
                                      handleChange(e.target.value)
                                    }
                                    onBlur={handleBlur}
                                    label='Parameter Value'
                                    required
                                    fullWidth
                                    variant='outlined'
                                    error={
                                      state.meta.isTouched &&
                                      !state.meta.isValid
                                    }
                                    color={
                                      state.meta.errors.length
                                        ? 'error'
                                        : 'primary'
                                    }
                                  />
                                )}
                              </form.Field>
                            </Grid>

                            <Grid
                              size={{ xs: 2, md: 1 }}
                              sx={{ display: 'flex', alignItems: 'center' }}
                            >
                              <IconButton
                                onClick={() => removeValue(i)}
                                aria-label='remove'
                                size='small'
                                color='error'
                              >
                                <RemoveRounded fontSize='inherit' />
                              </IconButton>
                            </Grid>
                          </Fragment>
                        ))}
                        <Grid size={{ xs: 12 }}>
                          <IconButton
                            onClick={() => pushValue(EMPTY_PRESET_PARAMS)}
                            aria-label='add another search parameter'
                            color='primary'
                          >
                            <AddRounded />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </form.AppField>
              )}
            </>
          )}
        />

        <form.AppForm>
          <form.SubmitButton label={submitButtonText} />
        </form.AppForm>
      </Stack>
    );
  },
});
