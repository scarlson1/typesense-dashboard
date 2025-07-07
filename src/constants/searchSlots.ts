import { Alert, Box, Pagination, Stack, Typography } from '@mui/material';
import {
  DefaultCtxSearchPageSize,
  Hit,
  HitActions,
  LoadingHits,
} from '../components/search';
import type { SearchSlotComponents, SearchSlotProps } from '../context';

export const SEARCH_DEFAULT_SLOTS: SearchSlotComponents = {
  noHitsFound: Box, // CtxHitsNotFoundWrapper,
  hits: Stack, // Hits,
  hit: Hit,
  hitActions: HitActions,
  pageSize: DefaultCtxSearchPageSize, // SearchPageSize,
  pagination: Pagination,
  stats: Typography,
  error: Alert,
  loadingHits: LoadingHits,
};

export const SEARCH_DEFAULT_SLOT_PROPS: SearchSlotProps = {
  noHitsFound: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  hits: {
    direction: 'column',
    spacing: { xs: 1, sm: 2 },
  },
  hitWrapper: {
    size: 12,
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
  // loadingHits: {}
};
