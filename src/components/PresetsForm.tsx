import {
  EMPTY_PRESET_PARAMS,
  multiParameterKeys,
  parameterKeys,
  presetsFormOpts,
  presetType,
} from '@/constants';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { useState } from 'react';
import {
  AddRounded,
  DeleteOutlineRounded,
  RemoveRounded,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  IconButton,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';

const PARAM_CATEGORIES: Array<{ label: string; params: string[] }> = [
  {
    label: 'Query',
    params: [
      'q',
      'query_by',
      'query_by_weights',
      'num_typos',
      'prefix',
      'infix',
      'pre_segmented_query',
      'min_len_1typo',
      'min_len_2typo',
      'typo_tokens_threshold',
      'drop_tokens_threshold',
      'split_join_tokens',
    ],
  },
  {
    label: 'Sort & rank',
    params: [
      'sort_by',
      'group_by',
      'group_limit',
      'group_missing_values',
      'pinned_hits',
      'hidden_hits',
      'override_tags',
      'enable_overrides',
      'prioritize_exact_match',
      'prioritize_token_position',
      'text_match_type',
    ],
  },
  {
    label: 'Filter & facet',
    params: [
      'filter_by',
      'facet_by',
      'facet_query',
      'facet_query_num_typos',
      'max_facet_values',
      'facet_return_parent',
      'facet_sample_percent',
      'facet_sample_threshold',
    ],
  },
  {
    label: 'Display',
    params: [
      'per_page',
      'page',
      'limit',
      'offset',
      'include_fields',
      'exclude_fields',
      'highlight_fields',
      'highlight_full_fields',
      'highlight_affix_num_tokens',
      'highlight_start_tag',
      'highlight_end_tag',
      'snippet_threshold',
    ],
  },
];

const CATEGORY_BY_PARAM = new Map<string, string>();
for (const cat of PARAM_CATEGORIES) {
  for (const p of cat.params) CATEGORY_BY_PARAM.set(p, cat.label);
}

const PARAM_LABEL_COL = 184;

function groupParameterIndices(
  params: Array<{ name: string; value: unknown }>
): Array<{ label: string; indices: number[] }> {
  const groups: Record<string, number[]> = {};
  for (const cat of PARAM_CATEGORIES) groups[cat.label] = [];
  groups['Other'] = [];
  params.forEach((p, idx) => {
    const cat = CATEGORY_BY_PARAM.get(p.name) ?? 'Other';
    groups[cat].push(idx);
  });
  return [...PARAM_CATEGORIES.map((c) => c.label), 'Other']
    .map((label) => ({ label, indices: groups[label] }))
    .filter((g) => g.indices.length > 0);
}

const inlineInputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: designTokens.surface,
    fontSize: 12.5,
    minHeight: 32,
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
      borderWidth: 1,
    },
    '& input': {
      fontSize: 12.5,
      padding: '4px 2px !important',
      fontFamily: designTokens.fontMono,
      color: designTokens.text,
    },
  },
};

const autocompletePaperSlot = {
  paper: {
    sx: {
      border: `1px solid ${designTokens.border}`,
      fontFamily: designTokens.fontMono,
      fontSize: 12.5,
    },
  },
};

const groupHeaderSx = {
  fontSize: 10.5,
  fontWeight: 700,
  color: designTokens.textFaint,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  pb: 0.75,
  mb: 1,
  borderBottom: `1px solid ${designTokens.border}`,
};


const rowDeleteBtnSx = {
  width: 26,
  height: 26,
  borderRadius: '5px',
  color: designTokens.textFaint,
  flexShrink: 0,
  '&:hover': {
    color: designTokens.danger,
    background: designTokens.dangerSoft,
  },
};

const addParamBtnSx = {
  mt: 1.5,
  px: 1.5,
  py: '7px',
  borderRadius: '6px',
  background: designTokens.surfaceMuted,
  border: `1px dashed ${designTokens.borderStrong}`,
  color: designTokens.textMuted,
  fontSize: 12.5,
  fontWeight: 500,
  textTransform: 'none' as const,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.625,
  font: 'inherit',
  '&:hover': {
    background: designTokens.surface,
    color: designTokens.text,
    borderColor: designTokens.accent,
  },
};

