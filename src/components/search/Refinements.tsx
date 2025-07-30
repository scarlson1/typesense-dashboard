import { useDefaultIndexParams, useSearch, useSearchSlots } from '@/hooks';
import { FilterListRounded } from '@mui/icons-material';
import {
  Badge,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { CtxFacetOptions } from './FacetOptions';
import { CtxSortBy } from './SortBy';

// use temporary drawer instead of popper ??

export const Refinements = ({ children }: { children: ReactNode }) => {
  const { sortByOptions } = useDefaultIndexParams();
  const { data, params } = useSearch();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (e: Event | React.SyntheticEvent) => {
    if (anchorRef.current?.contains(e.target as HTMLElement)) return;
    setOpen(false);
  };

  // only show count of filters ?? (not sort ??)
  const activeRefinements = useMemo(() => {
    const { sort_by, filter_by } = params || {};

    let sortByCount: number = Array.isArray(sort_by)
      ? sort_by.length
      : sort_by
        ? sort_by.split(',').length
        : 0;

    // TODO: handle filter combinations other than &&
    let filterByCount: number = filter_by ? filter_by.split('&&').length : 0;

    return sortByCount + filterByCount;
  }, [params?.sort_by, params?.filter_by]);

  if (!data?.facet_counts?.length && !sortByOptions.length) return null;

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
              maxHeight: '70vh',
              overflowY: 'auto',
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
