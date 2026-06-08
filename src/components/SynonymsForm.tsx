import {
  compactMonoInputSx as compactInputSx,
  sectionLabelSx as labelSx,
} from '@/constants/redesignSx';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { Box, Stack, TextField as MuiTextField, Typography } from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { useState } from 'react';
import { z } from 'zod/v4';

const synonymsSchema = z.object({
  synonymId: z.string(),
  type: z.enum(['multi-way', 'one-way']),
  synonyms: z.string(),
  root: z.string(),
  symbols_to_index: z.string(),
  locale: z.string(),
});

export const synonymsFormOpts = formOptions({
  defaultValues: {
    synonymId: '',
    type: 'multi-way' as 'multi-way' | 'one-way',
    synonyms: '',
    root: '',
    symbols_to_index: '',
    locale: '',
  },
  validators: {
    onChange: synonymsSchema,
  },
});

function ChipInput({
  value,
  onChange,
  placeholder,
  chipTone = 'neutral',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  chipTone?: 'neutral' | 'accent';
}) {
  const chips = value
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const [draft, setDraft] = useState('');

  const chipBg =
    chipTone === 'accent' ? designTokens.accentSoft : designTokens.surfaceMuted;
  const chipBorder =
    chipTone === 'accent' ? designTokens.accentBorder : designTokens.border;
  const chipColor =
    chipTone === 'accent' ? designTokens.accentDeep : designTokens.text;

  const commit = (input: string) => {
    const newChips = input
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s && !chips.includes(s));
    if (newChips.length) {
      onChange([...chips, ...newChips].join(', '));
    }
    setDraft('');
  };

  const remove = (chip: string) => {
    onChange(chips.filter((c) => c !== chip).join(', '));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/[,\s]/.test(val.slice(-1))) {
      commit(val);
    } else {
      setDraft(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(draft);
    }
    if (e.key === 'Backspace' && !draft && chips.length) {
      onChange(chips.slice(0, -1).join(', '));
    }
  };

  return (
    <Box
      sx={{
        border: `1px solid ${designTokens.border}`,
        borderRadius: '6px',
        background: designTokens.surface,
        p: 0.875,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.625,
        alignItems: 'center',
        minHeight: 34,
        cursor: 'text',
        transition: 'border-color 120ms ease',
        '&:focus-within': { borderColor: designTokens.accent },
      }}
      onClick={(e) => {
        const input = (e.currentTarget as HTMLElement).querySelector('input');
        input?.focus();
      }}
    >
      {chips.map((chip) => (
        <Box
          key={chip}
          component='span'
          sx={{
            fontFamily: designTokens.fontMono,
            fontSize: 12,
            px: 1,
            py: '3px',
            background: chipBg,
            border: `1px solid ${chipBorder}`,
            borderRadius: '5px',
            color: chipColor,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.625,
          }}
        >
          {chip}
          <Box
            component='span'
            onClick={(e) => {
              e.stopPropagation();
              remove(chip);
            }}
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft.trim()) commit(draft);
        }}
        placeholder={chips.length === 0 ? placeholder : ''}
        sx={{
          flex: 1,
          minWidth: 80,
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

export const SynonymsForm = withForm({
  ...synonymsFormOpts,
  props: {} as { isEditing?: boolean; onCancel?: () => void },
  render: ({ form, isEditing, onCancel }) => {
    return (
      <Stack>
        <Typography sx={{ ...labelSx, mt: 0 }}>Type</Typography>
        <form.AppField name='type'>
          {({ state, handleChange }) => (
            <Stack direction='row' sx={{ gap: 0.75 }}>
              {(['multi-way', 'one-way'] as const).map((opt) => (
                <Box
                  key={opt}
                  component='button'
                  type='button'
                  onClick={() => handleChange(opt)}
                  sx={{
                    px: 1.5,
                    py: '5px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    borderRadius: '6px',
                    border: `1px solid ${state.value === opt ? designTokens.accentBorder : designTokens.border}`,
                    background:
                      state.value === opt
                        ? designTokens.accentSoft
                        : designTokens.surface,
                    color:
                      state.value === opt
                        ? designTokens.accentDeep
                        : designTokens.textMuted,
                    cursor: 'pointer',
                    font: 'inherit',
                    transition: 'all 120ms ease',
                    '&:hover': {
                      borderColor:
                        state.value === opt
                          ? designTokens.accentBorder
                          : designTokens.borderStrong,
                    },
                  }}
                >
                  {opt === 'multi-way' ? 'Multi-way' : 'One-way'}
                </Box>
              ))}
            </Stack>
          )}
        </form.AppField>

        <Typography sx={labelSx}>Rule ID</Typography>
        <form.AppField name='synonymId'>
          {({ state, handleChange, handleBlur }) => (
            <MuiTextField
              value={state.value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder='e.g. apartment-types'
              size='small'
              fullWidth
              required
              sx={compactInputSx}
            />
          )}
        </form.AppField>

        <Typography sx={labelSx}>
          Synonym terms
          <Box component='span' sx={{ fontWeight: 500, ml: 0.5 }}>
            · comma separated
          </Box>
        </Typography>
        <form.AppField name='synonyms'>
          {({ state, handleChange }) => (
            <ChipInput
              value={state.value}
              onChange={handleChange}
              placeholder='e.g. apartment, flat, condo'
              chipTone='accent'
            />
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.type}>
          {(type) =>
            type === 'one-way' ? (
              <>
                <Typography sx={labelSx}>Root</Typography>
                <form.AppField name='root'>
                  {({ state, handleChange, handleBlur }) => (
                    <MuiTextField
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      placeholder='e.g. apt'
                      size='small'
                      fullWidth
                      sx={compactInputSx}
                    />
                  )}
                </form.AppField>
              </>
            ) : null
          }
        </form.Subscribe>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>Symbols to index</Typography>
            <form.AppField name='symbols_to_index'>
              {({ state, handleChange }) => (
                <ChipInput
                  value={state.value}
                  onChange={handleChange}
                  placeholder='+ # @'
                />
              )}
            </form.AppField>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>Locale</Typography>
            <form.AppField name='locale'>
              {({ state, handleChange, handleBlur }) => (
                <MuiTextField
                  value={state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder='auto'
                  size='small'
                  fullWidth
                  sx={compactInputSx}
                />
              )}
            </form.AppField>
          </Box>
        </Stack>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <form.AppForm>
            <form.SubmitButton label={isEditing ? 'Save changes' : 'Add rule'} fullWidth />
          </form.AppForm>
          {isEditing && onCancel && (
            <Box
              component='button'
              type='button'
              onClick={onCancel}
              sx={{
                px: 1.5,
                py: '5px',
                fontSize: 12.5,
                fontWeight: 500,
                borderRadius: '6px',
                border: `1px solid ${designTokens.border}`,
                background: designTokens.surface,
                color: designTokens.textMuted,
                cursor: 'pointer',
                font: 'inherit',
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: designTokens.borderStrong, color: designTokens.text },
              }}
            >
              Cancel
            </Box>
          )}
        </Box>
      </Stack>
    );
  },
});
