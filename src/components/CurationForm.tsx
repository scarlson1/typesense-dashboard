import { overrideFormOpts, overrideQueryMatch } from '@/constants';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { primaryButtonSx } from '@/components/redesign';
import { CheckRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Skeleton,
  Stack,
  Switch,
  TextField as MuiTextField,
  Typography,
} from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { Suspense, useEffect, useState } from 'react';

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
    '& input::placeholder': {
      color: designTokens.textMuted,
      opacity: 1,
    },
  },
};

const switchRowSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  py: 0.5,
};

const switchLabelSx = {
  fontSize: 12,
  color: designTokens.text,
  fontWeight: 500,
};

export const CurationForm = withForm({
  ...overrideFormOpts,
  props: {
    submitButtonText: 'Save override',
  },
  render: function CurationFormComponent({ form, submitButtonText }) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const bools = useStore(form.store, (state) => ({
      rule_query_bool: state.values.rule_query_bool,
      rule_filter_bool: state.values.rule_filter_bool,
      rule_tags_bool: state.values.rule_tags_bool,
      rule_match: state.values.rule.match,
      filter_by_bool: state.values.filter_by_bool,
      sort_by_bool: state.values.sort_by_bool,
      replace_query_bool: state.values.replace_query_bool,
      custom_metadata_bool: state.values.custom_metadata_bool,
      effective_from_ts_bool: state.values.effective_from_ts_bool,
      effective_to_ts_bool: state.values.effective_to_ts_bool,
    }));

    useEffect(() => {
      const { rule_match: _, ...expandedBools } = bools;
      setExpanded(expandedBools);
    }, [
      bools.rule_query_bool,
      bools.rule_filter_bool,
      bools.rule_tags_bool,
      bools.filter_by_bool,
      bools.sort_by_bool,
      bools.replace_query_bool,
      bools.custom_metadata_bool,
      bools.effective_from_ts_bool,
      bools.effective_to_ts_bool,
    ]);

    return (
      <Box>
        {/* Override name */}
        <form.AppField name='overrideId'>
          {({ state, handleChange, handleBlur }) => (
            <MuiTextField
              value={state.value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder='override_name'
              fullWidth
              size='small'
              required
              error={state.meta.isTouched && !state.meta.isValid}
              sx={compactInputSx}
            />
          )}
        </form.AppField>

        {/* Trigger type */}
        <Typography sx={labelSx}>Trigger</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 0.625,
            mb: 1.5,
          }}
        >
          <TriggerButton
            label='exact'
            active={bools.rule_query_bool && bools.rule_match === 'exact' && !bools.rule_filter_bool}
            onClick={() => {
              form.setFieldValue('rule_query_bool', true);
              form.setFieldValue('rule_filter_bool', false);
              form.setFieldValue('rule.match', 'exact');
            }}
          />
          <TriggerButton
            label='contains'
            active={bools.rule_query_bool && bools.rule_match === 'contains' && !bools.rule_filter_bool}
            onClick={() => {
              form.setFieldValue('rule_query_bool', true);
              form.setFieldValue('rule_filter_bool', false);
              form.setFieldValue('rule.match', 'contains');
            }}
          />
          <TriggerButton
            label='filter'
            active={bools.rule_filter_bool}
            onClick={() => {
              form.setFieldValue('rule_query_bool', false);
              form.setFieldValue('rule_filter_bool', true);
            }}
          />
        </Box>

        {/* Query (when query trigger) */}
        <Collapse in={bools.rule_query_bool} unmountOnExit>
          <Typography sx={labelSx}>Query</Typography>
          <form.AppField name='rule.query'>
            {({ state, handleChange, handleBlur }) => (
              <MuiTextField
                value={state.value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                placeholder='e.g. nashville'
                fullWidth
                size='small'
                sx={compactInputSx}
              />
            )}
          </form.AppField>
        </Collapse>

        {/* Filter (when filter trigger) */}
        <Collapse in={bools.rule_filter_bool} unmountOnExit>
          <Typography sx={labelSx}>Filter by</Typography>
          <form.AppField name='rule.filter_by'>
            {({ state, handleChange, handleBlur }) => (
              <MuiTextField
                value={state.value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                placeholder='e.g. genre:=pop'
                fullWidth
                size='small'
                sx={compactInputSx}
              />
            )}
          </form.AppField>
        </Collapse>

        {/* Tags */}
        <Collapse in={bools.rule_tags_bool} unmountOnExit>
          <Typography sx={labelSx}>Tags</Typography>
          <form.AppField name='rule.tags'>
            {({ state, handleChange, handleBlur }) => (
              <MuiTextField
                value={state.value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                placeholder='tag1, tag2'
                fullWidth
                size='small'
                sx={compactInputSx}
              />
            )}
          </form.AppField>
        </Collapse>

        {/* Actions section */}
        <Typography sx={{ ...labelSx, mt: 2 }}>Actions</Typography>
        <Stack spacing={0.25}>
          <SwitchRow
            label='Filter documents'
            field='filter_by_bool'
            form={form}
          />
          <Collapse in={Boolean(expanded['filter_by_bool'])} unmountOnExit>
            <Box sx={{ pl: 0, pb: 0.75 }}>
              <form.AppField name='filter_by'>
                {({ state, handleChange, handleBlur }) => (
                  <MuiTextField
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder='field:=value'
                    fullWidth
                    size='small'
                    sx={compactInputSx}
                  />
                )}
              </form.AppField>
            </Box>
          </Collapse>

          <SwitchRow
            label='Sort documents'
            field='sort_by_bool'
            form={form}
          />
          <Collapse in={Boolean(expanded['sort_by_bool'])} unmountOnExit>
            <Box sx={{ pb: 0.75 }}>
              <form.AppField name='sort_by'>
                {({ state, handleChange, handleBlur }) => (
                  <MuiTextField
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder='field:asc'
                    fullWidth
                    size='small'
                    sx={compactInputSx}
                  />
                )}
              </form.AppField>
            </Box>
          </Collapse>

          <SwitchRow
            label='Replace query'
            field='replace_query_bool'
            form={form}
          />
          <Collapse in={Boolean(expanded['replace_query_bool'])} unmountOnExit>
            <Box sx={{ pb: 0.75 }}>
              <form.AppField name='replace_query'>
                {({ state, handleChange, handleBlur }) => (
                  <MuiTextField
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder='replacement query'
                    fullWidth
                    size='small'
                    sx={compactInputSx}
                  />
                )}
              </form.AppField>
            </Box>
          </Collapse>

          <SwitchRow
            label='Remove matched tokens'
            field='remove_match_tokens'
            form={form}
          />
          <SwitchRow
            label='Filter curated hits'
            field='filter_curated_hits'
            form={form}
          />
          <SwitchRow
            label='Tags trigger'
            field='rule_tags_bool'
            form={form}
          />
          <SwitchRow
            label='Custom metadata'
            field='custom_metadata_bool'
            form={form}
          />
          <Collapse in={Boolean(expanded['custom_metadata_bool'])} unmountOnExit>
            <Box sx={{ pb: 0.75 }}>
              <form.AppField name='metadata'>
                {({ state, handleChange, handleBlur }) => (
                  <MuiTextField
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder='{ "key": "value" }'
                    fullWidth
                    size='small'
                    error={state.meta.isTouched && !state.meta.isValid}
                    sx={compactInputSx}
                  />
                )}
              </form.AppField>
            </Box>
          </Collapse>

          <SwitchRow
            label='Stop processing'
            field='stop_processing'
            form={form}
          />
        </Stack>

        {/* Schedule */}
        <Typography sx={{ ...labelSx, mt: 2 }}>Schedule</Typography>
        <Box
          sx={{
            display: 'flex',
            p: '3px',
            borderRadius: '6px',
            background: designTokens.surfaceMuted,
            border: `1px solid ${designTokens.border}`,
            mb: 1.75,
          }}
        >
          <SegmentButton
            active={!bools.effective_from_ts_bool && !bools.effective_to_ts_bool}
            onClick={() => {
              form.setFieldValue('effective_from_ts_bool', false);
              form.setFieldValue('effective_to_ts_bool', false);
            }}
          >
            Always
          </SegmentButton>
          <SegmentButton
            active={bools.effective_from_ts_bool || bools.effective_to_ts_bool}
            onClick={() => {
              form.setFieldValue('effective_from_ts_bool', true);
              form.setFieldValue('effective_to_ts_bool', true);
            }}
          >
            Date range
          </SegmentButton>
        </Box>
        <Collapse
          in={bools.effective_from_ts_bool || bools.effective_to_ts_bool}
          unmountOnExit
        >
          <Stack spacing={1} sx={{ mb: 1.5 }}>
            <Suspense fallback={<Skeleton variant='rounded' height={32} />}>
              <form.AppField name='effective_from_ts'>
                {({ DatePicker }) => (
                  <DatePicker
                    label='From'
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: compactInputSx,
                        required: bools.effective_from_ts_bool,
                      },
                    }}
                  />
                )}
              </form.AppField>
            </Suspense>
            <Suspense fallback={<Skeleton variant='rounded' height={32} />}>
              <form.AppField name='effective_to_ts'>
                {({ DatePicker }) => (
                  <DatePicker
                    label='Until'
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: compactInputSx,
                        required: bools.effective_to_ts_bool,
                      },
                    }}
                  />
                )}
              </form.AppField>
            </Suspense>
          </Stack>
        </Collapse>

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
                startIcon={<CheckRounded sx={{ fontSize: 14 }} />}
                loading={isSubmitting}
                disabled={!canSubmit}
                sx={{ ...primaryButtonSx, height: 36, mt: 0.5 }}
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

function TriggerButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component='button'
      type='button'
      onClick={onClick}
      sx={{
        py: '6px',
        px: 1,
        borderRadius: '5px',
        fontSize: 11.5,
        fontWeight: 500,
        border: `1px solid ${active ? designTokens.accentBorder : designTokens.border}`,
        background: active ? designTokens.accentSoft : designTokens.surface,
        color: active ? designTokens.accentDeep : designTokens.text,
        cursor: 'pointer',
        font: 'inherit',
        transition: 'all 120ms ease',
        '&:hover': {
          borderColor: active
            ? designTokens.accentBorder
            : designTokens.borderStrong,
        },
      }}
    >
      {label}
    </Box>
  );
}

function SwitchRow({
  label,
  field,
  form,
}: {
  label: string;
  field: string;
  form: any;
}) {
  return (
    <form.Field name={field}>
      {({ state, handleChange }: any) => (
        <Box sx={switchRowSx}>
          <Typography sx={switchLabelSx}>{label}</Typography>
          <Switch
            size='small'
            checked={Boolean(state.value)}
            onChange={(_, checked) => handleChange(checked)}
          />
        </Box>
      )}
    </form.Field>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      component='button'
      type='button'
      onClick={onClick}
      sx={{
        flex: 1,
        py: '5px',
        px: 1,
        borderRadius: '4px',
        background: active ? designTokens.surface : 'transparent',
        border: 'none',
        fontSize: 11.5,
        fontWeight: 500,
        color: active ? designTokens.text : designTokens.textMuted,
        cursor: 'pointer',
        font: 'inherit',
        boxShadow: active ? '0 1px 1px rgba(0,0,0,.05)' : 'none',
        transition: 'all 120ms ease',
      }}
    >
      {children}
    </Box>
  );
}
