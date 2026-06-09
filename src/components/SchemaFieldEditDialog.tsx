import {
  ChipMultiField,
  primaryButtonSx,
  smallButtonSx,
} from '@/components/redesign';
import { fieldInputSx } from '@/constants/redesignSx';
import { designTokens } from '@/theme/themePrimitives';
import {
  embedForm,
  typesenseFieldType,
  type EmbedFormValues,
  type EmbedProvider,
  type FieldEmbed,
  type GcpAuthMode,
} from '@/types';
import { CheckRounded, OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import type {
  CollectionFieldSchema,
  FieldType,
} from 'typesense/lib/Typesense/Collection';

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 600,
      color: designTokens.text,
      mb: 0.75,
    }}
  >
    {children}
  </Typography>
);

const InlineCode = ({ children }: { children: ReactNode }) => (
  <Box
    component='code'
    sx={{ fontFamily: designTokens.fontMono, fontSize: 11 }}
  >
    {children}
  </Box>
);

const EmbedField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  helper?: ReactNode;
}) => (
  <Box>
    <FieldLabel>{label}</FieldLabel>
    <TextField
      fullWidth
      size='small'
      type={type}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      autoComplete='off'
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={fieldInputSx}
    />
    {helper ? (
      <Typography
        sx={{ fontSize: 11.5, color: designTokens.textMuted, mt: 0.5 }}
      >
        {helper}
      </Typography>
    ) : null}
  </Box>
);

interface SchemaFieldEditDialogProps {
  field: CollectionFieldSchema | null;
  /** When true, opens the dialog in create mode (with an editable name field). */
  creating?: boolean;
  /** Sibling fields in the collection — used as `embed.from` options. */
  availableFields?: CollectionFieldSchema[];
  onClose: () => void;
  onSave: (updated: CollectionFieldSchema) => void;
  /** Called instead of onSave when in create mode. */
  onCreate?: (created: CollectionFieldSchema) => void;
  saving?: boolean;
}

// `float[]` is the vector field type; vector/embed controls only apply to it.
const VECTOR_TYPE: FieldType = 'float[]';
const DEFAULT_EMBED_MODEL = 'ts/all-MiniLM-L12-v2';
const VEC_DIST_OPTIONS = ['cosine', 'ip'] as const;
// Fields whose text can be auto-embedded.
const EMBEDDABLE_TYPES = new Set<FieldType>(['string', 'string[]']);

const EMBED_PROVIDERS: { value: EmbedProvider; label: string }[] = [
  { value: 'builtin', label: 'Built-in (ts/…)' },
  { value: 'openai', label: 'OpenAI / Google PaLM' },
  { value: 'azure', label: 'Azure / OpenAI-compatible' },
  { value: 'gcp_vertex', label: 'GCP Vertex AI' },
  { value: 'custom', label: 'Custom (self-hosted)' },
];

interface EditState {
  name: string;
  type: FieldType;
  index: boolean;
  facet: boolean;
  sort: boolean;
  range_index: boolean;
  optional: boolean;
  num_dim: string;
  autoEmbed: boolean;
  embedFrom: string[];
  embedModelName: string;
  embedApiKey: string;
  embedUrl: string;
  embedIndexingPrefix: string;
  embedQueryPrefix: string;
  embedProvider: EmbedProvider;
  embedAccessToken: string;
  embedRefreshToken: string;
  embedClientId: string;
  embedClientSecret: string;
  embedProjectId: string;
  embedGcpAuthMode: GcpAuthMode;
  embedSaClientEmail: string;
  embedSaPrivateKey: string;
  vecDist: string;
}

// When editing an existing field, recover which provider its model_config used.
const inferEmbedProvider = (
  mc: FieldEmbed['model_config'] | undefined,
): EmbedProvider => {
  if (!mc) return 'builtin';
  if (mc.access_token || mc.refresh_token || mc.client_id || mc.service_account)
    return 'gcp_vertex';
  if (mc.url) return 'azure';
  if (mc.indexing_prefix || mc.query_prefix) return 'custom';
  if (mc.api_key) return 'openai';
  return 'builtin';
};

