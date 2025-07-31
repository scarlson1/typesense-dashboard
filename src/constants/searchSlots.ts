import {
  DefaultCtxSearchPageSize,
  Hit,
  HitActions,
  LoadingHits,
} from '@/components/search';
import { FacetOption } from '@/components/search/FacetOptions';
import { Refinements } from '@/components/search/Refinements';
import { SortBy } from '@/components/search/SortBy';
import type { SearchSlotComponents, SearchSlotProps } from '@/context';
import { Alert, Box, Grid, Pagination, Stack, Typography } from '@mui/material';
import { Fragment } from 'react/jsx-runtime';

export const SEARCH_DEFAULT_SLOTS: SearchSlotComponents = {
  noHitsFound: Box, // CtxHitsNotFoundWrapper,
  hits: Grid, // Stack,
  hit: Hit,
  hitWrapper: Fragment,
  hitActions: HitActions,
  pageSize: DefaultCtxSearchPageSize,
  pagination: Pagination,
  stats: Typography,
  error: Alert,
  loadingHits: LoadingHits,
  facetContainer: Stack,
  facetOption: FacetOption,
  sortBySelect: SortBy,
  refinements: Refinements,
};

export const SEARCH_DEFAULT_SLOT_PROPS: SearchSlotProps = {
  noHitsFound: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  hits: {
    // direction: 'column',
    spacing: { xs: 1, sm: 2 },
  },
  hitWrapper: {
    size: { xs: 12, lg: 6 },
  },
  pageSize: {
    size: 'small',
    label: 'Hits per page',
  },
  pagination: {
    size: 'small',
  },
  stats: {
    variant: 'body2',
    color: 'text.secondary',
    component: 'div',
    sx: { display: 'flex', alignItems: 'center' },
  },
  error: {
    severity: 'warning',
  },
  facetContainer: {
    direction: 'column',
    spacing: 0.75,
  },
  facetOption: {
    size: 'small',
    sx: { p: 0.5 },
  },
  sortBySelect: {
    multiple: true,
    size: 'small',
  },
};
