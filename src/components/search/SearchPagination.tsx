import { useSearch, useSearchSlots } from '@/hooks';
import { useCallback, useMemo, type ChangeEvent } from 'react';

export function CtxPagination() {
  const { setPagination, data, params } = useSearch();
  const [slots, slotProps] = useSearchSlots();

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

  return slots.pagination ? (
    <slots.pagination
      {...slotProps.pagination}
      count={pageCount}
      page={data?.page || 1}
      onChange={handleChange}
    />
  ) : null;
}
