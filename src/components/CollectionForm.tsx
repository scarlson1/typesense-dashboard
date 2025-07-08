import { collectionFormOpts } from '@/constants';
import { withForm } from '@/hooks';
import { Grid, Typography } from '@mui/material';
import { CollectionFieldsForm } from './forms';

// TODO: break out fields into separate sub-form (reuse for editing collection)

// TODO: rest of field properties

export const CollectionForm = withForm({
  ...collectionFormOpts,
  render: ({ form }) => {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='name'>
            {({ TextField, state }) => (
              <TextField
                id='name'
                label='Name'
                placeholder='songs'
                autoFocus
                required
                fullWidth
                variant='outlined'
                color={state.meta.errors.length ? 'error' : 'primary'}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <form.AppField name='default_sorting_field'>
            {({ TextField, state }) => (
              <TextField
                id='default_sorting_field'
                label='default_sorting_field'
                fullWidth
                variant='outlined'
                color={state.meta.errors.length ? 'error' : 'primary'}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 6, sm: 12 }}>
          <form.AppField name='enable_nested_fields'>
            {({ Checkbox }) => (
              <Checkbox
                label='enable_nested_fields'
                value={`enable_nested_fields`}
              />
            )}
          </form.AppField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant='overline' color='textSecondary'>
            Fields
          </Typography>
          <CollectionFieldsForm form={form} />
        </Grid>
        <form.AppForm>
          <form.SubmitButton label='Create Collection' />
        </form.AppForm>
      </Grid>
    );
  },
});
