import { primaryButtonSx, smallButtonSx } from '@/components/redesign';
import { fieldInputSx } from '@/constants/redesignSx';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseFieldType } from '@/types';
import { pruneEmpty } from '@/utils';
import { CheckRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Switch,
  TextField,
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

interface FieldEmbed {
  from?: string[];
  model_config?: {
    model_name?: string;
    api_key?: string;
    url?: string;
    indexing_prefix?: string;
    query_prefix?: string;
  };
}

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
  vecDist: string;
}

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

  // indexing_prefix / query_prefix are only honored for self-hosted custom
  // models — not built-in (`ts/`) or managed providers (openai/azure/gcp/palm).
  const embedModel = state?.embedModelName.trim() ?? '';
  const isCustomModel =
    embedModel !== '' && !/^(ts|openai|azure|gcp|palm)\b|\//.test(embedModel);

  // Text fields that can be embedded from, excluding the field being edited.
  const embedFromOptions = (availableFields ?? [])
    .filter(
      (f) =>
        EMBEDDABLE_TYPES.has(f.type as FieldType) && f.name !== state?.name,
    )
    .map((f) => f.name);

  // A vector field needs either explicit dimensions OR an auto-embed config
  // (source fields + model); guard the save button accordingly.
  const vectorInvalid =
    isVector &&
    (state!.autoEmbed
      ? state!.embedFrom.length === 0 || !state!.embedModelName.trim()
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
        payload.embed = {
          from: state.embedFrom,
          model_config: pruneEmpty({
            model_name: state.embedModelName.trim(),
            api_key: state.embedApiKey.trim(),
            url: state.embedUrl.trim(),
            indexing_prefix: state.embedIndexingPrefix.trim(),
            query_prefix: state.embedQueryPrefix.trim(),
          }),
        };
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

      <DialogContent sx={{ py: 2, px: 2.5, pt: 2 }}>
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
                      <TextField
                        select
                        fullWidth
                        size='small'
                        disabled={embedFromOptions.length === 0}
                        value={state.embedFrom}
                        slotProps={{
                          select: {
                            multiple: true,
                            renderValue: (sel) => (sel as string[]).join(', '),
                          },
                        }}
                        onChange={(e) =>
                          setState({
                            ...state,
                            embedFrom:
                              typeof e.target.value === 'string'
                                ? e.target.value.split(',')
                                : (e.target.value as unknown as string[]),
                          })
                        }
                        sx={fieldInputSx}
                      >
                        {embedFromOptions.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </TextField>
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
                      <FieldLabel>Embedding model</FieldLabel>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder={DEFAULT_EMBED_MODEL}
                        value={state.embedModelName}
                        onChange={(e) =>
                          setState({
                            ...state,
                            embedModelName: e.target.value,
                          })
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
                        Built-in models use a <InlineCode>ts/</InlineCode>{' '}
                        prefix; external models (e.g.{' '}
                        <InlineCode>openai/text-embedding-3-small</InlineCode>)
                        need an API key.
                      </Typography>
                    </Box>
                    <Box>
                      <FieldLabel>
                        Model API key (external providers)
                      </FieldLabel>
                      <TextField
                        fullWidth
                        size='small'
                        type='password'
                        autoComplete='off'
                        placeholder='Leave blank for built-in models'
                        value={state.embedApiKey}
                        onChange={(e) =>
                          setState({ ...state, embedApiKey: e.target.value })
                        }
                        sx={fieldInputSx}
                      />
                    </Box>
                    <Box>
                      <FieldLabel>API endpoint URL (optional)</FieldLabel>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder='https://your-resource.openai.azure.com/...'
                        value={state.embedUrl}
                        onChange={(e) =>
                          setState({ ...state, embedUrl: e.target.value })
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
                        For Azure OpenAI or OpenAI-compatible endpoints (model
                        name must start with <InlineCode>openai</InlineCode>).
                      </Typography>
                    </Box>
                    {isCustomModel ? (
                      <Stack direction='row' sx={{ gap: 1.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <FieldLabel>Indexing prefix</FieldLabel>
                          <TextField
                            fullWidth
                            size='small'
                            placeholder='e.g. passage:'
                            value={state.embedIndexingPrefix}
                            onChange={(e) =>
                              setState({
                                ...state,
                                embedIndexingPrefix: e.target.value,
                              })
                            }
                            sx={fieldInputSx}
                          />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <FieldLabel>Query prefix</FieldLabel>
                          <TextField
                            fullWidth
                            size='small'
                            placeholder='e.g. query:'
                            value={state.embedQueryPrefix}
                            onChange={(e) =>
                              setState({
                                ...state,
                                embedQueryPrefix: e.target.value,
                              })
                            }
                            sx={fieldInputSx}
                          />
                        </Box>
                      </Stack>
                    ) : null}
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
