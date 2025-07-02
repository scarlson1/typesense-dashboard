import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SelectProps,
} from '@mui/material';
import { useCallback } from 'react';
import { useSearch } from '../../hooks';

export function SearchPageSize(
  props: Omit<SelectProps<number>, 'onChange' | 'value'>
) {
  const { setPagination, pageSizeOptions, params } = useSearch();

  const handleChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      setPagination({ per_page: event.target.value });
    },
    [setPagination]
  );

  return (
    <FormControl sx={{ width: { xs: 100, sm: 120, md: 140 } }}>
      <InputLabel id='per-page-select-label'>Hits Per Page</InputLabel>
      <Select
        labelId='per-page-select-label'
        id='per-page-select'
        label='Hits Per Page'
        value={params?.per_page || pageSizeOptions[0] || 10}
        onChange={handleChange}
        size='small'
        {...props}
      >
        {pageSizeOptions.map((s) => (
          <MenuItem value={s}>{s}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
