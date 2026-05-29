import { FormField } from '@/components/redesign';
import { stopwordsFormOpts } from '@/constants';
import { withForm } from '@/hooks';
import { Grid } from '@mui/material';

export const StopwordsForm = withForm({
  ...stopwordsFormOpts,
  render: ({ form }) => {
    return (
      <Grid container spacing={1.75}>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='stopwordId'>
            {({ TextField }) => (
              <FormField label='Stopword set ID' required htmlFor='stopwordId'>
                <TextField
                  id='stopwordId'
                  placeholder='e.g. common-words'
                  required
                  fullWidth
                  size='small'
                  variant='outlined'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='stopwords'>
            {({ TextField }) => (
              <FormField
                label='Stopwords'
                hint='comma separated'
                required
                htmlFor='stopwords'
              >
                <TextField
                  id='stopwords'
                  placeholder='e.g. a, the, are, am'
                  required
                  fullWidth
                  size='small'
                  variant='outlined'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppField name='locale'>
            {({ TextField }) => (
              <FormField label='Locale' htmlFor='locale'>
                <TextField
                  id='locale'
                  placeholder='auto'
                  fullWidth
                  size='small'
                  variant='outlined'
                />
              </FormField>
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppForm>
            <form.SubmitButton label='Add' fullWidth />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});
