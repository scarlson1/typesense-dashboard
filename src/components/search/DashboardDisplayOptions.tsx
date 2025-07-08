import {
  Alert,
  Autocomplete,
  Button,
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

export function DashboardDisplayOptions() {
  const [_, slotProps, updateSlotProps] = useSearchSlots();
  const { data: collectionSchema } = useCollectionSchema();

  const fieldOptions = useMemo(() => {
    return collectionSchema.fields
      .map(({ name }) => name)
      .filter((name) => !name.includes('*'));
  }, [collectionSchema]);

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

  const handleSizeChange = useCallback(
    (e: SelectChangeEvent<number>) => {
      let size = e.target.value
        ? 12 / e.target.value
        : SEARCH_DEFAULT_SLOT_PROPS.hitWrapper?.size || 1;
      console.log('size: ', size);

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
      <Alert severity='warning' sx={{ mb: 2 }}>
        TODO: dashboard display options
      </Alert>
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
            sx={{ minWidth: 280, maxWidth: 500 }}
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
          <Typography>Input Select Field Placeholder</Typography>
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
          <Select
            value={
              typeof slotProps?.hitWrapper?.size === 'number'
                ? slotProps?.hitWrapper?.size / 12
                : 0
            }
            onChange={handleSizeChange}
            size='small'
            label='Columns'
            sx={{ minWidth: 100, maxWidth: 200 }}
          >
            <MenuItem value={0}>Default</MenuItem>
            {selectOptions.map((o) => (
              <MenuItem value={o} key={`${o}-columns`}>
                {o}
              </MenuItem>
            ))}
          </Select>
          <Button size='small' onClick={handleResetGrid}>
            reset
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
