import { FormField } from '@/components/redesign';
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
      <Grid container spacing={1.75}>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='synonyms'>
            {({ TextField }) => (
              <FormField
                label='Synonym terms'
                hint='comma separated'
                required
                htmlFor='synonyms'
              >
                <TextField
                  id='synonyms'
                  required
                  fullWidth
                  size='small'
                  variant='outlined'
                  placeholder='e.g. apartment, flat, condo'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='root'>
            {({ TextField }) => (
              <FormField
                label='Root'
                hint='empty for multi-way'
                htmlFor='root'
              >
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
            {({ TextField }) => (
              <FormField label='Symbols to index' htmlFor='symbols_to_index'>
                <TextField
                  id='symbols_to_index'
                  fullWidth
                  size='small'
                  variant='outlined'
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
