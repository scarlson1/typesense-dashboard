import {
  Autocomplete,
  Button,
  createFilterOptions,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { useCallback, useMemo } from 'react';
import { SEARCH_DEFAULT_SLOT_PROPS } from '../../constants';
import { useCollectionSchema, useSearchSlots } from '../../hooks';

// TODO: change hits to be grid instead of stack ??

const selectOptions = [1, 2, 3, 4];
interface ImgOption {
  title: string;
  inputValue?: string;
}
const filter = createFilterOptions<ImgOption>();

export function DashboardDisplayOptions() {
  const [_, slotProps, updateSlotProps] = useSearchSlots();
  const { data: collectionSchema } = useCollectionSchema();

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
    // .map((f) => f.name),
    [collectionSchema]
  );

  const handleFieldsChange = useCallback((_: any, newVal: string[]) => {
    updateSlotProps(
      {
        hit: { displayFields: newVal || [] },
      },
      (_: object, srcValue: object) => {
        if (Array.isArray(srcValue)) return srcValue;
      }
    );
  }, []);

  const handleImageChange = useCallback(
    (_: any, newValue: string | ImgOption | null) => {
      if (typeof newValue === 'string') {
        updateSlotProps({
          hit: { imgField: newValue || '' },
        });
        // @ts-ignore
      } else if (newValue && newValue.inputValue) {
        // Create a new value from the user input
        updateSlotProps({
          // @ts-ignore
          hit: { imgField: newValue.inputValue },
        });
      } else {
        updateSlotProps({
          hit: { imgField: newValue?.title || '' },
        });
      }
    },
    []
  );

  const handleSizeChange = useCallback(
    (e: SelectChangeEvent<number>) => {
      let size = e.target.value
        ? 12 / e.target.value
        : SEARCH_DEFAULT_SLOT_PROPS.hitWrapper?.size || 12;

      updateSlotProps({
        hitWrapper: {
          size,
        },
      });
    },
    [updateSlotProps]
  );

  const handleResetGrid = useCallback(() => {
    updateSlotProps({
      hitWrapper: { ...SEARCH_DEFAULT_SLOT_PROPS.hitWrapper },
    });
  }, []);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, my: 2 }}>
      <Stack direction='column' spacing={1.5}>
        <Stack
          direction='row'
          spacing={2}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Typography
            sx={{
              textAlign: 'right',
              flex: '0 0 auto',
              width: { xs: 120, sm: 150, md: 200 },
            }}
          >
            Display Fields
          </Typography>
          <Autocomplete
            multiple
            id='display-fields'
            size='small'
            limitTags={4}
            blurOnSelect
            options={fieldOptions}
            value={slotProps.hit?.displayFields || []}
            onChange={handleFieldsChange}
            renderInput={(params) => (
              <TextField {...params} label='Display Fields' />
            )}
            sx={{ minWidth: { xs: 240, sm: 320, md: 380 }, maxWidth: 500 }}
            slotProps={{
              paper: {
                sx: {
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                },
              },
            }}
          />
        </Stack>

        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              textAlign: 'right',
              flex: '0 0 auto',
              width: { xs: 120, sm: 150, md: 200 },
            }}
          >
            Image Field
          </Typography>
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
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              const { inputValue } = params;
              // Suggest the creation of a new value
              const isExisting = options.some(
                (option) => inputValue === option.title
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
              // Value selected with enter, right from the input
              if (typeof option === 'string') {
                return option;
              }
              // Add "xxx" option created dynamically

              if (option.inputValue) {
                // @ts-ignore
                return option.inputValue;
              }
              // Regular option
              return option.title;
            }}
            // value={slotProps.hit?.displayFields || []}
            noOptionsText='No fields with image types were found, but you can still type any field name here'
            renderInput={(params) => (
              <TextField
                {...params}
                label='Display Fields'
                helperText='The selected field is used to show an image in the results above.'
              />
            )}
            sx={{ minWidth: { xs: 240, sm: 320, md: 380 }, maxWidth: 500 }}
            slotProps={{
              paper: {
                sx: {
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                },
              },
            }}
          />
        </Stack>

        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              textAlign: 'right',
              flex: '0 0 auto',
              width: { xs: 120, sm: 150, md: 200 },
            }}
          >
            Number of Columns in View
          </Typography>
          <FormControl size='small'>
            <InputLabel id='display-columns-label'>Columns</InputLabel>
            <Select
              labelId='display-columns-label'
              id='display-columns'
              value={
                typeof slotProps?.hitWrapper?.size === 'number'
                  ? slotProps?.hitWrapper?.size / 12
                  : 0
              }
              onChange={handleSizeChange}
              size='small'
              label='Columns'
              sx={{ minWidth: 100, maxWidth: 200 }}
              MenuProps={{
                slotProps: {
                  paper: {
                    elevation: 0,
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
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
          </FormControl>
          <Button size='small' onClick={handleResetGrid}>
            reset
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
