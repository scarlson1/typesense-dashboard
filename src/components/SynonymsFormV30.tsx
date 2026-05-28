import { FormField } from '@/components/redesign';
import { withForm } from '@/hooks';
import { Grid } from '@mui/material';
import { formOptions } from '@tanstack/react-form';
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
