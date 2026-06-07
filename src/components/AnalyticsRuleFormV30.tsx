import { NumberSpinner } from '@/components/forms/NumberSpinner';
import { primaryButtonSx } from '@/components/redesign';
import {
  analyticsEventType,
  analyticsFormOptsV30,
  analyticsRuleType,
  collectionQueryKeys,
} from '@/constants';
import { useTypesenseClient, withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { AddRounded } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';

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

export const AnalyticsRuleFormV30 = withForm({
  ...analyticsFormOptsV30,
  props: {
    sourceOptions: [''],
    destinationOptions: [''],
    submitButtonText: 'Add rule',
  },
  render: function AnalyticsFormComponent({
    form,
    sourceOptions,
    destinationOptions,
    submitButtonText,
  }) {
    const [client, clusterId] = useTypesenseClient();
    const {
      data: colSchema,
      isPending,
      isEnabled,
      isError,
      error,
    } = useQuery({
      queryKey: collectionQueryKeys.schema(
        clusterId,
        form.getFieldValue('collection'),
      ),
      queryFn: () =>
        client
          .collections(form.getFieldValue('collection') as string)
          .retrieve(),
      enabled: Boolean(form.getFieldValue('collection')),
    });

    const ruleType = useStore(form.store, (state) => state.values.type);

    // const hideExtraFields = ruleType === 'counter' || ruleType === 'log';

    const isCounterOrLogs = ruleType === 'counter' || ruleType === 'log';

    const counterFieldNames = colSchema?.fields
      .filter((f) => f.type === 'int32')
      .map((f) => f.name);

    return (
      <Box>
        {/* Rule type grid */}
        <Typography sx={labelSx}>Rule type</Typography>
        <form.Field
          name='type'
          listeners={{
            onChange: ({ value }) => {
              // https://github.com/TanStack/form/issues/1874
              // Clear submit errors for the now-irrelevant field
              if (value === 'log' || value === 'counter') {
                form.setFieldMeta('params.limit', (prev) => ({
                  ...prev,
                  errorMap: { ...prev.errorMap, onSubmit: undefined },
                  errorSourceMap: {
                    ...prev.errorSourceMap,
                    onSubmit: undefined,
                  },
                }));
                form.setFieldMeta('params.meta_fields', (prev) => ({
                  ...prev,
                  errorMap: { ...prev.errorMap, onSubmit: undefined },
                  errorSourceMap: {
                    ...prev.errorSourceMap,
                    onSubmit: undefined,
                  },
                }));
                form.setFieldMeta('params.expand_query', (prev) => ({
                  ...prev,
                  errorMap: { ...prev.errorMap, onSubmit: undefined },
                  errorSourceMap: {
                    ...prev.errorSourceMap,
                    onSubmit: undefined,
                  },
                }));
              }
            },
          }}
        >
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
        <form.Field name='collection'>
          {({ state, handleChange, handleBlur }: any) => (
            <Autocomplete
              freeSolo
              options={sourceOptions}
              size='small'
              value={state.value}
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
        <form.Field name='params.destination_collection'>
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

        {/* Event type */}
        {/* <Stack direction='row' spacing={{ xs: 1, sm: 1.5, md: 2 }}> */}
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
        {/* </Stack> */}

        {!isCounterOrLogs ? (
          <Stack direction='column' spacing={1} sx={{ mt: 1, mb: 1.5 }}>
            {/* Limit */}
            {/* <form.Subscribe
            selector={(state) => state.values.type}
            children={(ruleType) => {
              const hide = ruleType === 'counter' || ruleType === 'log';

              if (hide) return null;

              return ( */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelSx}>Limit</Typography>
              <form.AppField name='params.limit'>
                {({ state, handleChange, handleBlur }) => (
                  <NumberSpinner
                    // label=""

                    onValueChange={(val) => {
                      // console.log('onValueChange: ', val, rest);
                      handleChange(val ?? 1);
                    }}
                    onBlur={handleBlur}
                    // onValueCommitted
                    min={1}
                    max={10000}
                    step={100}
                    value={state.value}
                    size='small'
                    error={!state.meta.isValid}
                  />
                  // <MuiTextField
                  //   value={state.value}
                  //   onChange={(e) => handleChange(e.target.value)}
                  //   onBlur={handleBlur}
                  //   placeholder='1000'
                  //   fullWidth
                  //   size='small'
                  //   sx={compactInputSx}
                  //   // disabled={ruleType === 'counter' || ruleType === 'log'}
                  // />
                )}
              </form.AppField>
            </Box>
            {/*      );
             }}
           /> */}

            {/* <form.Subscribe
            selector={(state) => state.values.type}
            children={(ruleType) => {
              const hide = ruleType === 'counter' || ruleType === 'log';

              if (hide) return null;

              return ( */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelSx}>Meta Fields</Typography>
              <form.AppField name='params.meta_fields'>
                {({ state, handleChange, handleBlur }) => {
                  const hasFilterBy =
                    colSchema?.fields.some((f) => f.name === 'analytics_tag') &&
                    colSchema?.fields.find((f) => f.name === 'analytics_tag')
                      ?.type === 'string';

                  const hasAnalyticsTag =
                    colSchema?.fields.some((f) => f.name === 'analytics_tag') &&
                    colSchema?.fields.find((f) => f.name === 'analytics_tag')
                      ?.type === 'string';

                  const disabled = !(hasFilterBy || hasAnalyticsTag);

                  return (
                    <MuiTextField
                      value={state.value}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        const val =
                          typeof newVal === 'string'
                            ? newVal.split(',')
                            : (newVal as string[]);
                        handleChange(val);
                      }}
                      onBlur={handleBlur}
                      fullWidth
                      size='small'
                      sx={compactInputSx}
                      select
                      error={isError}
                      disabled={disabled}
                      helperText={
                        isError
                          ? (error?.message ?? 'failed to load schema')
                          : undefined
                      }
                      slotProps={{
                        select: {
                          multiple: true,
                        },
                        input: {
                          endAdornment:
                            isPending && isEnabled ? (
                              <CircularProgress size={16} />
                            ) : undefined,
                        },
                      }}
                    >
                      <MenuItem value=''>--</MenuItem>
                      <MenuItem value='filter_by' disabled={!hasFilterBy}>
                        filter_by
                      </MenuItem>
                      <MenuItem
                        value='analytics_tag'
                        disabled={!hasAnalyticsTag}
                      >
                        analytics_tag
                      </MenuItem>
                    </MuiTextField>
                  );
                }}
              </form.AppField>
            </Box>
            {/* );
            }}
          /> */}
          </Stack>
        ) : null}

        {ruleType === 'counter' ? (
          <Stack direction='row' spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelSx}>Counter Field</Typography>
              <form.AppField name='params.counter_field'>
                {({ state, handleChange, handleBlur }) => (
                  <MuiTextField
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    fullWidth
                    size='small'
                    sx={compactInputSx}
                    select
                    error={
                      isError || (!isPending && !counterFieldNames?.length)
                    }
                    required={ruleType === 'counter'}
                    helperText={
                      isError
                        ? (error?.message ?? 'failed to load schema')
                        : !isPending && !counterFieldNames?.length
                          ? 'int32 field required'
                          : undefined
                    }
                    slotProps={{
                      input: {
                        endAdornment:
                          isPending && isEnabled ? (
                            <CircularProgress size={16} />
                          ) : undefined,
                      },
                    }}
                  >
                    <MenuItem value=''>--</MenuItem>
                    {counterFieldNames?.map((o) => (
                      <MenuItem value={o} key={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </MuiTextField>
                )}
              </form.AppField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelSx}>Weight</Typography>
              <form.AppField name='params.weight'>
                {({ state, handleChange, handleBlur }) => (
                  <NumberSpinner
                    // label=""
                    min={1}
                    onValueChange={(val) => {
                      // console.log('onValueChange: ', val, rest);
                      handleChange(val ?? 1);
                    }}
                    onBlur={handleBlur}
                    // onValueCommitted
                    // max={40}
                    value={state.value}
                    size='small'
                    error={!state.meta.isValid}
                    // required={ruleType === 'counter'}
                  />
                )}
              </form.AppField>
            </Box>
          </Stack>
        ) : null}

        {/* Checkboxes */}
        {!isCounterOrLogs ? (
          // <form.Subscribe
          // selector={(state) => state.values.type}
          // children={(ruleType) => {
          //   const hide = ruleType === 'counter' || ruleType === 'log';

          //   if (hide) return null;

          //   return (
          <form.Field name='params.expand_query'>
            {({ state, handleChange }: any) => (
              <Box sx={{ mb: 1 }}>
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
                  // disabled={ruleType === 'counter' || ruleType === 'log'}
                  slotProps={{
                    typography: {
                      sx: {
                        fontSize: 12,
                        color: designTokens.textMuted,
                      },
                    },
                  }}
                  sx={{ ml: 0 }}
                />
              </Box>
            )}
          </form.Field>
        ) : //     );
        //   }}
        // />
        null}

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
                sx={{ ...primaryButtonSx, height: 36, mt: { xs: 1, md: 2 } }}
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
