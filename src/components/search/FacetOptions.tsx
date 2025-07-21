import { collectionQueryKeys } from '@/constants';
import {
  useSearch,
  useSearchParams,
  useSearchSlots,
  useTypesenseClient,
} from '@/hooks';
import { formatDollar, uniqueArr } from '@/utils';
import {
  Box,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  Slider,
  Stack,
  Tooltip,
  Typography,
  type CheckboxProps,
  type SliderProps,
  type SliderValueLabelProps,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import type { SearchResponseFacetCountSchema } from 'typesense/lib/Typesense/Documents';

//BUG: using min max stats for numeric filter only considers returned facet options (10 by default)

// TODO: show more props (UI: https://github.com/algolia/instantsearch/blob/master/packages/react-instantsearch/src/ui/RefinementList.tsx)
// props: https://github.com/algolia/instantsearch/blob/master/packages/react-instantsearch/src/widgets/RefinementList.tsx
// useRefinementList: https://github.com/algolia/instantsearch/blob/master/packages/instantsearch.js/src/connectors/refinement-list/connectRefinementList.ts
// Docs: https://www.algolia.com/doc/api-reference/widgets/refinement-list/react/
// TODO: pass operator as prop (AND / OR), limit, searchable, sortBy, showMore, showMoreLimit, etc.
// useRefinementList hook: https://www.algolia.com/doc/api-reference/widgets/refinement-list/react/#hook

// going with algolia's implementation would require explicity passing refinement list config for each attribute
// i.e. attribute='category' operator='and' etc.

// algolia search facets implementation: https://github.com/algolia/instantsearch/blob/d0486032831c0b2ee22169aa1f5052b88b9543b0/packages/instantsearch.js/src/connectors/refinement-list/connectRefinementList.ts#L296

export interface FacetOptionProps extends CheckboxProps {
  label?: ReactNode;
  value: string;
}

// rename FacetOptionInput ??
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

// const filterOperators = z.enum([
//   '', // partially equal to
//   '=', // equal to
//   '>', // greater than
//   '>=', // greater or equal
//   '<', // less than
//   '<=', // less or equal
//   '!=', // not equal to
//   '[]', // Is one of
//   '![]', // Is not any of
//   '[..]', // range
// ]);
// type FilterOperators = z.infer<typeof filterOperators>;

export const CtxFacetOption = (props: CtxFacetOptionProps) => {
  const [slots, slotProps] = useSearchSlots();

  return slots.facetOption ? (
    <slots.facetOption {...slotProps?.facetOption} {...props} />
  ) : null;
};

// TODO: add to context slots
export const CtxNumericFacetOption = (props: CtxFacetOptionProps) => {
  const [slots, slotProps] = useSearchSlots();

  return slots.facetOption ? (
    <slots.facetOption {...slotProps?.facetOption} {...props} />
  ) : null;
};

interface UseFacetCountsProps {}

// filter_by removes facet options with count of 0 (desired behavior ??)
const useFacetCounts = (
  options: UseFacetCountsProps = { max_facet_values: 100 }
) => {
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
          ...options,
        });

      return res?.facet_counts || [];
    },
  });
};

