import { designTokens } from '@/theme/themePrimitives';
import { ExpandMoreRounded } from '@mui/icons-material';
import {
  Box,
  Chip,
  Autocomplete as MuiAutocomplete,
  TextField as MuiTextField,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useMemo, useState } from 'react';

const MAX_CHIPS_VISIBLE = 3;

const sectionBoxSx: SxProps<Theme> = {
  border: `1px solid ${designTokens.border}`,
  borderRadius: '8px',
  p: '8px',
};

const paramChipSx: SxProps<Theme> = {
  height: 24,
  fontSize: 12,
  fontFamily: designTokens.fontMono,
  background: designTokens.surfaceMuted,
  border: `1px solid ${designTokens.border}`,
  borderRadius: '5px',
  color: designTokens.text,
  '& .MuiChip-deleteIcon': {
    fontSize: 13,
    color: designTokens.textFaint,
    '&:hover': { color: designTokens.text },
  },
};

const addChipInputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontSize: 12.5,
    minHeight: 28,
    py: 0,
    px: '8px',
    borderRadius: '5px',
    fontFamily: designTokens.fontMono,
    '& fieldset': {
      borderColor: designTokens.border,
      borderStyle: 'dashed',
      transition: 'border-color 120ms ease',
    },
    '&:hover fieldset': { borderColor: designTokens.borderStrong },
    '&.Mui-focused fieldset': {
      borderColor: designTokens.accent,
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    '& input': {
      fontSize: 12.5,
      padding: '0 4px !important',
      fontFamily: designTokens.fontMono,
      color: designTokens.textFaint,
    },
    '& input::placeholder': { color: designTokens.textFaint, opacity: 1 },
    '& .MuiAutocomplete-endAdornment': { right: 4 },
  },
};

const paperSx = {
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
};

export interface ChipMultiFieldProps {
  values: string[];
  options: string[];
  onAdd: (val: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}

export const ChipMultiField = ({
  values,
  options,
  onAdd,
  onRemove,
  placeholder = 'Add field...',
}: ChipMultiFieldProps) => {
  const [expanded, setExpanded] = useState(false);
  const overflow = values.length - MAX_CHIPS_VISIBLE;
  const visible =
    expanded || overflow <= 0 ? values : values.slice(0, MAX_CHIPS_VISIBLE);
  const availableOptions = useMemo(
    () => options.filter((o) => !values.includes(o)),
    [options, values],
  );

  return (
    <Box sx={sectionBoxSx}>
      {values.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: '6px' }}>
          {visible.map((val, i) => (
            <Chip
              key={`${val}-${i}`}
              label={val}
              size='small'
              onDelete={() => onRemove(i)}
              sx={paramChipSx}
            />
          ))}
          {!expanded && overflow > 0 && (
            <Chip
              label={`+${overflow}more`}
              size='small'
              onClick={() => setExpanded(true)}
              sx={{
                ...paramChipSx,
                border: `1px dashed ${designTokens.border}`,
                background: 'transparent',
                color: designTokens.textMuted,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: designTokens.borderStrong,
                  color: designTokens.text,
                },
              }}
            />
          )}
        </Box>
      )}
      <MuiAutocomplete<string>
        options={availableOptions}
        value={null}
        onChange={(_, newVal) => {
          if (newVal) onAdd(newVal);
        }}
        blurOnSelect
        clearOnBlur
        renderInput={(params) => (
          <MuiTextField {...params} placeholder={placeholder} sx={addChipInputSx} />
        )}
        slotProps={{ paper: { sx: paperSx } }}
        popupIcon={
          <ExpandMoreRounded sx={{ fontSize: 15, color: designTokens.textFaint }} />
        }
        sx={{ '& .MuiAutocomplete-popupIndicator': { mr: '-2px' } }}
      />
    </Box>
  );
};