const buildInitialState = (field: CollectionFieldSchema | null): EditState => {
  const embed = field?.embed as FieldEmbed | undefined;
  return {
    name: field?.name ?? '',
    type: (field?.type as FieldType) ?? 'string',
    index: field?.index ?? true,
    facet: field?.facet ?? false,
    sort: field?.sort ?? false,
    range_index: field?.range_index ?? false,
    optional: field?.optional ?? false,
    num_dim: field?.num_dim != null ? String(field.num_dim) : '',
    autoEmbed: Boolean(embed),
    embedFrom: embed?.from ?? [],
    embedModelName: embed?.model_config?.model_name ?? DEFAULT_EMBED_MODEL,
    embedApiKey: embed?.model_config?.api_key ?? '',
    embedUrl: embed?.model_config?.url ?? '',
    embedIndexingPrefix: embed?.model_config?.indexing_prefix ?? '',
    embedQueryPrefix: embed?.model_config?.query_prefix ?? '',
    embedProvider: inferEmbedProvider(embed?.model_config),
    embedAccessToken: embed?.model_config?.access_token ?? '',
    embedRefreshToken: embed?.model_config?.refresh_token ?? '',
    embedClientId: embed?.model_config?.client_id ?? '',
    embedClientSecret: embed?.model_config?.client_secret ?? '',
    embedProjectId: embed?.model_config?.project_id ?? '',
    embedGcpAuthMode: embed?.model_config?.service_account
      ? 'service_account'
      : 'oauth',
    embedSaClientEmail: embed?.model_config?.service_account?.client_email ?? '',
    embedSaPrivateKey: embed?.model_config?.service_account?.private_key ?? '',
    vecDist: (field?.vec_dist as string) ?? 'cosine',
  };
};

const TOGGLES: {
  key: keyof Omit<EditState, 'type'>;
  label: string;
  help: string;
  /** Toggles meaningless for vector (`float[]`) fields are hidden for them. */
  vectorSafe?: boolean;
}[] = [
  {
    key: 'index',
    label: 'Index',
    help: 'Include this field in the search index',
  },
  { key: 'facet', label: 'Facet', help: 'Enable faceting on this field' },
  { key: 'sort', label: 'Sort', help: 'Allow sorting results by this field' },
  {
    key: 'range_index',
    label: 'Range',
    help: 'Enable range queries (numeric fields)',
  },
  {
    key: 'optional',
    label: 'Optional',
    help: 'Documents may omit this field',
    vectorSafe: true,
  },
];

// Map the dialog's flat edit state onto the `embedForm` Zod schema's inputs,
// which owns per-provider validation and builds the `embed` payload.
const toEmbedFormValues = (s: EditState): EmbedFormValues => ({
  provider: s.embedProvider,
  from: s.embedFrom,
  model_name: s.embedModelName,
  api_key: s.embedApiKey,
  url: s.embedUrl,
  indexing_prefix: s.embedIndexingPrefix,
  query_prefix: s.embedQueryPrefix,
  gcp_auth_mode: s.embedGcpAuthMode,
  access_token: s.embedAccessToken,
  refresh_token: s.embedRefreshToken,
  client_id: s.embedClientId,
  client_secret: s.embedClientSecret,
  project_id: s.embedProjectId,
  sa_client_email: s.embedSaClientEmail,
  sa_private_key: s.embedSaPrivateKey,
});

