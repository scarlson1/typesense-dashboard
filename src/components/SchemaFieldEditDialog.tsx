import { fieldInputSx, primaryButtonSx, smallButtonSx } from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseFieldType } from '@/types';
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
import { useEffect, useState } from 'react';
import type {
  CollectionFieldSchema,
  FieldType,
} from 'typesense/lib/Typesense/Collection';

interface SchemaFieldEditDialogProps {
  field: CollectionFieldSchema | null;
  /** When true, opens the dialog in create mode (with an editable name field). */
  creating?: boolean;
  onClose: () => void;
  onSave: (updated: CollectionFieldSchema) => void;
  /** Called instead of onSave when in create mode. */
  onCreate?: (created: CollectionFieldSchema) => void;
  saving?: boolean;
}

interface EditState {
  name: string;
  type: FieldType;
  index: boolean;
  facet: boolean;
  sort: boolean;
  range_index: boolean;
  optional: boolean;
}

const buildInitialState = (field: CollectionFieldSchema | null): EditState => ({
  name: field?.name ?? '',
  type: (field?.type as FieldType) ?? 'string',
  index: field?.index ?? true,
  facet: field?.facet ?? false,
  sort: field?.sort ?? false,
  range_index: field?.range_index ?? false,
  optional: field?.optional ?? false,
});

const TOGGLES: { key: keyof Omit<EditState, 'type'>; label: string; help: string }[] = [
  { key: 'index', label: 'Index', help: 'Include this field in the search index' },
  { key: 'facet', label: 'Facet', help: 'Enable faceting on this field' },
  { key: 'sort', label: 'Sort', help: 'Allow sorting results by this field' },
  { key: 'range_index', label: 'Range', help: 'Enable range queries (numeric fields)' },
  { key: 'optional', label: 'Optional', help: 'Documents may omit this field' },
];

export const SchemaFieldEditDialog = ({
  field,
  creating,
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

  const handleSave = () => {
    if (!state) return;
    const payload: CollectionFieldSchema = {
      name: state.name.trim(),
      type: state.type,
      index: state.index,
      facet: state.facet,
      sort: state.sort,
      range_index: state.range_index,
      optional: state.optional,
    };
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

      <DialogContent sx={{ py: 2.25, px: 2.75 }}>
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
                  onChange={(e) =>
                    setState({ ...state, name: e.target.value })
                  }
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

            <Stack sx={{ gap: 0.5 }}>
              {TOGGLES.map((t) => (
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
                    checked={state[t.key]}
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
          disabled={isCreate && !state?.name.trim()}
          startIcon={<CheckRounded sx={{ fontSize: 14 }} />}
          sx={primaryButtonSx}
        >
          {isCreate ? 'Add field' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
