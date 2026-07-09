import { primaryButtonSx, smallButtonSx } from '@/components/redesign';
import { VectorFieldConfig } from '@/components/VectorFieldConfig';
import { fieldInputSx } from '@/constants/redesignSx';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseFieldType } from '@/types';
import {
  buildVectorConfigState,
  vectorConfigInvalid,
  applyVectorConfig,
  VECTOR_TYPE,
  type VectorConfigState,
} from '@/utils';
import { CheckRounded, LinkRounded } from '@mui/icons-material';
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
import { useEffect, useState } from 'react';
import type {
  CollectionFieldSchema,
  FieldType,
} from 'typesense/lib/Typesense/Collection';

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

// Fields whose text can be auto-embedded.
const EMBEDDABLE_TYPES = new Set<FieldType>(['string', 'string[]']);

interface EditState {
  name: string;
  type: FieldType;
  index: boolean;
  facet: boolean;
  sort: boolean;
  range_index: boolean;
  optional: boolean;
  vector: VectorConfigState;
}

const buildInitialState = (field: CollectionFieldSchema | null): EditState => ({
  name: field?.name ?? '',
  type: (field?.type as FieldType) ?? 'string',
  index: field?.index ?? true,
  facet: field?.facet ?? false,
  sort: field?.sort ?? false,
  range_index: field?.range_index ?? false,
  optional: field?.optional ?? false,
  vector: buildVectorConfigState(field),
});

const TOGGLES: {
  key: keyof Omit<EditState, 'type' | 'vector'>;
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

  // Text fields that can be embedded from, excluding the field being edited.
  const embedFromOptions = (availableFields ?? [])
    .filter(
      (f) =>
        EMBEDDABLE_TYPES.has(f.type as FieldType) && f.name !== state?.name,
    )
    .map((f) => f.name);

  // A vector field needs either explicit dimensions OR an auto-embed config
  // that passes the `embedForm` schema; guard the save button accordingly.
  const vectorInvalid = isVector && vectorConfigInvalid(state!.vector);

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
    if (isVectorField && !applyVectorConfig(payload, state.vector)) {
      // Guarded by `vectorInvalid`, but bail rather than emit a bad payload.
      return;
    }
    // References are fixed at creation; carry the existing value through so a
    // drop + re-add edit doesn't silently strip it.
    if (field?.reference) {
      payload.reference = field.reference as string;
      if (field.async_reference) payload.async_reference = true;
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

            {field?.reference ? (
              <Box
                sx={{
                  border: `1px solid ${designTokens.accentBorder}`,
                  borderRadius: 1,
                  p: 1.5,
                  background: designTokens.accentSoft,
                }}
              >
                <Stack
                  direction='row'
                  sx={{ alignItems: 'center', gap: 0.75, mb: 0.5 }}
                >
                  <LinkRounded
                    sx={{ fontSize: 14, color: designTokens.accentDeep }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: designTokens.accentDeep,
                    }}
                  >
                    Reference (JOIN)
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    fontFamily: designTokens.fontMono,
                    fontSize: 12,
                    color: designTokens.text,
                  }}
                >
                  {String(field.reference)}
                  {field.async_reference ? ' (async)' : ''}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: designTokens.textMuted,
                    mt: 0.5,
                    lineHeight: 1.45,
                  }}
                >
                  References are fixed at creation and carried through edits;
                  Typesense cannot add or change them on an existing
                  collection.
                </Typography>
              </Box>
            ) : null}

            {isVector && state ? (
              <VectorFieldConfig
                state={state.vector}
                onChange={(vector) => setState({ ...state, vector })}
                fromOptions={embedFromOptions}
              />
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
