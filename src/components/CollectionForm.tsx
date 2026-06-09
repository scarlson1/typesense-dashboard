import { CollectionFieldsForm } from '@/components/forms/CollectionFieldsForm';
import { FormField, primaryButtonSx, SectionCard } from '@/components/redesign';
import { collectionFormOpts } from '@/constants';
import { withForm } from '@/hooks';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { designTokens } from '@/theme/themePrimitives';
import { CheckRounded, ContentCopyRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  MenuItem,
  TextField as MuiTextField,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { Link } from '@tanstack/react-router';

// Numeric scalar types eligible to be a collection's default sorting field.
const NUMERIC_TYPES = ['int32', 'int64', 'float'];

type CollectionFormValues = (typeof collectionFormOpts)['defaultValues'];

// const fieldInputSx = {
//   '& .MuiOutlinedInput-root': {
//     backgroundColor: designTokens.surface,
//     // minHeight: 38,
//     // borderRadius: '7px',
//     // '& fieldset': { borderColor: designTokens.border },
//     // '&:hover fieldset': { borderColor: designTokens.borderStrong },
//     // '&.Mui-focused fieldset': {
//     //   borderColor: designTokens.accent,
//     //   borderWidth: 1,
//     // },
//     // '& input': {
//     //   // fontSize: 14,
//     //   fontFamily: designTokens.fontMono,
//     //   color: designTokens.text,
//     // },
//     // '& input::placeholder': { color: designTokens.textFaint, opacity: 1 },
//   },
//   // '& .MuiSelect-select': {
//   //   fontFamily: designTokens.fontMono,
//   //   fontSize: 13,
//   //   color: designTokens.text,
//   // },
// };

// Build a clean Typesense schema object from the live form values for the
// summary rail and JSON preview — only non-default flags are emitted.
const buildCollectionSchema = (
  values: CollectionFormValues,
): Record<string, unknown> => {
  const schema: Record<string, unknown> = { name: values.name || '' };
  schema.enable_nested_fields = values.enable_nested_fields;
  if (values.default_sorting_field) {
    schema.default_sorting_field = values.default_sorting_field;
  }
  schema.fields = (values.fields ?? []).map((f) => {
    const out: Record<string, unknown> = {
      name: f.name || '',
      type: f.type || '',
    };
    if (f.facet) out.facet = true;
    if (f.sort) out.sort = true;
    if (f.optional) out.optional = true;
    if (f.infix) out.infix = true;
    if (f.range_index) out.range_index = true;
    if (!f.index) out.index = false;
    if (!f.store) out.store = false;
    return out;
  });
  return schema;
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction='row' sx={{ justifyContent: 'space-between', gap: 1.5 }}>
    <Typography sx={{ fontSize: 12.5, color: designTokens.textMuted }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: 12.5,
        color: designTokens.text,
        fontFamily: designTokens.fontMono,
        textAlign: 'right',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const SchemaPreviewCard = ({ schemaText }: { schemaText: string }) => {
  const [, copy] = useCopyToClipboard();
  return (
    <Box
      sx={{
        backgroundColor: designTokens.surface,
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction='row'
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${designTokens.border}`,
          background: designTokens.surfaceTinted,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{ fontSize: 12.5, fontWeight: 600, color: designTokens.text }}
        >
          Schema preview
        </Typography>
        <Button
          size='small'
          onClick={() => copy(schemaText, true)}
          startIcon={<ContentCopyRounded sx={{ fontSize: 13 }} />}
          sx={{
            textTransform: 'none',
            fontSize: 11.5,
            fontWeight: 500,
            color: designTokens.textFaint,
            minWidth: 0,
            '&:hover': { color: designTokens.text, background: 'transparent' },
          }}
        >
          Copy
        </Button>
      </Stack>
      <Box
        component='pre'
        sx={{
          m: 0,
          px: 2,
          py: 1.75,
          fontFamily: designTokens.fontMono,
          fontSize: 12,
          lineHeight: 1.7,
          color: designTokens.textMuted,
          overflow: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {schemaText}
      </Box>
    </Box>
  );
};

export const CollectionForm = withForm({
  ...collectionFormOpts,
  render: ({ form }) => {
    return (
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: 'flex-start', width: '100%' }}
      >
        {/* Main column */}
        <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {/* Collection details */}
          <SectionCard title='Collection details'>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <FormField
                label='Name'
                hint='required'
                htmlFor='name'
                helperText='Lowercase letters, numbers and underscores.'
              >
                <form.Field name='name'>
                  {({ state, handleChange, handleBlur }) => (
                    <MuiTextField
                      id='name'
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      placeholder='e.g. products'
                      autoFocus
                      required
                      fullWidth
                      error={state.meta.isTouched && !!state.meta.errors.length}
                      // sx={fieldInputSx}
                    />
                  )}
                </form.Field>
              </FormField>

              <FormField
                label='Default sorting field'
                hint='optional'
                helperText='Used to rank results when no sort is given.'
              >
                <form.Subscribe selector={(s) => s.values.fields}>
                  {(fields) => {
                    const numericFields = (fields ?? [])
                      .filter((f) => f.name && NUMERIC_TYPES.includes(f.type))
                      .map((f) => f.name);
                    return (
                      <form.Field name='default_sorting_field'>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiTextField
                            select
                            id='default_sorting_field'
                            value={state.value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            fullWidth
                            // sx={fieldInputSx}
                            slotProps={{
                              select: {
                                displayEmpty: true,
                                renderValue: (v) =>
                                  (v as string) || (
                                    <Box
                                      component='span'
                                      sx={{ color: designTokens.textFaint }}
                                    >
                                      Select a numeric field
                                    </Box>
                                  ),
                              },
                            }}
                          >
                            <MenuItem value='' dense>
                              <Box
                                component='em'
                                sx={{ color: designTokens.textMuted }}
                              >
                                None
                              </Box>
                            </MenuItem>
                            {numericFields.map((name) => (
                              <MenuItem
                                key={name}
                                value={name}
                                dense
                                sx={{
                                  fontFamily: designTokens.fontMono,
                                  fontSize: 13,
                                }}
                              >
                                {name}
                              </MenuItem>
                            ))}
                          </MuiTextField>
                        )}
                      </form.Field>
                    );
                  }}
                </form.Subscribe>
              </FormField>
            </Box>

            {/* Enable nested fields */}
            <form.Field name='enable_nested_fields'>
              {({ state, handleChange }) => (
                <Stack
                  direction='row'
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    px: 1.75,
                    py: 1.5,
                    background: designTokens.surfaceTinted,
                    border: `1px solid ${designTokens.border}`,
                    borderRadius: '8px',
                  }}
                >
                  <Switch
                    color='primary'
                    checked={!!state.value}
                    onChange={(e) => handleChange(e.target.checked)}
                    slotProps={{
                      input: { 'aria-label': 'enable nested fields' },
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: designTokens.text,
                      }}
                    >
                      Enable nested fields
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: designTokens.textFaint,
                        mt: 0.25,
                      }}
                    >
                      Index object and object[] fields with dotted paths.
                    </Typography>
                  </Box>
                </Stack>
              )}
            </form.Field>
          </SectionCard>

          {/* Fields */}
          <CollectionFieldsForm form={form} />
        </Stack>

        {/* Side rail */}
        <Stack
          spacing={1.5}
          sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}
        >
          <form.Subscribe selector={(s) => s.values}>
            {(values) => {
              const schemaText = JSON.stringify(
                buildCollectionSchema(values),
                null,
                2,
              );
              return (
                <>
                  <SectionCard title='Summary'>
                    <Stack spacing={1.25}>
                      <SummaryRow label='Name' value={values.name || '—'} />
                      <SummaryRow
                        label='Fields'
                        value={String(values.fields?.length ?? 0)}
                      />
                      <SummaryRow
                        label='Sorting field'
                        value={values.default_sorting_field || '—'}
                      />
                      <SummaryRow
                        label='Nested fields'
                        value={
                          values.enable_nested_fields ? 'enabled' : 'disabled'
                        }
                      />
                    </Stack>
                    <form.AppForm>
                      <form.SubmitButton
                        label='Create collection'
                        fullWidth
                        startIcon={<CheckRounded sx={{ fontSize: 16 }} />}
                        sx={{
                          ...primaryButtonSx,
                          color: designTokens.onAccent,
                          height: 38,
                          mt: 0.5,
                        }}
                      />
                    </form.AppForm>
                    <Button
                      component={Link}
                      to='/collections'
                      fullWidth
                      sx={{
                        textTransform: 'none',
                        fontSize: 13,
                        fontWeight: 500,
                        height: 34,
                        borderRadius: '7px',
                        color: designTokens.textMuted,
                        border: `1px solid ${designTokens.border}`,
                        '&:hover': {
                          borderColor: designTokens.borderStrong,
                          background: designTokens.surfaceMuted,
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </SectionCard>

                  <SchemaPreviewCard schemaText={schemaText} />
                </>
              );
            }}
          </form.Subscribe>
        </Stack>
      </Stack>
    );
  },
});