export const SchemaFieldEditDialog = ({
  field,
  creating,
  availableFields,
  onClose,
  onSave,
  onCreate,
  saving,
}: SchemaFieldEditDialogProps) => {
  const isCreate = Boolean(creating) && !field;
  const open = Boolean(field) || Boolean(creating);

  const [state, setState] = useState<EditState | null>(
    open ? buildInitialState(field) : null,
  );

  useEffect(() => {
    setState(open ? buildInitialState(field) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, creating]);

  const isVector = state?.type === VECTOR_TYPE;

  // Vector fields can't be faceted/sorted/range-indexed — only show toggles
  // that make sense for them.
  const visibleToggles = isVector
    ? TOGGLES.filter((t) => t.vectorSafe)
    : TOGGLES;

  // Text fields that can be embedded from, excluding the field being edited.
  const embedFromOptions = (availableFields ?? [])
    .filter(
      (f) =>
        EMBEDDABLE_TYPES.has(f.type as FieldType) && f.name !== state?.name,
    )
    .map((f) => f.name);

  // A vector field needs either explicit dimensions OR an auto-embed config
  // that passes the `embedForm` schema; guard the save button accordingly.
  const vectorInvalid =
    isVector &&
    (state!.autoEmbed
      ? !embedForm.safeParse(toEmbedFormValues(state!)).success
      : !(
          Number.isInteger(Number(state!.num_dim)) && Number(state!.num_dim) > 0
        ));

  const handleSave = () => {
    if (!state) return;
    const isVectorField = state.type === VECTOR_TYPE;
    const payload: CollectionFieldSchema = {
      name: state.name.trim(),
      type: state.type,
      // Vectors are always indexed; faceting/sorting/range don't apply.
      index: isVectorField ? true : state.index,
      facet: isVectorField ? false : state.facet,
      sort: isVectorField ? false : state.sort,
      range_index: isVectorField ? false : state.range_index,
      optional: state.optional,
    };
    if (isVectorField) {
      if (state.autoEmbed) {
        const parsed = embedForm.safeParse(toEmbedFormValues(state));
        // Guarded by `vectorInvalid`, but bail rather than emit a bad payload.
        if (!parsed.success) return;
        payload.embed = parsed.data as CollectionFieldSchema['embed'];
      } else {
        const dim = parseInt(state.num_dim, 10);
        if (!Number.isNaN(dim)) payload.num_dim = dim;
      }
      if (state.vecDist) payload.vec_dist = state.vecDist;
    }
    if (isCreate) {
      if (!payload.name) return;
      onCreate?.(payload);
    } else {
      onSave(payload);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth='xs'
      fullWidth
      slotProps={{
        paper: {
          sx: {
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1.5,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: 15,
          fontWeight: 600,
          color: designTokens.text,
          borderBottom: `1px solid ${designTokens.border}`,
          py: 1.75,
        }}
      >
        {isCreate ? 'Add field' : 'Edit field'}
        {field ? (
          <Box
            component='span'
            sx={{
              ml: 1,
              fontFamily: designTokens.fontMono,
              fontSize: 13,
              color: designTokens.textMuted,
              fontWeight: 500,
            }}
          >
            {field.name}
          </Box>
        ) : null}
      </DialogTitle>

      <DialogContent sx={{ '&&': { py: 2, px: 2.5 } }}>
        {state ? (
          <Stack sx={{ gap: 2 }}>
            {isCreate ? (
              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: designTokens.text,
                    mb: 0.75,
                  }}
                >
                  Name
                </Typography>
                <TextField
                  fullWidth
                  autoFocus
                  size='small'
                  placeholder='field_name'
                  value={state.name}
                  onChange={(e) => setState({ ...state, name: e.target.value })}
                  sx={fieldInputSx}
                />
              </Box>
            ) : null}

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: designTokens.text,
                  mb: 0.75,
                }}
              >
                Type
              </Typography>
              <TextField
                select
                fullWidth
                size='small'
                value={state.type}
                onChange={(e) =>
                  setState({ ...state, type: e.target.value as FieldType })
                }
                sx={fieldInputSx}
              >
                {typesenseFieldType.options.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
              {!isCreate ? (
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: designTokens.textMuted,
                    mt: 0.5,
                  }}
                >
                  Changing type drops &amp; re-adds this field, triggering a
                  re-index.
                </Typography>
              ) : null}
            </Box>

            {isVector ? (
              <Box
                sx={{
                  border: `1px solid ${designTokens.border}`,
                  borderRadius: 1,
                  p: 1.5,
                  background: designTokens.surfaceTinted,
                }}
              >
                <Stack
                  direction='row'
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: designTokens.text,
                      }}
                    >
                      Auto-embed
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        color: designTokens.textMuted,
                        lineHeight: 1.4,
                      }}
                    >
                      Generate vectors from other fields with an embedding model
                    </Typography>
                  </Box>
                  <Switch
                    size='small'
                    checked={state.autoEmbed}
                    onChange={(_, checked) =>
                      setState({ ...state, autoEmbed: checked })
                    }
                  />
                </Stack>

                {state.autoEmbed ? (
                  <Stack sx={{ gap: 1.5, mt: 1.5 }}>
                    <Box>
                      <FieldLabel>Embed from fields</FieldLabel>
                      <ChipMultiField
                        values={state.embedFrom}
                        options={embedFromOptions}
                        placeholder='Add field...'
                        onAdd={(val) => {
                          if (!state.embedFrom.includes(val))
                            setState({
                              ...state,
                              embedFrom: [...state.embedFrom, val],
                            });
                        }}
                        onRemove={(i) =>
                          setState({
                            ...state,
                            embedFrom: state.embedFrom.filter(
                              (_, idx) => idx !== i,
                            ),
                          })
                        }
                      />
                      {embedFromOptions.length === 0 ? (
                        <Typography
                          sx={{
                            fontSize: 11.5,
                            color: designTokens.textMuted,
                            mt: 0.5,
                          }}
                        >
                          Add a <InlineCode>string</InlineCode> or{' '}
                          <InlineCode>string[]</InlineCode> field first to embed
                          from.
                        </Typography>
                      ) : null}
                    </Box>
                    <Box>
                      <FieldLabel>Provider</FieldLabel>
                      <TextField
                        select
                        fullWidth
                        size='small'
                        value={state.embedProvider}
                        onChange={(e) =>
                          setState({
                            ...state,
                            embedProvider: e.target.value as EmbedProvider,
                          })
                        }
                        sx={fieldInputSx}
                      >
                        {EMBED_PROVIDERS.map((p) => (
                          <MenuItem key={p.value} value={p.value}>
                            {p.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <EmbedField
                      label='Model name'
                      placeholder={DEFAULT_EMBED_MODEL}
                      value={state.embedModelName}
                      onChange={(v) =>
                        setState({ ...state, embedModelName: v })
                      }
                      helper={
                        <>
                          e.g. <InlineCode>ts/e5-small</InlineCode>,{' '}
                          <InlineCode>openai/text-embedding-3-small</InlineCode>,
                          or a Vertex model.{' '}
                          <Link
                            href='https://typesense.org/docs/30.2/api/vector-search.html#index-embeddings'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            Supported models{' '}
                            <OpenInNewRounded fontSize='inherit' />
                          </Link>
                        </>
                      }
                    />

                    {(state.embedProvider === 'openai' ||
                      state.embedProvider === 'azure') && (
                      <EmbedField
                        label='API key'
                        type='password'
                        placeholder='Provider API key'
                        value={state.embedApiKey}
                        onChange={(v) => setState({ ...state, embedApiKey: v })}
                      />
                    )}

                    {state.embedProvider === 'azure' && (
                      <EmbedField
                        label='API endpoint URL'
                        placeholder='https://your-resource.openai.azure.com/...'
                        value={state.embedUrl}
                        onChange={(v) => setState({ ...state, embedUrl: v })}
                        helper={
                          <>
                            Azure OpenAI or OpenAI-compatible endpoint (model
                            name must start with{' '}
                            <InlineCode>openai</InlineCode>).
                          </>
                        }
                      />
                    )}

                    {state.embedProvider === 'gcp_vertex' && (
                      <Stack sx={{ gap: 1.5 }}>
                        <EmbedField
                          label='Project ID'
                          placeholder='my-gcp-project'
                          value={state.embedProjectId}
                          onChange={(v) =>
                            setState({ ...state, embedProjectId: v })
                          }
                        />
                        <Box>
                          <FieldLabel>Authentication</FieldLabel>
                          <ToggleButtonGroup
                            exclusive
                            size='small'
                            value={state.embedGcpAuthMode}
                            onChange={(_, next: GcpAuthMode | null) =>
                              next &&
                              setState({ ...state, embedGcpAuthMode: next })
                            }
                            sx={{
                              border: `1px solid ${designTokens.border}`,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: designTokens.surface,
                              '& .MuiToggleButtonGroup-grouped': {
                                border: 'none',
                                borderRadius: 0,
                                height: 28,
                                px: 1.625,
                                textTransform: 'none',
                                fontSize: 11,
                                fontWeight: 500,
                                color: designTokens.textMuted,
                                borderLeft: `1px solid ${designTokens.border}`,
                                '&:first-of-type': { borderLeft: 'none' },
                                '&.Mui-selected': {
                                  fontWeight: 600,
                                  color: designTokens.accent,
                                  background: designTokens.accentSoft,
                                  '&:hover': {
                                    background: designTokens.accentSoft,
                                  },
                                },
                              },
                            }}
                          >
                            <ToggleButton value='oauth'>OAuth</ToggleButton>
                            <ToggleButton value='service_account'>
                              Service account
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>

                        {state.embedGcpAuthMode === 'oauth' ? (
                          <>
                            <EmbedField
                              label='Access token'
                              type='password'
                              value={state.embedAccessToken}
                              onChange={(v) =>
                                setState({ ...state, embedAccessToken: v })
                              }
                            />
                            <EmbedField
                              label='Refresh token'
                              type='password'
                              value={state.embedRefreshToken}
                              onChange={(v) =>
                                setState({ ...state, embedRefreshToken: v })
                              }
                            />
                            <Stack direction='row' sx={{ gap: 1.5 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <EmbedField
                                  label='Client ID'
                                  value={state.embedClientId}
                                  onChange={(v) =>
                                    setState({ ...state, embedClientId: v })
                                  }
                                />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <EmbedField
                                  label='Client secret'
                                  type='password'
                                  value={state.embedClientSecret}
                                  onChange={(v) =>
                                    setState({
                                      ...state,
                                      embedClientSecret: v,
                                    })
                                  }
                                />
                              </Box>
                            </Stack>
                          </>
                        ) : (
                          <>
                            <EmbedField
                              label='Client email'
                              placeholder='svc@my-project.iam.gserviceaccount.com'
                              value={state.embedSaClientEmail}
                              onChange={(v) =>
                                setState({ ...state, embedSaClientEmail: v })
                              }
                            />
                            <EmbedField
                              label='Private key'
                              type='password'
                              multiline
                              placeholder='-----BEGIN PRIVATE KEY-----'
                              value={state.embedSaPrivateKey}
                              onChange={(v) =>
                                setState({ ...state, embedSaPrivateKey: v })
                              }
                            />
                          </>
                        )}
                      </Stack>
                    )}

                    {state.embedProvider === 'custom' && (
                      <Stack direction='row' sx={{ gap: 1.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <EmbedField
                            label='Indexing prefix'
                            placeholder='e.g. passage:'
                            value={state.embedIndexingPrefix}
                            onChange={(v) =>
                              setState({ ...state, embedIndexingPrefix: v })
                            }
                          />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <EmbedField
                            label='Query prefix'
                            placeholder='e.g. query:'
                            value={state.embedQueryPrefix}
                            onChange={(v) =>
                              setState({ ...state, embedQueryPrefix: v })
                            }
                          />
                        </Box>
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ mt: 1.5 }}>
                    <FieldLabel>Dimensions (num_dim)</FieldLabel>
                    <TextField
                      fullWidth
                      size='small'
                      type='number'
                      placeholder='e.g. 768'
                      value={state.num_dim}
                      onChange={(e) =>
                        setState({ ...state, num_dim: e.target.value })
                      }
                      sx={fieldInputSx}
                    />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        color: designTokens.textMuted,
                        mt: 0.5,
                      }}
                    >
                      Required length of the vectors you index yourself.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 1.5 }}>
                  <FieldLabel>Distance metric</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    size='small'
                    value={state.vecDist}
                    onChange={(e) =>
                      setState({ ...state, vecDist: e.target.value })
                    }
                    sx={fieldInputSx}
                  >
                    {VEC_DIST_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            ) : null}

            <Stack sx={{ gap: 0.5 }}>
              {visibleToggles.map((t) => (
                <Stack
                  key={t.key}
                  direction='row'
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    py: 0.75,
                    borderBottom: `1px solid ${designTokens.border}`,
                    '&:last-of-type': { borderBottom: 'none' },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: designTokens.text,
                      }}
                    >
                      {t.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        color: designTokens.textMuted,
                        lineHeight: 1.4,
                      }}
                    >
                      {t.help}
                    </Typography>
                  </Box>
                  <Switch
                    size='small'
                    checked={Boolean(state[t.key])}
                    onChange={(_, checked) =>
                      setState({ ...state, [t.key]: checked })
                    }
                  />
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.75,
          py: 1.75,
          borderTop: `1px solid ${designTokens.border}`,
          gap: 1,
        }}
      >
        <Button
          variant='outlined'
          size='small'
          onClick={onClose}
          disabled={saving}
          sx={smallButtonSx}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          size='small'
          onClick={handleSave}
          loading={saving}
          disabled={(isCreate && !state?.name.trim()) || vectorInvalid}
          startIcon={<CheckRounded sx={{ fontSize: 14 }} />}
          sx={primaryButtonSx}
        >
          {isCreate ? 'Add field' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
