import {
  useDefaultIndexParams,
  useSearchParams,
  useSearchSlots,
} from '@/hooks';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SelectProps,
} from '@mui/material';
import { useCallback, useMemo } from 'react';

export const SortBy = ({
  fullWidth,
  size = 'small',
  children,
  label = 'Sort by',
  ...props
}: SelectProps<string[]>) => (
  <FormControl fullWidth={fullWidth} size={size}>
    {label ? <InputLabel id='sort-by-select-label'>{label}</InputLabel> : null}
    <Select<string[]>
      labelId='sort-by-select-label'
      id='sort-by-select'
      label={label}
      fullWidth={fullWidth}
      displayEmpty={false}
      size={size}
      renderValue={(selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
          {selected.map((value) => (
            <Chip key={value} label={value} size='small' />
          ))}
        </Box>
      )}
      {...props}
      multiple
    >
      {children}
    </Select>
  </FormControl>
);

export const CtxSortBy = () => {
  const [slots, slotProps] = useSearchSlots();
  const { sortByOptions } = useDefaultIndexParams();
  const [params, updateParams] = useSearchParams();

  const sortByValue = useMemo(() => {
    return Array.isArray(params?.sort_by)
      ? params.sort_by
      : params.sort_by
        ? (params?.sort_by).split(',')
        : [];
  }, [params?.sort_by]);

  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value },
      } = event;
      let newVal = typeof value === 'string' ? value.split(',') : value;

      updateParams({
        sort_by:
          newVal
            .filter((x) => x)
            .slice(0, 3) // max of three sort_by fields
            .join(',') || undefined,
      });
    },
    [updateParams]
  );

  return slots?.sortBySelect ? (
    <slots.sortBySelect
      {...slotProps?.sortBySelect}
      value={sortByValue}
      onChange={handleChange}
    >
      {sortByOptions?.map((o) => <MenuItem value={o}>{o}</MenuItem>)}
    </slots.sortBySelect>
  ) : null;
};
