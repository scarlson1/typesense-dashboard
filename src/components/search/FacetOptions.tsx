import { useSearch, useSearchParams, useSearchSlots } from '@/hooks';
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
import { useCallback, useMemo, type ChangeEvent, type ReactNode } from 'react';
import { z } from 'zod/v4';

export interface FacetOptionProps extends CheckboxProps {
  label?: ReactNode;
  value: string;
}

// TODO: use slots on change handler
export const FacetOption = ({ label, ...props }: FacetOptionProps) => {
  console.log('PROPS: ', props);
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
}

const filterOperators = z.enum([
  '', // partially equal to
  '=', // equal to
  '>', // greater than
  '>=', // greater or equal
  '<', // less than
  '<=', // less or equal
  '!=', // not equal to
  // TODO: arrays
  '[]', // Is one of
  '![]', // Is not any of
  '[..]', // range
]);
type FilterOperators = z.infer<typeof filterOperators>;

// TODO: run query without filter_by ??

export const CtxFacetOption = (props: CtxFacetOptionProps) => {
  const [slots, slotProps] = useSearchSlots();

  return slots.facetOption ? (
    <slots.facetOption
      {...slotProps?.facetOption}
      {...props}
      // onChange={handleChange}
    />
  ) : null;
};

export const CtxFacetOptions = () => {
  const { data } = useSearch();
  const [params, updateParams] = useSearchParams();

  const filterByParams = useMemo(
    () => params?.filter_by?.split(',') || [],
    [params]
  );

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
      console.log('new params: ', newParams);

      updateParams({ filter_by: newParams.join(',') });
    },
    [filterByParams, updateParams]
  );

  return (
    <Collapse in={Boolean(data?.facet_counts?.length)}>
      <CtxFacetContainer>
        {data?.facet_counts?.map((facetCount) => (
          <CtxFacetContainer key={facetCount.field_name}>
            <Typography variant='overline'>{facetCount.field_name}</Typography>
            {facetCount.counts.map((c) => (
              <CtxFacetOption
                key={c.value}
                // TODO: get operator variable
                checked={filterByParams.includes(
                  `${facetCount.field_name}:=${c.value}`
                )}
                value={c.value}
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
