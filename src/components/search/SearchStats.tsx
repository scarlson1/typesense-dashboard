import { useSearch, useSearchSlots } from '@/hooks';
import { CircularProgress, Fade } from '@mui/material';

export function CtxSearchStats() {
  const { data, isLoading, isFetching } = useSearch();
  const [slots, slotProps] = useSearchSlots();

  return slots.stats ? (
    <slots.stats {...slotProps.stats}>
      {`${data?.found ?? '--'} results found from ${data?.out_of ?? '--'} docs in ${data?.search_time_ms ?? '--'}ms`}
      <Fade in={isLoading || isFetching}>
        <CircularProgress size='0.7rem' sx={{ ml: 1 }} />
      </Fade>
    </slots.stats>
  ) : null;
}
