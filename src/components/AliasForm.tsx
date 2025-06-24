import { Grid } from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';
import { withForm } from '../hooks';

const newAliasSchema = z.object({
  aliasName: z.string(),
  targetCollection: z.string(),
});
export type NewAliasSchema = z.infer<typeof newAliasSchema>;

export const aliasFormOpts = formOptions({
  defaultValues: {
    aliasName: '',
    targetCollection: '',
  },
  validators: {
    onChange: newAliasSchema,
  },
});

export const AliasForm = withForm({
  ...aliasFormOpts,
  props: {
    targetOptions: [''],
  },
  render: ({ form, targetOptions }) => {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 5 }}>
          <form.AppField name='aliasName'>
            {({ TextField }) => (
              <TextField
                id='aliasName'
                label='Alias Name'
                required
                fullWidth
                variant='outlined'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 5 }}>
          <form.AppField name='targetCollection'>
            {({ Select }) => (
              <Select
                id='targetCollection'
                label='Target Collection'
                fullWidth
                required
                variant='outlined'
                options={targetOptions}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 4, md: 2 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <form.AppForm>
            <form.SubmitButton label='Upsert' />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});
