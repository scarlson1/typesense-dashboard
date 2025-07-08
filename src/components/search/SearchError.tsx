import { useSearch, useSearchSlots } from '@/hooks';
import { Collapse } from '@mui/material';
import { useEffect } from 'react';

export function CtxSearchError() {
  const { isError, error } = useSearch();
  const [slots, slotProps] = useSearchSlots();

  useEffect(() => {
    if (error) console.log(error);
  }, [error]);

  let errMsg = error?.message || 'An error occurred. See console for details';

  return slots.error ? (
    <Collapse in={isError}>
      <slots.error {...slotProps.error}>{errMsg}</slots.error>
    </Collapse>
  ) : null;
}

// export function SearchError() {
//   const { isError, error } = useSearch();

//   useEffect(() => {
//     if (error) console.log(error);
//   }, [error]);

//   let errMsg = error?.message || 'An error occurred. See console for details';
//   return (
//     <Collapse in={isError}>
//       <Alert severity='warning'>{errMsg}</Alert>
//     </Collapse>
//   );
// }
