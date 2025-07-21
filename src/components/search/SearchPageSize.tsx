import { useSearch, useSearchSlots } from '@/hooks';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SelectProps,
} from '@mui/material';
import { useCallback } from 'react';

export function DefaultCtxSearchPageSize(props: SelectProps<number>) {
  return (
    <FormControl sx={{ width: { xs: 100, sm: 120, md: 140 } }}>
      <InputLabel id='per-page-select-label' sx={{ zIndex: 0 }}>
        {props?.label ?? 'Hits Per Page'}
      </InputLabel>
      <Select
        labelId='per-page-select-label'
        id='per-page-select'
        label={props?.label ?? 'Hits Per Page'}
        // value={params?.per_page || pageSizeOptions[0] || 10}
        // onChange={handleChange}
        size='small'
        {...props}
      />
    </FormControl>
  );
}

export function CtxPageSize() {
  const [slots, slotProps] = useSearchSlots();
  const { setPagination, pageSizeOptions, params } = useSearch();

  const handleChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      setPagination({ per_page: event.target.value });
    },
    [setPagination]
  );

  // TODO: menu option as slot ??
  return slots.pageSize ? (
    <slots.pageSize
      {...slotProps.pageSize}
      value={params?.per_page || pageSizeOptions[0] || 10}
      onChange={handleChange}
    >
      {pageSizeOptions.map((s) => (
        <MenuItem value={s}>{s}</MenuItem>
      ))}
    </slots.pageSize>
  ) : null;
}

// export function SearchPageSize(
//   props: Omit<SelectProps<number>, 'onChange' | 'value'>
// ) {
//   const { setPagination, pageSizeOptions, params } = useSearch();

//   const handleChange = useCallback(
//     (event: SelectChangeEvent<number>) => {
//       setPagination({ per_page: event.target.value });
//     },
//     [setPagination]
//   );

//   return (
//     <FormControl sx={{ width: { xs: 100, sm: 120, md: 140 } }}>
//       <InputLabel id='per-page-select-label'>Hits Per Page</InputLabel>
//       <Select
//         labelId='per-page-select-label'
//         id='per-page-select'
//         label='Hits Per Page'
//         value={params?.per_page || pageSizeOptions[0] || 10}
//         onChange={handleChange}
//         size='small'
//         {...props}
//       >
//         {pageSizeOptions.map((s) => (
//           <MenuItem value={s}>{s}</MenuItem>
//         ))}
//       </Select>
//     </FormControl>
//   );
// }
