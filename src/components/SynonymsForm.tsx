import { withForm } from '@/hooks';
import { Grid } from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

const synonymsSchema = z.object({
  synonyms: z.string(),
  root: z.string(),
  symbols_to_index: z.string(),
  locale: z.string(),
});
// export type SynonymsSchema = z.infer<typeof synonymsSchema>;

export const synonymsFormOpts = formOptions({
  defaultValues: {
    synonyms: '',
    root: '',
    symbols_to_index: '',
    locale: '',
  },
  validators: {
    onChange: synonymsSchema,
  },
});

export const SynonymsForm = withForm({
  ...synonymsFormOpts,
  render: ({ form }) => {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='synonyms'>
            {({ TextField }) => (
              <TextField
                id='synonyms'
                label='Synonyms'
                required
                fullWidth
                variant='outlined'
                helperText='Separate words by commas'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='root'>
            {({ TextField }) => (
              <TextField
                id='root'
                label='Root'
                fullWidth
                variant='outlined'
                helperText='Leave empty to create a multi-way synonym'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='symbols_to_index'>
            {({ TextField }) => (
              <TextField
                id='symbols_to_index'
                label='Symbols to Index'
                fullWidth
                variant='outlined'
                placeholder='e.g. +,-,_'
                helperText='Separate symbols by commas'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='locale'>
            {({ TextField }) => (
              <TextField
                id='locale'
                label='Locale'
                fullWidth
                variant='outlined'
                placeholder='e.g. en or jp'
                helperText='Leave blank to auto-detect'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppForm>
            <form.SubmitButton label='Add' />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});
