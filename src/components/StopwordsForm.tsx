import { Grid } from '@mui/material';
import { stopwordsFormOpts } from '../constants';
import { withForm } from '../hooks';

export const StopwordsForm = withForm({
  ...stopwordsFormOpts,
  render: ({ form }) => {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <form.AppField name='stopwordId'>
            {({ TextField }) => (
              <TextField
                id='stopwordId'
                label='Stopwords-Set ID'
                placeholder='e.g. common-words'
                required
                fullWidth
                variant='outlined'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <form.AppField name='stopwords'>
            {({ TextField }) => (
              <TextField
                id='stopwords'
                label='Stopwords'
                placeholder='e.g. a, the, are, am'
                required
                fullWidth
                variant='outlined'
                helperText='Separate words by commas'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <form.AppField name='locale'>
            {({ TextField }) => (
              <TextField
                id='locale'
                label='Locale'
                placeholder='e.g. ko or jp'
                fullWidth
                variant='outlined'
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
