import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { useCallback, useMemo } from 'react';
import { SEARCH_DEFAULT_SLOT_PROPS } from '../../constants';
import { useCollectionSchema, useSearchSlots } from '../../hooks';
import { uniqueArr } from '../../utils';

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

  const handleFieldsChange = useCallback(
    (e: SelectChangeEvent<string[]>) => {
      const {
        target: { value },
      } = e;
      console.log(value);
      let newVal = typeof value === 'string' ? value.split(',') : value;
      // TODO: need to merge with existing fields ??
      let displayFields = uniqueArr([
        ...(slotProps?.hit?.displayFields || []),
        ...newVal,
      ]);
      // console.log('TEST ', slotProps?.hit?.displayFields, newVal);
      updateSlotProps({
        hit: { displayFields },
      });
      alert('TODO: handle display fields');
    },
    [slotProps?.hit?.displayFields]
  );

  console.log('TEST ', slotProps?.hit?.displayFields);

  const handleSizeChange = useCallback(
    (e: SelectChangeEvent<number>) => {
      let size = e.target.value
        ? 12 / e.target.value
        : SEARCH_DEFAULT_SLOT_PROPS.hitWrapper?.size || 1;

      updateSlotProps({ hitWrapper: { size } });
      alert('TODO: change Hits to <Grid /> instead of <Stack />');
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
          <Select
            value={slotProps.hit?.displayFields || []}
            onChange={handleFieldsChange}
            multiple
            size='small'
            sx={{ minWidth: 100, maxWidth: 400 }}
            // limitTags={4}
            // maxRows={3}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            <MenuItem value={[]}>Default</MenuItem>
            {fieldOptions.map((o) => (
              <MenuItem
                value={o}
                key={`${o}-display-field`}
                sx={{
                  maxWidth: 400,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                <Typography noWrap>{o}</Typography>
                {/* {o} */}
              </MenuItem>
            ))}
          </Select>
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
