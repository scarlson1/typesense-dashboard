import type {
  AlertProps,
  BoxProps,
  GridProps,
  PaginationProps,
  SelectProps,
  StackProps,
  TypographyProps,
} from '@mui/material';
import { createContext, type ComponentType } from 'react';
import type { SlotPropsWithOverrides } from '../components';
import type { HitActionsProps, HitProps } from '../components/search';

export interface SearchSlotComponents {
  noHitsFound: ComponentType<BoxProps>;
  hits: ComponentType<Record<string, any>>;
  hit: ComponentType<HitProps>;
  hitWrapper?: ComponentType<GridProps>;
  hitActions: ComponentType<HitActionsProps>;
  pageSize: ComponentType<SelectProps<number>>; //  ComponentType<TextFieldProps>;
  pagination: ComponentType<PaginationProps>;
  stats: ComponentType<TypographyProps>;
  error: ComponentType<AlertProps>;
  loadingHits: ComponentType<BoxProps>;
}

export interface SearchSlotProps {
  noHitsFound?: SlotPropsWithOverrides<BoxProps>;
  hits?: SlotPropsWithOverrides<StackProps>; // Record<string, any>
  hit?: SlotPropsWithOverrides<HitProps>;
  hitWrapper?: SlotPropsWithOverrides<GridProps>;
  hitActions?: SlotPropsWithOverrides<HitActionsProps>;
  pageSize?: SlotPropsWithOverrides<SelectProps<number>>;
  pagination?: SlotPropsWithOverrides<PaginationProps>;
  stats?: SlotPropsWithOverrides<TypographyProps>;
  error?: SlotPropsWithOverrides<AlertProps>;
  loadingHits?: SlotPropsWithOverrides<BoxProps>;
}

export interface SearchSlotsContextValues {
  slots: SearchSlotComponents; // Partial<SearchSlotComponents>;
  slotProps: SearchSlotProps; // Partial<SearchSlotProps>;
  updateSlotProps: (updates: SearchSlotProps) => void;
}

export const SearchSlotsContext =
  createContext<SearchSlotsContextValues | null>(null);

if (import.meta.env.DEV) {
  SearchSlotsContext.displayName = 'SearchSlotsContext';
}