export const PresetsForm = withForm({
  ...presetsFormOpts,
  props: {},
  render: ({ form }) => {
    return (
      <Box>
        <form.Subscribe
          selector={(state) => state.values.presetType}
          children={(presetTypeVal) =>
            presetTypeVal === presetType.enum['Multi-Search'] ? (
              <MultiSearchSection form={form} />
            ) : (
              <SingleSearchSection form={form} />
            )
          }
        />
      </Box>
    );
  },
});

function SingleSearchSection({ form }: { form: any }) {
  return (
    <form.AppField name='searchParameters' mode='array'>
      {({ state, pushValue, removeValue }: any) => {
        const groups = groupParameterIndices(state.value);
        return (
          <Box>
            {groups.length === 0 ? null : (
              groups.map((group) => (
                <Box key={group.label} sx={{ mb: 2.25 }}>
                  <Typography sx={groupHeaderSx}>{group.label}</Typography>
                  <Stack spacing={1}>
                    {group.indices.map((i) => (
                      <ParameterRow
                        key={`searchParam-${i}`}
                        form={form}
                        index={i}
                        nameField={`searchParameters[${i}].name`}
                        valueField={`searchParameters[${i}].value`}
                        options={parameterKeys.options}
                        onRemove={() => removeValue(i)}
                      />
                    ))}
                  </Stack>
                </Box>
              ))
            )}
            <Box
              component='button'
              type='button'
              onClick={() => pushValue(EMPTY_PRESET_PARAMS)}
              sx={addParamBtnSx}
            >
              <AddRounded sx={{ fontSize: 13 }} /> Add parameter
            </Box>
          </Box>
        );
      }}
    </form.AppField>
  );
}

function MultiSearchSection({ form }: { form: any }) {
  return (
    <form.AppField name='multiSearchParams' mode='array'>
      {({ state, pushValue, removeValue }: any) => (
        <Box>
          {state.value.map((_: unknown, i: number) => (
            <Box
              key={`multi-search-${i}`}
              sx={{
                mb: 2.25,
                pb: 2,
                borderBottom:
                  i < state.value.length - 1
                    ? `1px solid ${designTokens.border}`
                    : 'none',
              }}
            >
              <Stack
                direction='row'
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.25,
                }}
              >
                <Typography sx={groupHeaderSx}>{`Search ${i + 1}`}</Typography>
                <IconButton
                  onClick={() => removeValue(i)}
                  size='small'
                  sx={rowDeleteBtnSx}
                >
                  <DeleteOutlineRounded sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>

              <form.AppField
                name={`multiSearchParams[${i}]`}
                mode='array'
              >
                {({
                  state: innerState,
                  pushValue: pushParam,
                  removeValue: removeParam,
                }: any) => (
                  <Box>
                    <Stack spacing={1}>
                      {innerState.value.map((_: unknown, j: number) => (
                        <ParameterRow
                          key={`multi-${i}-${j}`}
                          form={form}
                          index={j}
                          nameField={`multiSearchParams[${i}][${j}].name`}
                          valueField={`multiSearchParams[${i}][${j}].value`}
                          options={multiParameterKeys.options}
                          onRemove={() => removeParam(j)}
                        />
                      ))}
                    </Stack>
                    <Box
                      component='button'
                      type='button'
                      onClick={() => pushParam(EMPTY_PRESET_PARAMS)}
                      sx={addParamBtnSx}
                    >
                      <AddRounded sx={{ fontSize: 13 }} /> Add parameter
                    </Box>
                  </Box>
                )}
              </form.AppField>
            </Box>
          ))}
          <Box
            component='button'
            type='button'
            onClick={() => pushValue([EMPTY_PRESET_PARAMS])}
            sx={addParamBtnSx}
          >
            <AddRounded sx={{ fontSize: 13 }} /> Add search
          </Box>
        </Box>
      )}
    </form.AppField>
  );
}

function ChipInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const chips = value
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const [draft, setDraft] = useState('');

  const commit = (input: string) => {
    const newChips = input
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s && !chips.includes(s));
    if (newChips.length) onChange([...chips, ...newChips].join(','));
    setDraft('');
  };

  const remove = (chip: string) => {
    onChange(chips.filter((c) => c !== chip).join(','));
  };

  return (
    <Box
      sx={{
        border: `1px solid ${designTokens.border}`,
        borderRadius: '5px',
        background: designTokens.surface,
        px: 0.75,
        py: 0.5,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        alignItems: 'center',
        minHeight: 32,
        cursor: 'text',
        transition: 'border-color 120ms ease',
        '&:focus-within': { borderColor: designTokens.accent },
      }}
      onClick={(e) => {
        (e.currentTarget as HTMLElement).querySelector('input')?.focus();
      }}
    >
      {chips.map((chip) => (
        <Box
          key={chip}
          component='span'
          sx={{
            fontFamily: designTokens.fontMono,
            fontSize: 12,
            px: 0.875,
            py: '2px',
            background: designTokens.surfaceMuted,
            border: `1px solid ${designTokens.border}`,
            borderRadius: '4px',
            color: designTokens.text,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {chip}
          <Box
            component='span'
            onClick={(e) => { e.stopPropagation(); remove(chip); }}
            sx={{
              color: designTokens.textFaint,
              cursor: 'pointer',
              fontSize: 11,
              lineHeight: 1,
              '&:hover': { color: designTokens.danger },
            }}
          >
            ×
          </Box>
        </Box>
      ))}
      <Box
        component='input'
        value={draft}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const val = e.target.value;
          if (/[,]/.test(val.slice(-1))) commit(val);
          else setDraft(val);
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(draft); }
          if (e.key === 'Backspace' && !draft && chips.length) {
            onChange(chips.slice(0, -1).join(','));
          }
        }}
        onBlur={() => { if (draft.trim()) commit(draft); }}
        placeholder={chips.length === 0 ? 'value' : ''}
        sx={{
          flex: 1,
          minWidth: 60,
          border: 'none',
          outline: 'none',
          fontSize: 12.5,
          fontFamily: designTokens.fontMono,
          background: 'transparent',
          color: designTokens.text,
          py: '2px',
          '&::placeholder': { color: designTokens.textFaint, opacity: 1 },
        }}
      />
    </Box>
  );
}

interface ParameterRowProps {
  form: any;
  index: number;
  nameField: string;
  valueField: string;
  options: readonly string[];
  onRemove: () => void;
}

function ParameterRow({
  form,
  nameField,
  valueField,
  options,
  onRemove,
}: ParameterRowProps) {
  return (
    <Stack
      direction='row'
      spacing={1.25}
      sx={{ alignItems: 'center', width: '100%' }}
    >
      <Box sx={{ flex: `0 0 ${PARAM_LABEL_COL}px`, minWidth: 0 }}>
        <form.Field name={nameField}>
          {({ state, handleChange, handleBlur }: any) => {
            const nameVal = state.value ?? '';
            const isKnown = !!nameVal;
            if (isKnown) {
              return (
                <Box
                  onClick={() => handleChange('')}
                  sx={{
                    fontFamily: designTokens.fontMono,
                    fontSize: 12.5,
                    color: designTokens.text,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    cursor: 'text',
                    py: '6px',
                    px: '2px',
                    minHeight: 32,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={nameVal}
                >
                  {nameVal}
                </Box>
              );
            }
            return (
              <Autocomplete
                disablePortal
                freeSolo
                options={options as string[]}
                size='small'
                value={nameVal}
                onChange={(_, newVal) =>
                  handleChange(typeof newVal === 'string' ? newVal : '')
                }
                blurOnSelect
                autoHighlight
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    onBlur={handleBlur}
                    placeholder='parameter name'
                    error={state.meta.isTouched && !state.meta.isValid}
                    sx={inlineInputSx}
                  />
                )}
                slotProps={autocompletePaperSlot}
              />
            );
          }}
        </form.Field>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <form.Field name={valueField}>
          {({ state, handleChange }: { state: { value: string }; handleChange: (val: string) => void }) => (
            <ChipInput
              value={state.value ?? ''}
              onChange={handleChange}
            />
          )}
        </form.Field>
      </Box>

      <IconButton
        onClick={onRemove}
        size='small'
        aria-label='remove parameter'
        sx={rowDeleteBtnSx}
      >
        <RemoveRounded sx={{ fontSize: 14 }} />
      </IconButton>
    </Stack>
  );
}
