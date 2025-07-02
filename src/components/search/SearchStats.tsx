import { Typography } from '@mui/material';
import { useSearch } from '../../hooks';

export function SearchStats() {
  const { data } = useSearch();

  return (
    <Typography variant='body2' color='text.secondary'>
      {data
        ? `${data?.found} results found from ${data?.out_of} docs in ${data?.search_time_ms}ms`
        : ''}
    </Typography>
  );
}
