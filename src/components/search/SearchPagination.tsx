import { Pagination } from '@mui/material';
import { useCallback, useMemo, type ChangeEvent } from 'react';
import { useSearch } from '../../hooks';

export function SearchPagination() {
  const { setPagination, data, params } = useSearch();

  const handleChange = useCallback(
    (_: ChangeEvent<unknown>, page: number) => {
      setPagination({ page });
    },
    [setPagination]
  );

  const pageCount = useMemo(() => {
    if (!(data?.found && params?.per_page)) return 1;
    return Math.ceil(data.found / params.per_page);
  }, [params?.per_page, data?.found]);

  return (
    <Pagination
      count={pageCount}
      size='small'
      page={data?.page || 1}
      onChange={handleChange}
    />
  );
}
