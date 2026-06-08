import { NumberSpinner } from '@/components/forms/NumberSpinner';
import { primaryButtonSx } from '@/components/redesign';
import {
  analyticsFormOpts,
  analyticsRuleV1UiConfig,
  analyticsV1RuleTypes,
  collectionQueryKeys,
} from '@/constants';
import { useTypesenseClient, withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { AddRounded, CloseRounded } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
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
  },
};

const COUNTER_EVENT_TYPES = ['click', 'conversion', 'visit'] as const;

export const AnalyticsRuleForm = withForm({
  ...analyticsFormOpts,
  props: {
    sourceOptions: [''],
    destinationOptions: [''],
    submitButtonText: 'Add rule',
  },
  render: function AnalyticsRuleFormV29({
    form,
    sourceOptions,
    destinationOptions,
    submitButtonText,
  }) {
    const [client, clusterId] = useTypesenseClient();

    const destinationCollection = useStore(
      form.store,
      (s) => s.values.params.destination.collection,
    );

    const {
      data: colSchema,
      isPending,
      isEnabled,
      isError,
      error,
    } = useQuery({
      queryKey: collectionQueryKeys.schema(clusterId, destinationCollection),
      queryFn: () =>
        client.collections(destinationCollection as string).retrieve(),
      enabled: Boolean(destinationCollection),
    });
    const counterFieldNames = colSchema?.fields
      .filter((f) => ['int32', 'int64', 'float'].includes(f.type))
      .map((f) => f.name);

    const ruleType = useStore(form.store, (state) => state.values.type);
    const uiConfig =
      analyticsRuleV1UiConfig[
        ruleType as 'popular_queries' | 'nohits_queries' | 'counter'
      ];
    const showFields = uiConfig?.showFields ?? [];
    const isCounter = ruleType === 'counter';

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
              {analyticsV1RuleTypes.map((t) => {
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

        {/* Limit — query-aggregation types only */}
        {showFields.includes('limit') && (
          <>
            <Typography sx={labelSx}>Limit</Typography>
            <form.AppField name='params.limit'>
              {({ state, handleChange, handleBlur }) => (
                <NumberSpinner
                  onValueChange={(val) => {
                    handleChange(val ?? 1);
                  }}
                  onBlur={handleBlur}
                  min={1}
                  max={10000}
                  step={100}
                  value={state.value}
                  size='small'
                  error={!state.meta.isValid}
                />
              )}
            </form.AppField>
          </>
        )}

        {/* Counter-only: counter_field */}
        {isCounter && (
          <>
            <Typography sx={labelSx}>Counter field</Typography>
            <form.AppField name='params.destination.counter_field'>
              {({ state, handleChange, handleBlur }) => (
                <MuiTextField
                  value={state.value ?? ''}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder='popularity'
                  fullWidth
                  size='small'
                  required
                  sx={compactInputSx}
                  select
                  helperText={
                    isError
                      ? (error?.message ?? 'failed to load schema')
                      : !isPending && !counterFieldNames?.length
                        ? 'int32 field required'
                        : 'int32 destination field to increment'
                  }
                  slotProps={{
                    input: {
                      endAdornment:
                        isPending && isEnabled ? (
                          <CircularProgress size={16} />
                        ) : undefined,
                    },
                    formHelperText: {
                      sx: {
                        fontSize: '0.65rem',
                        lineHeight: 1.3,
                      },
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

            {/* Counter-only: source.events[] array editor */}
            <Typography sx={labelSx}>Events</Typography>

            <form.Field name='params.source.events' mode='array'>
              {(field: any) => (
                <Stack spacing={1}>
                  {(field.state.value ?? []).map((_: unknown, i: number) => (
                    <Stack
                      key={i}
                      direction='row'
                      spacing={1}
                      useFlexGap
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <form.AppField name={`params.source.events[${i}].type`}>
                        {({ state, handleChange }) => (
                          <MuiTextField
                            select
                            size='small'
                            value={state.value ?? 'click'}
                            onChange={(e) => handleChange(e.target.value)}
                            sx={{ ...compactInputSx, minWidth: 100 }}
                          >
                            {COUNTER_EVENT_TYPES.map((o) => (
                              <MenuItem key={o} value={o}>
                                {o}
                              </MenuItem>
                            ))}
                          </MuiTextField>
                        )}
                      </form.AppField>

                      <form.AppField name={`params.source.events[${i}].name`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiTextField
                            value={state.value ?? ''}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            placeholder='event_name'
                            size='small'
                            fullWidth
                            sx={compactInputSx}
                          />
                        )}
                      </form.AppField>

                      <form.AppField name={`params.source.events[${i}].weight`}>
                        {({ state, handleChange }) => (
                          <NumberSpinner
                            label='Weight'
                            min={0}
                            value={state.value ?? 1}
                            size='small'
                            onValueChange={(val) => handleChange(val ?? 1)}
                            labelProps={{
                              sx: labelSx,
                            }}
                          />
                        )}
                      </form.AppField>

                      <IconButton
                        size='small'
                        aria-label='remove event'
                        onClick={() => field.removeValue(i)}
                        color='error'
                      >
                        <CloseRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  ))}

                  <Button
                    type='button'
                    size='small'
                    startIcon={<AddRounded sx={{ fontSize: 14 }} />}
                    onClick={() =>
                      field.pushValue({ type: 'click', weight: 1, name: '' })
                    }
                    sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                  >
                    add event
                  </Button>
                </Stack>
              )}
            </form.Field>
          </>
        )}

        {/* Checkboxes — query-aggregation types only */}
        {(showFields.includes('expand_query') ||
          showFields.includes('enable_auto_aggregation')) && (
          <Stack direction='row' spacing={2} sx={{ mt: 1.5, mb: 1.75 }}>
            {showFields.includes('expand_query') && (
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
                        sx: { fontSize: 12, color: designTokens.textMuted },
                      },
                    }}
                  />
                )}
              </form.Field>
            )}
            {showFields.includes('enable_auto_aggregation') && (
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
                        sx: { fontSize: 12, color: designTokens.textMuted },
                      },
                    }}
                  />
                )}
              </form.Field>
            )}
          </Stack>
        )}

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
                sx={{ ...primaryButtonSx, height: 36, mt: 2 }}
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
