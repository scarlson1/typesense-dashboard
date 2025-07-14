import { collectionFormOpts, NEW_EMPTY_FIELD } from '@/constants';
import { withForm } from '@/hooks';
import { typesenseFieldType } from '@/types';
import { AddRounded, RemoveRounded } from '@mui/icons-material';
import {
  Grid,
  IconButton,
  MenuItem,
  TextField as MuiTextField,
  Stack,
} from '@mui/material';
import type { FieldType } from 'typesense/lib/Typesense/Collection';

// TODO: accordion with rest of fields

export const CollectionFieldsForm = withForm({
  ...collectionFormOpts,
  render: ({ form }) => {
    return (
      <form.AppField name='fields' mode='array'>
        {({ state, pushValue, removeValue }) => (
          <>
            {state.value.map((_, i) => (
              <Grid container columnSpacing={2} rowSpacing={0.5} key={`${i}`}>
                <Grid size={{ xs: 7, md: 8 }}>
                  <form.Field name={`fields[${i}].name`}>
                    {({ state, handleChange, handleBlur }) => (
                      <MuiTextField
                        id={`fields[${i}].name`}
                        value={state.value}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        label='Name'
                        required
                        fullWidth
                        variant='outlined'
                        color={state.meta.errors.length ? 'error' : 'primary'}
                      />
                    )}
                  </form.Field>
                </Grid>
                <Grid size={{ xs: 3, md: 3 }}>
                  <form.Field name={`fields[${i}].type`}>
                    {({ state, handleChange, handleBlur }) => (
                      <MuiTextField
                        select
                        label='Type'
                        id={`fields[${i}].type`}
                        value={state.value}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        required
                        fullWidth
                        variant='outlined'
                        color={state.meta.errors.length ? 'error' : 'primary'}
                        sx={{ minWidth: 100 }}
                      >
                        {typesenseFieldType.options.map((o: FieldType) => (
                          <MenuItem value={o} key={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </MuiTextField>
                    )}
                  </form.Field>
                </Grid>
                <Grid size={{ xs: 2, md: 1 }}>
                  <IconButton
                    onClick={() => removeValue(i)}
                    aria-label='remove'
                  >
                    <RemoveRounded />
                  </IconButton>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction='row' spacing={2}>
                    <form.AppField name={`fields[${i}].facet`}>
                      {({ Checkbox }) => (
                        <Checkbox label='Facet' value={`fields[${i}].facet`} />
                      )}
                    </form.AppField>
                    <form.AppField name={`fields[${i}].optional`}>
                      {({ Checkbox }) => (
                        <Checkbox
                          label='Optional'
                          value={`fields[${i}].optional`}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name={`fields[${i}].index`}>
                      {({ Checkbox }) => (
                        <Checkbox label='Index' value={`fields[${i}].index`} />
                      )}
                    </form.AppField>
                    <form.AppField name={`fields[${i}].store`}>
                      {({ Checkbox }) => (
                        <Checkbox label='Store' value={`fields[${i}].store`} />
                      )}
                    </form.AppField>
                    <form.AppField name={`fields[${i}].sort`}>
                      {({ Checkbox }) => (
                        <Checkbox label='Sort' value={`fields[${i}].sort`} />
                      )}
                    </form.AppField>
                    <form.AppField name={`fields[${i}].infix`}>
                      {({ Checkbox }) => (
                        <Checkbox label='Infix' value={`fields[${i}].infix`} />
                      )}
                    </form.AppField>
                    <form.AppField name={`fields[${i}].range_index`}>
                      {({ Checkbox }) => (
                        <Checkbox
                          label='Range Index'
                          value={`fields[${i}].range_index`}
                        />
                      )}
                    </form.AppField>
                  </Stack>
                </Grid>
                {/* <Grid size={{ xs: 12 }}>
                        <Accordion
                          expanded={expanded === `fields-${i}`}
                          onChange={handleAccordion(`fields-${i}`)}
                          slots={{
                            heading: () => (
                              <div
                                onClick={(e) => {
                                  handleAccordion(`fields-${i}`)(
                                    e,
                                    expanded === `fields-${i}`
                                  );
                                }}
                              >
                                test
                              </div>
                            ),
                          }}
                        >
                          <AccordionDetails>
                            <Stack direction='row' spacing={2}>
                              <form.AppField name={`fields[${i}].locale`}>
                                {({
                                  TextField,
                                  state,
                                  handleChange,
                                  handleBlur,
                                }) => (
                                  <TextField
                                    select
                                    label='Locale'
                                    id={`fields[${i}].locale`}
                                    value={state.value}
                                    // onChange={(e) => handleChange(e.target.value)}
                                    // onBlur={handleBlur}
                                    required
                                    fullWidth
                                    variant='outlined'
                                    color={
                                      state.meta.errors.length
                                        ? 'error'
                                        : 'primary'
                                    }
                                    sx={{ minWidth: 60 }}
                                  >
                                    <MenuItem value={''}>{'--'}</MenuItem>
                                    {languageCodes.options.map((o) => (
                                      <MenuItem value={o} key={o}>
                                        {o}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                )}
                              </form.AppField>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      </Grid> */}
              </Grid>
            ))}
            <IconButton
              onClick={() => pushValue(NEW_EMPTY_FIELD)}
              aria-label='add another field'
            >
              <AddRounded />
            </IconButton>
          </>
        )}
      </form.AppField>
    );
  },
});
