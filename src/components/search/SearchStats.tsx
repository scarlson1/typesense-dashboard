import { useSearch, useSearchSlots } from '@/hooks';
import { CircularProgress, Fade } from '@mui/material';

export function CtxSearchStats() {
  const { data, isLoading, isFetching } = useSearch();
  const [slots, slotProps] = useSearchSlots();

  return slots.stats ? (
    <slots.stats {...slotProps.stats}>
      {`${data?.found ?? '--'} results found from ${data?.out_of ?? '--'} docs in ${data?.search_time_ms ?? '--'}ms`}
      <Fade in={isLoading || isFetching}>
        <CircularProgress size='0.8125rem' sx={{ ml: 1 }} />
      </Fade>
    </slots.stats>
  ) : null;
}

// export function SearchStats() {
//   const { data, isLoading, isFetching } = useSearch();

//   return (
//     <Typography
//       variant='body2'
//       color='text.secondary'
//       component='div'
//       sx={{ display: 'flex', alignItems: 'center' }}
//     >
//       {`${data?.found ?? '--'} results found from ${data?.out_of ?? '--'} docs in ${data?.search_time_ms ?? '--'}ms`}
//       <Fade in={isLoading || isFetching}>
//         <CircularProgress size='0.8125rem' sx={{ ml: 1 }} />
//       </Fade>
//     </Typography>
//   );
// }
