import {
  Box,
  Collapse,
  FormHelperText,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { Suspense, useEffect, useState } from 'react';
import { overrideFormOpts, overrideQueryMatch } from '../constants';
import { withForm } from '../hooks';
import { LoadingSpinner } from './LoadingSpinner';

export const CurationForm = withForm({
  ...overrideFormOpts,
  props: {
    submitButtonText: 'Submit',
  },
  render: ({ form, submitButtonText }) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const {
      rule_query_bool,
      rule_filter_bool,
      rule_tags_bool,
      filter_by_bool,
      sort_by_bool,
      replace_query_bool,
      custom_metadata_bool,
      effective_from_ts_bool,
      effective_to_ts_bool,
    } = useStore(form.store, (state) => ({
      rule_query_bool: state.values.rule_query_bool,
      rule_filter_bool: state.values.rule_filter_bool,
      rule_tags_bool: state.values.rule_tags_bool,
      filter_by_bool: state.values.filter_by_bool,
      sort_by_bool: state.values.sort_by_bool,
      replace_query_bool: state.values.replace_query_bool,
      custom_metadata_bool: state.values.custom_metadata_bool,
      effective_from_ts_bool: state.values.effective_from_ts_bool,
      effective_to_ts_bool: state.values.effective_to_ts_bool,
    }));

    useEffect(() => {
      setExpanded({
        rule_query_bool,
        rule_filter_bool,
        rule_tags_bool,
        filter_by_bool,
        sort_by_bool,
        replace_query_bool,
        custom_metadata_bool,
        effective_from_ts_bool,
        effective_to_ts_bool,
      });
    }, [
      rule_query_bool,
      rule_filter_bool,
      rule_tags_bool,
      filter_by_bool,
      sort_by_bool,
      replace_query_bool,
      custom_metadata_bool,
      effective_from_ts_bool,
      effective_to_ts_bool,
    ]);

    // useEffect(() => {
    //   console.log('ERRORS: ', form.state.errors);
    // }, [form.state.errors]);

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <form.AppField name='overrideId'>
            {({ TextField }) => (
              <TextField
                id='overrideId'
                label='Override Name'
                placeholder='e.g. curate-songs'
                required
                fullWidth
                variant='outlined'
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant='h6' color='primary' gutterBottom>
            Rules
          </Typography>
          <Stack direction='column' spacing={0.5}>
            <form.AppField name='rule_query_bool'>
              {({ Checkbox }) => (
                <Checkbox
                  id='rule_query_bool'
                  label='Curate by Search Query'
                  value='rule_query_bool'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
            <Collapse
              in={Boolean(expanded['rule_query_bool'])}
              timeout='auto'
              unmountOnExit
            >
              <Stack direction='row' spacing={2} sx={{ ml: 5 }}>
                <form.AppField name='rule.query'>
                  {({ TextField }) => (
                    <TextField
                      id='rule.query'
                      placeholder='e.g. pop'
                      required={rule_query_bool}
                      fullWidth
                      variant='outlined'
                    />
                  )}
                </form.AppField>
                <form.AppField name='rule.match'>
                  {({ Select }) => (
                    <Select
                      id='rule.match'
                      label='Match'
                      defaultValue={overrideQueryMatch.enum.contains}
                      required={rule_query_bool}
                      variant='outlined'
                      options={overrideQueryMatch.options}
                    />
                  )}
                </form.AppField>
              </Stack>
            </Collapse>
            <form.AppField name='rule_filter_bool'>
              {({ Checkbox }) => (
                <Checkbox
                  id='rule_filter_bool'
                  label='Curate by Filter'
                  value='rule_filter_bool'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
            <Collapse
              in={Boolean(expanded['rule_filter_bool'])}
              timeout='auto'
              unmountOnExit
            >
              <Box sx={{ pl: 4 }}>
                <form.AppField name='rule.filter_by'>
                  {({ TextField }) => (
                    <TextField
                      id='rule.filter_by'
                      label='Filter By'
                      placeholder='e.g. genre:pop'
                      required={rule_filter_bool}
                      fullWidth
                      variant='outlined'
                    />
                  )}
                </form.AppField>
              </Box>
            </Collapse>
            <form.AppField name='rule_tags_bool'>
              {({ Checkbox }) => (
                <Checkbox
                  id='rule_tags_bool'
                  label='Curate by Tags'
                  value='rule_tags_bool'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
            <Collapse
              in={Boolean(expanded['rule_tags_bool'])}
              timeout='auto'
              unmountOnExit
            >
              <Box sx={{ pl: 4 }}>
                <form.AppField name='rule.tags'>
                  {({ TextField }) => (
                    <TextField
                      id='rule.tags'
                      label='Tags'
                      placeholder='e.g. clothes, shoes'
                      required={rule_tags_bool}
                      fullWidth
                      variant='outlined'
                      helperText='Separate tags by commas'
                    />
                  )}
                </form.AppField>
              </Box>
            </Collapse>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='h6' color='primary' gutterBottom>
            Actions
          </Typography>
          <Stack direction='column' spacing={0.5}>
            <form.AppField name='filter_by_bool'>
              {({ Checkbox }) => (
                <Checkbox
                  id='filter_by_bool'
                  label='Filter Documents'
                  value='filter_by_bool'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
            <Collapse
              in={Boolean(expanded['filter_by_bool'])}
              timeout='auto'
              unmountOnExit
            >
              <Box sx={{ pl: 4 }}>
                <form.AppField name='filter_by'>
                  {({ TextField }) => (
                    <TextField
                      id='filter_by'
                      placeholder='e.g. field:=value or field:={field}'
                      required={filter_by_bool}
                      fullWidth
                      variant='outlined'
                    />
                  )}
                </form.AppField>
              </Box>
            </Collapse>

            <form.AppField name='sort_by_bool'>
              {({ Checkbox }) => (
                <Checkbox
                  id='sort_by_bool'
                  label='Sort Documents'
                  value='sort_by_bool'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
            <Collapse
              in={Boolean(expanded['sort_by_bool'])}
              timeout='auto'
              unmountOnExit
            >
              <Box sx={{ pl: 4 }}>
                <form.AppField name='sort_by'>
                  {({ TextField }) => (
                    <TextField
                      id='sort_by'
                      required={sort_by_bool}
                      placeholder='e.g. field1:asc,field2:desc'
                      fullWidth
                      variant='outlined'
                    />
                  )}
                </form.AppField>
              </Box>
            </Collapse>

            <form.AppField name='replace_query_bool'>
              {({ Checkbox }) => (
                <Checkbox
                  id='replace_query_bool'
                  label='Replace Query'
                  value='replace_query_bool'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
            <Collapse
              in={Boolean(expanded['replace_query_bool'])}
              timeout='auto'
              unmountOnExit
            >
              <Box sx={{ pl: 4 }}>
                <form.AppField name='replace_query'>
                  {({ TextField }) => (
                    <TextField
                      id='replace_query'
                      placeholder='e.g. replacement query'
                      required={replace_query_bool}
                      fullWidth
                      variant='outlined'
                    />
                  )}
                </form.AppField>
              </Box>
            </Collapse>

            <form.AppField name='remove_match_tokens'>
              {({ Checkbox }) => (
                <Checkbox
                  id='remove_match_tokens'
                  label='Remove Matched Tokens'
                  value='remove_match_tokens'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>

            <form.AppField name='filter_curated_hits'>
              {({ Checkbox }) => (
                <Checkbox
                  id='filter_curated_hits'
                  label='Apply Filters to Curated Items'
                  value='filter_curated_hits'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>

            <form.AppField name='custom_metadata_bool'>
              {({ Checkbox }) => (
                <Checkbox
                  id='custom_metadata_bool'
                  label='Custom Metadata'
                  value='custom_metadata_bool'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
            <Collapse
              in={Boolean(expanded['custom_metadata_bool'])}
              timeout='auto'
              unmountOnExit
            >
              <Box sx={{ pl: 4 }}>
                <form.AppField name='metadata'>
                  {({ TextField }) => (
                    <TextField
                      id='metadata'
                      placeholder='e.g. { "cta": 100 }'
                      required={custom_metadata_bool}
                      fullWidth
                      variant='outlined'
                    />
                  )}
                </form.AppField>
              </Box>
            </Collapse>

            <form.AppField name='stop_processing'>
              {({ Checkbox }) => (
                <Checkbox
                  id='stop_processing'
                  label='Stop Rule Processing After This Rule'
                  value='stop_processing'
                  sx={{ p: 0.75 }}
                />
              )}
            </form.AppField>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant='h6' color='primary'>
            Options
          </Typography>
          <Stack direction='column' spacing={0.5}>
            <Box>
              <form.AppField name='effective_from_ts_bool'>
                {({ Checkbox }) => (
                  <>
                    <Checkbox
                      id='effective_from_ts_bool'
                      label='Effective From'
                      value='effective_from_ts_bool'
                      sx={{ p: 0.75 }}
                    />
                    <FormHelperText sx={{ pl: 3 }}>
                      When disabled, the override is effective immediately.
                    </FormHelperText>
                  </>
                )}
              </form.AppField>
              <Collapse
                in={Boolean(expanded['effective_from_ts_bool'])}
                timeout='auto'
                unmountOnExit
              >
                <Box sx={{ pl: 3 }}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <form.AppField name='effective_from_ts'>
                      {({ DatePicker }) => (
                        <DatePicker
                          slotProps={{
                            textField: {
                              required: effective_from_ts_bool,
                            },
                          }}
                        />
                      )}
                    </form.AppField>
                  </Suspense>
                </Box>
              </Collapse>
            </Box>
            <Box>
              <form.AppField name='effective_to_ts_bool'>
                {({ Checkbox }) => (
                  <>
                    <Checkbox
                      id='effective_to_ts_bool'
                      label='Effective Until'
                      value='effective_to_ts_bool'
                      sx={{ p: 0.75 }}
                    />
                    <FormHelperText sx={{ pl: 3 }}>
                      When disabled, the override is effective indefinitely.
                    </FormHelperText>
                  </>
                )}
              </form.AppField>
              <Collapse
                in={Boolean(expanded['effective_to_ts_bool'])}
                timeout='auto'
                unmountOnExit
              >
                <Box sx={{ pl: 3 }}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <form.AppField name='effective_to_ts'>
                      {({ DatePicker }) => (
                        <DatePicker
                          slotProps={{
                            textField: {
                              required: effective_to_ts_bool,
                            },
                          }}
                        />
                      )}
                    </form.AppField>
                  </Suspense>
                </Box>
              </Collapse>
            </Box>
          </Stack>
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
