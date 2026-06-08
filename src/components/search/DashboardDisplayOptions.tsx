import { ChipMultiField, FieldRow, ghostButtonSx } from '@/components/redesign';
import { SEARCH_DEFAULT_SLOT_PROPS } from '@/constants';
import { dividerPaperSx as autocompletePaperSx, fieldInputSx } from '@/constants/redesignSx';
import {
  useCollectionSchema,
  useCollectionSearchPreset,
  usePrevious,
  useSearchSlots,
  useTypesenseClient,
  type StoredDisplayOptions,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import {
  Autocomplete,
  Box,
  Button,
  createFilterOptions,
  MenuItem,
  Select,
  Stack,
  TextField,
  type CSSProperties,
  type SelectChangeEvent,
} from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';

const imgFitOptions: CSSProperties['backgroundSize'][] = [
  'auto',
  'contain',
  'cover',
  'inherit',
  'initial',
  'revert',
  'unset',
];
const selectOptions = [1, 2, 3, 4];
interface ImgOption {
  title: string;
  inputValue?: string;
}
const filter = createFilterOptions<ImgOption>();

const selectInputSx = {
  ...fieldInputSx,
  fontFamily: designTokens.fontMono,
  fontSize: 13,
  background: designTokens.surface,
  borderRadius: '6px',
  '& .MuiSelect-select': {
    py: '8px !important',
    px: '10px !important',
    fontFamily: designTokens.fontMono,
    fontSize: 13,
    minHeight: 'unset',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: designTokens.border,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: designTokens.borderStrong,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: designTokens.accent,
    borderWidth: 1,
  },
};

export function DashboardDisplayOptions({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [_, slotProps, updateSlotProps] = useSearchSlots();
  const { data: collectionSchema } = useCollectionSchema();
  const [__, clusterId] = useTypesenseClient();
  const { setStoredDisplayOptions } = useCollectionSearchPreset(
    clusterId,
    collectionSchema.name,
  );

  const fieldOptions = useMemo(() => {
    return collectionSchema.fields
      .map(({ name }) => name)
      .filter((name) => !name.includes('*'));
  }, [collectionSchema]);

  const imageFieldOptions = useMemo<ImgOption[]>(
    () =>
      collectionSchema.fields
        .filter((f) => f.type === 'image')
        .map((f) => ({ title: f.name })),
    [collectionSchema],
  );

  const prevSchemaName = usePrevious(collectionSchema?.name);
  useEffect(() => {
    if (prevSchemaName && prevSchemaName !== collectionSchema.name)
      updateSlotProps(
        {
          hit: { displayFields: [] },
        },
        (_: object, srcValue: object) => {
          if (Array.isArray(srcValue)) return srcValue;
        },
      );
  }, [collectionSchema?.name]);

  const persistDisplay = useCallback(
    (patch: StoredDisplayOptions) => {
      const current: StoredDisplayOptions = {
        displayFields: slotProps.hit?.displayFields ?? [],
        imgField: slotProps.hit?.imgField ?? '', // @ts-expect-error claude
        backgroundSize: slotProps.hitImg?.sx?.backgroundSize ?? '',
        columns:
          typeof slotProps.hitWrapper?.size === 'number'
            ? 12 / slotProps.hitWrapper.size
            : undefined,
      };
      setStoredDisplayOptions({ ...current, ...patch });
    },
    [slotProps, setStoredDisplayOptions],
  );

  const setDisplayFields = useCallback(
    (newVal: string[]) => {
      updateSlotProps(
        {
          hit: { displayFields: newVal },
        },
        (_: object, srcValue: object) => {
          if (Array.isArray(srcValue)) return srcValue;
        },
      );
      persistDisplay({ displayFields: newVal });
    },
    [updateSlotProps, persistDisplay],
  );

  const displayFields = useMemo(
    () => slotProps.hit?.displayFields || [],
    [slotProps.hit?.displayFields],
  );

  const handleAddField = useCallback(
    (field: string) => setDisplayFields([...displayFields, field]),
    [displayFields, setDisplayFields],
  );

  const handleRemoveField = useCallback(
    (index: number) =>
      setDisplayFields(displayFields.filter((_, i) => i !== index)),
    [displayFields, setDisplayFields],
  );

  const handleImageChange = useCallback(
    (_: any, newValue: string | ImgOption | null) => {
      let imgField = '';
      if (typeof newValue === 'string') {
        imgField = newValue || '';
      } else if (newValue?.inputValue) {
        imgField = newValue.inputValue;
      } else {
        imgField = newValue?.title || '';
      }
      updateSlotProps({ hit: { imgField } });
      persistDisplay({ imgField });
    },
    [updateSlotProps, persistDisplay],
  );

  const handleSizeChange = useCallback(
    (e: SelectChangeEvent<number>) => {
      const columns = Number(e.target.value) || 0;
      const size = columns
        ? 12 / columns
        : SEARCH_DEFAULT_SLOT_PROPS.hitWrapper?.size || 12;

      updateSlotProps({
        hitWrapper: {
          size,
        },
      });
      persistDisplay({ columns: columns || undefined });
    },
    [updateSlotProps, persistDisplay],
  );

  const handleImgSizeChange = useCallback(
    (e: SelectChangeEvent) => {
      const backgroundSize = e.target.value || 'auto';
      updateSlotProps({
        hitImg: {
          sx: {
            backgroundSize,
          },
        },
      });
      persistDisplay({ backgroundSize });
    },
    [updateSlotProps, persistDisplay],
  );

  const handleResetGrid = useCallback(() => {
    updateSlotProps({
      hitWrapper: { ...SEARCH_DEFAULT_SLOT_PROPS.hitWrapper },
    });
    persistDisplay({ columns: undefined });
  }, [updateSlotProps, persistDisplay]);

  const columnsValue =
    typeof slotProps?.hitWrapper?.size === 'number'
      ? 12 / slotProps?.hitWrapper?.size
      : 0;

  return (
    <Stack direction='column' spacing={2.25}>
      <FieldRow
        label='Display fields'
        description='Order of chips = order shown on the card.'
        compact={compact}
      >
        <ChipMultiField
          values={displayFields}
          options={fieldOptions}
          onAdd={handleAddField}
          onRemove={handleRemoveField}
          placeholder='Add field…'
        />
      </FieldRow>

      <FieldRow
        label='Image field'
        description='The selected field is used to show an image in the results above.'
        compact={compact}
      >
        <Stack
          // direction={{ xs: 'column', sm: 'row' }}
          direction='column'
          spacing={1}
          sx={{ alignItems: 'stretch' }}
        >
          <Autocomplete
            id='image-field'
            size='small'
            freeSolo
            blurOnSelect
            selectOnFocus
            clearOnBlur
            options={imageFieldOptions}
            value={slotProps?.hit?.imgField || ''}
            onChange={handleImageChange}
            sx={{ flex: 1, minWidth: 0 }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                (option) => inputValue === option.title,
              );
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  title: `Add "${inputValue}"`,
                });
              }
              return filtered;
            }}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              if (option.inputValue) return option.inputValue;
              return option.title;
            }}
            noOptionsText='No fields with image types were found, but you can still type any field name here'
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder='Image field'
                sx={fieldInputSx}
              />
            )}
            slotProps={{
              paper: { sx: autocompletePaperSx },
            }}
          />
          <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
            <Select<string>
              labelId='img-size-label'
              id='img-size'
              fullWidth
              displayEmpty
              // @ts-expect-error backgroundSize not recognized as CSS Var
              value={slotProps?.hitImg?.sx?.backgroundSize || ''}
              onChange={handleImgSizeChange}
              size='small'
              renderValue={(v) =>
                v ? (
                  String(v)
                ) : (
                  <Box component='span' sx={{ color: designTokens.textFaint }}>
                    Image size…
                  </Box>
                )
              }
              sx={selectInputSx}
              MenuProps={{
                slotProps: {
                  paper: {
                    elevation: 0,
                    sx: autocompletePaperSx,
                  },
                },
              }}
            >
              <MenuItem value=''>default</MenuItem>
              {imgFitOptions.map((o) => (
                <MenuItem value={o} key={`${o}-bg-fit`}>
                  {o}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Stack>
      </FieldRow>

      <FieldRow label='Columns in view' align='center' compact={compact}>
        <Stack direction='row' spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 180 }}>
            <Select
              labelId='display-columns-label'
              id='display-columns'
              value={columnsValue}
              onChange={handleSizeChange}
              size='small'
              fullWidth
              sx={selectInputSx}
              MenuProps={{
                slotProps: {
                  paper: {
                    elevation: 0,
                    sx: autocompletePaperSx,
                  },
                },
              }}
            >
              <MenuItem value={0}>Default</MenuItem>
              {selectOptions.map((o) => (
                <MenuItem value={o} key={`${o}-columns`}>
                  {o}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Button size='small' onClick={handleResetGrid} sx={ghostButtonSx}>
            Reset
          </Button>
        </Stack>
      </FieldRow>
    </Stack>
  );
}