export const CtxFacetOptions = () => {
  const { data } = useSearch();
  const [params, updateParams] = useSearchParams();

  const { data: facetCounts } = useFacetCounts();

  // can't split on ',' when using array (regex --> only split if not between [])
  // params?.filter_by?.split(/,(?![^\\[]*\])/) || [], // .split(',') || [],
  const filterByParams = useMemo(
    () => params?.filter_by?.split('&&').filter((x) => x) || [],
    [params]
  );

  // merge all facets with active facets (add disable config to enable default behavior ??)
  const mergedFacets = useMemo(() => {
    return facetCounts?.map((facet: SearchResponseFacetCountSchema<object>) => {
      let filteredFacet = data?.facet_counts?.find(
        (f) => f.field_name === facet.field_name
      );

      let filterBy = filterByParams.find((f: string) =>
        f.startsWith(facet?.field_name)
      );

      // Need to get field def from collection schema to ensure "sort" property is enabled ??
      const isNumeric = facet.stats?.avg !== undefined;

      let defaultMin = facet.stats?.min || 0;
      let defaultMax = facet.stats?.max || 1000000;
      let numericValueRange = [defaultMin, defaultMax];

      if (isNumeric) {
        if (filterBy) {
          let split = filterBy
            .split(':')[1]
            .replace(/[\[\]]/g, '')
            .split('..');

          if (split.length) {
            let start = !isNaN(Number(split[0]))
              ? Number(split[0])
              : defaultMin;
            let end = !isNaN(Number(split[1])) ? Number(split[1]) : defaultMax;
            numericValueRange = [start, end];
          }
        }
      }

      // TODO: "show more"
      let countsWithNums = facet.counts.slice(0, 10).map((c) => {
        let filteredCount = filteredFacet?.counts.find(
          (filteredCount) => filteredCount.value === c.value
        );

        let checked = false;
        if (!isNumeric) {
          let filterValues = filterBy
            ? filterBy
                .split(':')[1]
                .replace(/[\[\]]/g, '')
                .split(',')
            : null;
          checked = filterValues ? filterValues.includes(c.value) : false;
        }

        return {
          count: filteredCount?.count || 0,
          highlighted: filteredCount?.highlighted || c.highlighted,
          // TODO: covert value to number if numeric ??
          // value: c.value, // TODO: get operator variable
          value: isNumeric ? Number(c.value) : c.value,
          checked, //: filterValues ? filterValues.includes(c.value) : false,
        };
      });

      return {
        counts: countsWithNums,
        field_name: facet.field_name,
        stats: isNumeric ? facet.stats : filteredFacet?.stats || facet.stats,
        isNumeric,
        numericValueRange,
      };
    });
  }, [data?.facet_counts, facetCounts, filterByParams]);

  const updateFilterParams = useCallback(
    (field: string, newFilter: string) => {
      let filtersSansTarget = filterByParams.filter(
        (f: string) => !f.startsWith(`${field}`)
      );
      let newParams = [...filtersSansTarget, newFilter].filter((x) => x);

      updateParams({ filter_by: newParams.join('&&') });
    },
    [filterByParams, updateParams]
  );

  // TODO: support filter operators
  // https://typesense.org/docs/guide/tips-for-filtering.html#available-operators
  // move to context ?? or create useSearchFilter hook ??
  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      field: string
      // operator: FilterOperators = '='
    ) => {
      let existingFilter = filterByParams.find((f) =>
        f.startsWith(`${field}:`)
      );

      let newFilterValue = `${field}:[${e.target.value}]`;
      if (existingFilter) {
        let prevOptions = existingFilter
          .split(':')[1]
          .replace(/[\[\]]/g, '')
          .split(',');

        let newOptions = e.target.checked
          ? uniqueArr([...prevOptions, e.target.value])
          : prevOptions.filter((f: string) => f !== e.target.value);

        newFilterValue = newOptions.length
          ? `${field}:[${newOptions.join(',')}]`
          : '';
      }
      updateFilterParams(field, newFilterValue);
    },
    [filterByParams, updateFilterParams]
  );

  const handleNumericChangeCommitted = useCallback(
    (fieldName: string) =>
      (_: SyntheticEvent | Event, value: number | number[]) => {
        let newFilterVal = value && Array.isArray(value) ? value : [value];
        updateFilterParams(
          fieldName,
          `${fieldName}:[${newFilterVal[0]}..${newFilterVal[1] ?? ''}]`
        );
      },
    [updateFilterParams]
  );

  return (
    <Collapse in={Boolean(facetCounts?.length)}>
      <CtxFacetContainer>
        {mergedFacets?.map((facetCount) => (
          <CtxFacetContainer key={facetCount.field_name}>
            <Typography variant='overline'>{facetCount.field_name}</Typography>
            {facetCount.isNumeric ? (
              <NumericFacetOption
                value={facetCount.numericValueRange}
                min={facetCount.stats?.min ?? 0}
                max={facetCount.stats?.max}
                onChangeCommitted={handleNumericChangeCommitted(
                  facetCount.field_name
                )}
                getAriaLabel={() => facetCount.field_name}
                getAriaValueText={(val) => formatDollar(val)}
                valueLabelDisplay='on'
              />
            ) : (
              <>
                {facetCount.counts.map((c) => (
                  <CtxFacetOption
                    key={c.value}
                    checked={c.checked}
                    value={c.value as string}
                    // disabled={!c.count}
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

                        <Chip
                          size='small'
                          label={c.count}
                          sx={{ height: 18 }}
                        />
                      </Stack>
                    }
                  />
                ))}
              </>
            )}
          </CtxFacetContainer>
        ))}
      </CtxFacetContainer>
    </Collapse>
  );
};

function ValueLabelComponent(
  props: SliderValueLabelProps & { valueLabelDisplay: string }
) {
  const { children, value, valueLabelDisplay, ...rest } = props;
  console.log(rest);
  const [open, setOpen] = useState(() => valueLabelDisplay === 'on');

  const handleClose = () => {
    if (valueLabelDisplay === 'on') return;
    setOpen(false);
  };

  const handleOpen = () => {
    if (valueLabelDisplay === 'on') return;
    setOpen(true);
  };

  return (
    <Tooltip
      enterTouchDelay={0}
      placement='top'
      title={value}
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
    >
      {children}
    </Tooltip>
  );
}

interface NumericFacetOptionProps extends SliderProps {}

function NumericFacetOption(props: NumericFacetOptionProps) {
  const [value, setValue] = useState<number[] | number | undefined>(
    props.value
  );

  const handleChange = (
    _: Event,
    newValue: number | number[]
    // activeThumb: number
  ) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ px: 2 }}>
      <Slider
        valueLabelDisplay='on'
        slots={{
          valueLabel: ValueLabelComponent,
        }}
        {...props}
        onChange={handleChange}
        value={value}
        // getAriaValueText={valuetext}
      />
    </Box>
  );
}
