import { Alert, Collapse } from '@mui/material';
import { useEffect } from 'react';
import { useSearch } from '../../hooks';

export function SearchError() {
  const { isError, error } = useSearch();

  useEffect(() => {
    if (error) console.log(error);
  }, [error]);

  let errMsg = error?.message || 'An error occurred. See console for details';
  return (
    <Collapse in={isError}>
      <Alert severity='warning'>{errMsg}</Alert>
    </Collapse>
  );
}
