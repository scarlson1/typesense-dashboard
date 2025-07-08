import { analyticsFormOpts, analyticsRuleType } from '@/constants';
import { withForm } from '@/hooks';
import { FormHelperText, Grid } from '@mui/material';

export const AnalyticsRuleForm = withForm({
  ...analyticsFormOpts,
  props: {
    sourceOptions: [''],
    destinationOptions: [''],
    submitButtonText: 'Submit',
  },
  render: ({ form, sourceOptions, destinationOptions, submitButtonText }) => {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='name'>
            {({ TextField }) => (
              <TextField
                id='name'
                label='Name'
                placeholder='suggested_searches'
                required
                fullWidth
                variant='outlined'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='type'>
            {({ Select }) => (
              <Select
                id='type'
                label='Rule Type'
                required
                fullWidth
                variant='outlined'
                options={analyticsRuleType.options}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='params.source.collections'>
            {({ Select, handleChange }) => (
              <Select
                id='params.source.collections'
                label='Source Collection'
                required
                fullWidth
                variant='outlined'
                options={sourceOptions}
                helperText={`Track searches sent to these collections`}
                checkmark
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) =>
                      (selected as string[]).join(', '),
                  },
                }}
                onChange={(event) => {
                  const {
                    target: { value },
                  } = event;
                  let val =
                    typeof value === 'string' ? value.split(',') : value;
                  handleChange(val);
                }}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <form.AppField name='params.destination.collection'>
            {({ Select }) => (
              <Select
                id='params.destination.collection'
                label='Destination Collection'
                required
                fullWidth
                variant='outlined'
                options={destinationOptions}
                helperText={`Collect search terms in this collection. Collection's schema needs to be set according to the docs`}
              />
            )}
          </form.AppField>
        </Grid>
        {/* TODO:  USE NUMERIC INPUT MASK ?? */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <form.AppField name='params.limit'>
            {({ TextField }) => (
              <TextField
                id='params.limit'
                label='Limit'
                fullWidth
                variant='outlined'
                placeholder='100'
                helperText='Number of Search Terms to collect'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <form.AppField name='params.expand_query'>
            {({ Checkbox }) => (
              <>
                <Checkbox
                  label='Expand Partial Queries'
                  value={`params.expand_query`}
                />
                <FormHelperText>
                  If a searcher types in a partial query, should it be fully
                  expanded automatically when logged
                </FormHelperText>
              </>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <form.AppField name='params.enable_auto_aggregation'>
            {({ Checkbox }) => (
              <>
                <Checkbox
                  label='Enable auto aggregation'
                  value={`params.enable_auto_aggregation`}
                />
              </>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppForm>
            <form.SubmitButton label={submitButtonText} />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});
