import {
  useDefaultIndexParams,
  useSearch,
  useSearchParams,
  useSearchSlots,
} from '@/hooks';
import { FilterListRounded } from '@mui/icons-material';
import {
  Badge,
  Box,
  Chip,
  ClickAwayListener,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  Stack,
  Typography,
  type SelectChangeEvent,
  type SelectProps,
} from '@mui/material';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CtxFacetOptions } from './FacetOptions';

export const SortBy = ({
  fullWidth,
  size = 'small',
  children,
  label = 'Sort by',
  ...props
}: SelectProps<string[]>) => (
  <FormControl fullWidth={fullWidth} size={size}>
    {label ? <InputLabel id='sort-by-select-label'>{label}</InputLabel> : null}
    <Select<string[]>
      labelId='sort-by-select-label'
      id='sort-by-select'
      label={label}
      fullWidth={fullWidth}
      displayEmpty={false}
      size={size}
      renderValue={(selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
          {selected.map((value) => (
            <Chip key={value} label={value} size='small' />
          ))}
        </Box>
      )}
      {...props}
      multiple
    >
      {children}
    </Select>
  </FormControl>
);

export const CtxSortBy = () => {
  const [slots, slotProps] = useSearchSlots();
  const { sortByOptions } = useDefaultIndexParams();
  const [params, updateParams] = useSearchParams();

  const sortByValue = useMemo(() => {
    return Array.isArray(params?.sort_by)
      ? params.sort_by
      : params.sort_by
        ? (params?.sort_by).split(',')
        : [];
  }, [params?.sort_by]);

  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value },
      } = event;
      let newVal = typeof value === 'string' ? value.split(',') : value;

      updateParams({
        sort_by:
          newVal
            .filter((x) => x)
            .slice(0, 3) // max of three sort_by fields
            .join(',') || undefined,
      });
    },
    [updateParams]
  );

  return slots?.sortBySelect ? (
    <slots.sortBySelect
      {...slotProps?.sortBySelect}
      value={sortByValue}
      onChange={handleChange}
    >
      {sortByOptions?.map((o) => <MenuItem value={o}>{o}</MenuItem>)}
    </slots.sortBySelect>
  ) : null;
};

export const Refinements = ({ children }: { children: ReactNode }) => {
  const { sortByOptions } = useDefaultIndexParams();
  const { data, params } = useSearch();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (_: Event | React.SyntheticEvent) => {
    // if ((anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) ||
    //   paperRef.current?.contains(event.target as HTMLElement)
    // ) return;
    setOpen(false);
  };

  const activeRefinements = useMemo(() => {
    const { sort_by, filter_by } = params || {};

    let sortByCount: number = Array.isArray(sort_by)
      ? sort_by.length
      : sort_by
        ? sort_by.split(',').length
        : 0;

    let filterByCount: number = filter_by ? filter_by.split(',').length : 0;

    return sortByCount + filterByCount;
  }, [params?.sort_by, params?.filter_by]);

  if (!data?.facet_counts?.length && !sortByOptions.length) return null;

  // TODO: disable icon if no select or filter options ??
  return (
    <>
      <IconButton
        ref={anchorRef}
        size='small'
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleToggle}
      >
        <FilterListRounded fontSize='inherit' />
        {Boolean(activeRefinements) ? (
          <Badge
            badgeContent={activeRefinements}
            color='primary'
            overlap='circular'
            sx={{ top: '-12px', right: '-6px' }}
          />
        ) : null}
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement='bottom-end'
        role={undefined}
        // disablePortal
      >
        <ClickAwayListener onClickAway={handleClose} mouseEvent='onMouseUp'>
          <Paper
            ref={paperRef}
            sx={{
              width: 300,
              p: 1.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              zIndex: 1200,
            }}
          >
            <Stack direction='column' spacing={2}>
              <Typography variant='subtitle1'>Refinements</Typography>
              {children}
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export const CtxRefinements = () => {
  const [slots, slotProps] = useSearchSlots();

  return slots?.refinements ? (
    <slots.refinements {...slotProps.refinements}>
      <CtxSortBy />
      <CtxFacetOptions />
    </slots.refinements>
  ) : null;
};
