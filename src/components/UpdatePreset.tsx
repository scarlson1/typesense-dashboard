import {
  DEFAULT_PRESET_VALUES,
  EMPTY_PRESET_PARAMS,
  presetsFormOpts,
  presetType,
  type MultiParameterKeys,
  type ParameterKeys,
} from '@/constants';
import {
  useAppForm,
  useUpsertPreset,
  type UseUpsertPresetProps,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import {
  ContentCopyOutlined,
  DeleteOutlineRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField as MuiTextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import { PresetsForm } from './PresetsForm';
import {
  primaryButtonSx,
  smallButtonSx,
  dangerButtonSx,
} from './redesign';

interface UpdatePresetProps<T extends DocumentSchema> {
  defaultValues?: any;
  mutationProps?: UseUpsertPresetProps<T>;
  isNew?: boolean;
  presetName?: string;
  presetMeta?: {
    type: 'single' | 'multi';
    paramCount: number;
  };
  onDelete?: () => void;
  onDuplicate?: () => void;
  isDeleting?: boolean;
}

export function UpdatePreset<T extends DocumentSchema = DocumentSchema>({
  defaultValues = DEFAULT_PRESET_VALUES,
  mutationProps,
  isNew = false,
  presetName,
  presetMeta,
  onDelete,
  onDuplicate,
  isDeleting,
}: UpdatePresetProps<T>) {
  const mutation = useUpsertPreset<T>(mutationProps);

  const form = useAppForm({
    ...presetsFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        let presetValue: PresetCreateSchema<T, string>['value'] = {};
        if (value.presetType === presetType.enum['Single-Collection']) {
          const x = value.searchParameters
            .filter((p: { name: string }) => !!p.name)
            .map((p: { name: ParameterKeys; value: string }) => ({
              [p.name]: p.value,
            }));
          presetValue = Object.assign({}, ...x);
        } else if (value.presetType === presetType.enum['Multi-Search']) {
          presetValue = {
            searches: value.multiSearchParams.map(
              (p: { name: MultiParameterKeys; value: string }[]) =>
                Object.assign(
                  {},
                  ...p
                    .filter((params) => !!params.name)
                    .map((params) => ({ [params.name]: params.value })),
                ),
            ),
          };
        }

        await mutation.mutateAsync({
          presetId: value.presetId,
          params: {
            value: presetValue,
          },
        });
        if (isNew) setTimeout(form.reset, 100);
      } catch (err) {
        console.log(err);
      }
    },
  });

  const subtitle = (() => {
    if (isNew) {
      return 'Configure parameters and reference this preset by name from your application.';
    }
    if (!presetMeta) return null;
    const kind =
      presetMeta.type === 'single'
        ? 'Single-collection preset'
        : 'Multi-search preset';
    return `${kind} · ${presetMeta.paramCount} param${presetMeta.paramCount === 1 ? '' : 's'}`;
  })();

  return (
    <Box
      component='form'
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <Box
        sx={{
          background: designTokens.surface,
          border: `1px solid ${designTokens.border}`,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction='row'
          sx={{
            px: 2.25,
            py: 1.75,
            borderBottom: `1px solid ${designTokens.border}`,
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {isNew ? (
              <form.AppField name='presetId'>
                {({ state, handleChange, handleBlur }) => (
                  <MuiTextField
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder='preset_name'
                    variant='standard'
                    required
                    error={state.meta.isTouched && !state.meta.isValid}
                    sx={{
                      width: '100%',
                      maxWidth: 360,
                      '& .MuiInput-root': {
                        fontFamily: designTokens.fontMono,
                        fontSize: 14,
                        fontWeight: 600,
                        color: designTokens.text,
                        '&:before': { borderBottom: 'none' },
                        '&:hover:not(.Mui-disabled):before': {
                          borderBottom: `1px solid ${designTokens.border}`,
                        },
                      },
                      '& input': { p: 0, height: 20 },
                    }}
                  />
                )}
              </form.AppField>
            ) : (
              <Typography
                sx={{
                  fontFamily: designTokens.fontMono,
                  fontSize: 14,
                  fontWeight: 600,
                  color: designTokens.text,
                }}
              >
                {presetName}
              </Typography>
            )}
            {subtitle ? (
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: designTokens.textMuted,
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          <Stack direction='row' spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {!isNew && onDuplicate ? (
              <Tooltip title='Duplicate preset'>
                <Button
                  type='button'
                  onClick={onDuplicate}
                  variant='outlined'
                  size='small'
                  startIcon={<ContentCopyOutlined sx={{ fontSize: 13 }} />}
                  sx={smallButtonSx}
                >
                  Duplicate
                </Button>
              </Tooltip>
            ) : null}
            {!isNew && onDelete ? (
              <Button
                type='button'
                onClick={onDelete}
                variant='outlined'
                size='small'
                disabled={isDeleting}
                startIcon={<DeleteOutlineRounded sx={{ fontSize: 14 }} />}
                sx={dangerButtonSx}
              >
                Delete
              </Button>
            ) : null}
            <form.AppForm>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type='submit'
                    variant='contained'
                    disableElevation
                    loading={isSubmitting}
                    disabled={!canSubmit}
                    sx={primaryButtonSx}
                  >
                    {isNew ? 'Create' : 'Save'}
                  </Button>
                )}
              </form.Subscribe>
            </form.AppForm>
          </Stack>
        </Stack>

        <Box sx={{ px: 2.75, py: 2.25 }}>
          {isNew ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
                pb: 2.25,
                mb: 2.25,
                borderBottom: `1px solid ${designTokens.border}`,
              }}
            >
              <FieldGroup label='Type'>
                <form.AppField name='presetType'>
                  {({ state, handleChange, handleBlur }) => (
                    <MuiTextField
                      select
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      fullWidth
                      size='small'
                      sx={selectSx}
                    >
                      {presetType.options.map((opt) => (
                        <MenuItem key={opt} value={opt} dense>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiTextField>
                  )}
                </form.AppField>
              </FieldGroup>
              <FieldGroup label='Description'>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: designTokens.textMuted,
                    pt: 0.875,
                  }}
                >
                  Single-collection presets apply to a single search. Multi-search
                  presets bundle several searches under one name.
                </Typography>
              </FieldGroup>
            </Box>
          ) : null}

          <PresetsForm form={form} />
        </Box>
      </Box>

      {!isNew ? (
        <Box
          sx={{
            mt: 1.5,
            background: designTokens.codeSurface,
            borderRadius: 1,
            p: 2,
            color: designTokens.codeText,
          }}
        >
          <Stack
            direction='row'
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                color: designTokens.codeTextMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Usage example
            </Typography>
            <IconButton
              size='small'
              onClick={() => {
                const sample = buildUsageExample(presetName ?? 'preset_name');
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(sample).catch(() => {});
                }
              }}
              sx={{
                background: 'transparent',
                border: `1px solid ${designTokens.codeBorder}`,
                borderRadius: '5px',
                px: 1,
                py: '3px',
                fontSize: 11,
                color: designTokens.codeText,
                '&:hover': { background: 'rgba(255,255,255,0.05)' },
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 500 }}>Copy</Typography>
            </IconButton>
          </Stack>
          <Box
            component='pre'
            sx={{
              m: 0,
              fontFamily: designTokens.fontMono,
              fontSize: 11.5,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {buildUsageExample(presetName ?? 'preset_name')}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: designTokens.textFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 0.625,
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const selectSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: designTokens.surface,
    fontSize: 13,
    minHeight: 34,
    borderRadius: '6px',
    '& fieldset': { borderColor: designTokens.border },
    '&:hover fieldset': { borderColor: designTokens.borderStrong },
    '&.Mui-focused fieldset': {
      borderColor: designTokens.accent,
      borderWidth: 1,
    },
  },
  '& .MuiSelect-select': {
    py: '7px',
    fontSize: 13,
  },
};

function buildUsageExample(presetName: string) {
  return `// reference the preset by name in any search call
client.collections('my_collection').documents().search({
  q: 'query',
  preset: '${presetName}',
});`;
}

// Re-export for compatibility with EMPTY_PRESET_PARAMS-using callers
export { EMPTY_PRESET_PARAMS };
