import { collectionQueryKeys } from '@/constants';
import {
  useSearch,
  useSearchParams,
  useSearchSlots,
  useTypesenseClient,
} from '@/hooks';
import { uniqueArr } from '@/utils';
import {
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  Stack,
  Typography,
  type CheckboxProps,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, type ChangeEvent, type ReactNode } from 'react';
import type { SearchResponseFacetCountSchema } from 'typesense/lib/Typesense/Documents';
import { z } from 'zod/v4';

export interface FacetOptionProps extends CheckboxProps {
  label?: ReactNode;
  value: string;
}

export const FacetOption = ({ label, ...props }: FacetOptionProps) => {
  return <FormControlLabel control={<Checkbox {...props} />} label={label} />;
};

export const CtxFacetContainer = ({ children }: { children: ReactNode }) => {
  const [slots, slotProps] = useSearchSlots();

  return slots.facetContainer ? (
    <slots.facetContainer {...slotProps?.facetContainer}>
      {children}
    </slots.facetContainer>
  ) : null;
};

interface CtxFacetOptionProps {
  value: string;
  checked: boolean;
  label: ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const filterOperators = z.enum([
  '', // partially equal to
  '=', // equal to
  '>', // greater than
  '>=', // greater or equal
  '<', // less than
  '<=', // less or equal
  '!=', // not equal to
  '[]', // Is one of
  '![]', // Is not any of
  '[..]', // range
]);
type FilterOperators = z.infer<typeof filterOperators>;

export const CtxFacetOption = (props: CtxFacetOptionProps) => {
  const [slots, slotProps] = useSearchSlots();

  return slots.facetOption ? (
    <slots.facetOption {...slotProps?.facetOption} {...props} />
  ) : null;
};

// filter_by removes facet options with count of 0
const useFacetCounts = () => {
  const [client, clusterId] = useTypesenseClient();
  const { debouncedQuery, collectionId, params } = useSearch();

  const { filter_by, ...restParams } = params || {};

  return useQuery({
    queryKey: [
      ...collectionQueryKeys.search(
        clusterId,
        collectionId,
        restParams,
        debouncedQuery
      ),
      'facets',
    ],
    queryFn: async () => {
      let res = await client
        .collections(collectionId)
        .documents()
        .search({
          q: debouncedQuery,
          ...(restParams || {}),
        });

      return res?.facet_counts || [];
    },
  });
};

// TODO: setting for showing facet results with 0 options
export const CtxFacetOptions = () => {
  const { data } = useSearch();
  const [params, updateParams] = useSearchParams();

  const { data: facetCounts } = useFacetCounts();

  const filterByParams = useMemo(
    () => params?.filter_by?.split(',') || [],
    [params]
  );

  const mergedFacets = useMemo(() => {
    return facetCounts?.map((facet: SearchResponseFacetCountSchema<object>) => {
      let filteredFacet = data?.facet_counts?.find(
        (f) => f.field_name === facet.field_name
      );

      let countsWithNums = facet.counts.map((c) => {
        let filteredCount = filteredFacet?.counts.find(
          (filteredCount) => filteredCount.value === c.value
        );

        return {
          count: filteredCount?.count || 0,
          highlighted: filteredCount?.highlighted || c.highlighted,
          value: c.value, // TODO: get operator variable
          checked: filterByParams.includes(`${facet?.field_name}:=${c.value}`),
        };
      });

      return {
        counts: countsWithNums,
        field_name: facet.field_name,
        stats: filteredFacet?.stats || facet.stats,
      };
    });
  }, [data?.facet_counts, facetCounts, filterByParams]);

  // TODO: support filter operators
  // https://typesense.org/docs/guide/tips-for-filtering.html#available-operators
  // move to context ?? or create useSearchFilter hook ??
  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      field: string,
      operator: FilterOperators = '='
    ) => {
      let filterValue = `${field}:${operator}${e.target.value}`;

      let newParams = e.target.checked
        ? uniqueArr([...filterByParams, filterValue])
        : filterByParams.filter((f: string) => f !== filterValue);

      updateParams({ filter_by: newParams.join(',') });
    },
    [filterByParams, updateParams]
  );

  return (
    <Collapse in={Boolean(facetCounts?.length)}>
      <CtxFacetContainer>
        {mergedFacets?.map((facetCount) => (
          <CtxFacetContainer key={facetCount.field_name}>
            <Typography variant='overline'>{facetCount.field_name}</Typography>
            {/* TODO: search to refine facet options  */}
            {facetCount.counts.map((c) => (
              <CtxFacetOption
                key={c.value}
                checked={c.checked}
                value={c.value}
                disabled={!c.count}
                onChange={(e) => {
                  handleChange(e, facetCount.field_name);
                }}
                label={
                  <Stack
                    direction='row'
                    spacing={0.75}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography variant='body2'>{c.value}</Typography>

                    <Chip size='small' label={c.count} sx={{ height: 18 }} />
                  </Stack>
                }
              />
            ))}
          </CtxFacetContainer>
        ))}
      </CtxFacetContainer>
    </Collapse>
  );
};
