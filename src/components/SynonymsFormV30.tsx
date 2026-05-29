import { FormField } from '@/components/redesign';
import { withForm } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { Box, Grid } from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { useState } from 'react';
import { z } from 'zod/v4';

const synonymsSchema = z.object({
  name: z.string().min(1),
  synonyms: z.string(),
  root: z.string(),
  symbols_to_index: z.string(),
  locale: z.string(),
});

export const synonymsFormOptsV30 = formOptions({
  defaultValues: {
    name: '',
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
        minHeight: 36,
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
          fontSize: 13,
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

export const SynonymsFormV30 = withForm({
  ...synonymsFormOptsV30,
  render: ({ form }) => {
    return (
      <Grid container spacing={1.75}>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='name'>
            {({ TextField }) => (
              <FormField label='Rule name' required htmlFor='name'>
                <TextField
                  id='name'
                  required
                  fullWidth
                  size='small'
                  variant='outlined'
                  placeholder='e.g. apartment_synonyms'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='synonyms'>
            {({ state, handleChange }) => (
              <FormField label='Synonym terms' hint='comma separated' required>
                <ChipInput
                  value={state.value}
                  onChange={handleChange}
                  placeholder='e.g. apartment, flat, condo'
                  chipTone='accent'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='root'>
            {({ TextField }) => (
              <FormField label='Root' hint='empty for multi-way' htmlFor='root'>
                <TextField
                  id='root'
                  fullWidth
                  size='small'
                  variant='outlined'
                  placeholder='e.g. apt'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='symbols_to_index'>
            {({ state, handleChange }) => (
              <FormField label='Symbols to index'>
                <ChipInput
                  value={state.value}
                  onChange={handleChange}
                  placeholder='+ # @'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='locale'>
            {({ TextField }) => (
              <FormField label='Locale' htmlFor='locale'>
                <TextField
                  id='locale'
                  fullWidth
                  size='small'
                  variant='outlined'
                  placeholder='auto'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppForm>
            <form.SubmitButton label='Add rule' fullWidth />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});
