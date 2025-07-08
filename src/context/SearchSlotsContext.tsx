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

export interface SearchSlotComponents<
  THitsProps = Record<string, any>,
  THitProps = HitProps,
  THitWrapperProps = GridProps,
  THitActionProps = HitActionsProps,
  TNoHitsFoundProps = BoxProps,
  TPageSizeProps extends SelectProps<number> = SelectProps<number>,
  TPaginationProps = PaginationProps,
  TStatsProps = TypographyProps,
  TErrorProps = AlertProps,
  TLoadingHitsProps = BoxProps,
> {
  hits: ComponentType<THitsProps>;
  hit: ComponentType<THitProps>;
  hitWrapper?: ComponentType<THitWrapperProps>;
  hitActions: ComponentType<THitActionProps>;
  noHitsFound: ComponentType<TNoHitsFoundProps>;
  pageSize: ComponentType<TPageSizeProps>; //  ComponentType<TextFieldProps>;
  pagination: ComponentType<TPaginationProps>;
  stats: ComponentType<TStatsProps>;
  error: ComponentType<TErrorProps>;
  loadingHits: ComponentType<TLoadingHitsProps>;
}

export interface SearchSlotProps<
  THitsProps = StackProps,
  THitProps = HitProps,
  THitWrapperProps = GridProps,
  THitActionProps = HitActionsProps,
  TNoHitsFoundProps = BoxProps,
  TPageSizeProps extends SelectProps<number> = SelectProps<number>,
  TPaginationProps = PaginationProps,
  TStatsProps = TypographyProps,
  TErrorProps = AlertProps,
  TLoadingHitsProps = BoxProps,
> {
  hits?: SlotPropsWithOverrides<THitsProps>; // Record<string, any>
  hit?: SlotPropsWithOverrides<THitProps>;
  hitWrapper?: SlotPropsWithOverrides<THitWrapperProps>;
  hitActions?: SlotPropsWithOverrides<THitActionProps>;
  noHitsFound?: SlotPropsWithOverrides<TNoHitsFoundProps>;
  pageSize?: SlotPropsWithOverrides<TPageSizeProps>;
  pagination?: SlotPropsWithOverrides<TPaginationProps>;
  stats?: SlotPropsWithOverrides<TStatsProps>;
  error?: SlotPropsWithOverrides<TErrorProps>;
  loadingHits?: SlotPropsWithOverrides<TLoadingHitsProps>;
}

export interface SearchSlotsContextValues<
  THitsProps = StackProps,
  THitProps = HitProps,
  THitWrapperProps = GridProps,
  THitActionProps = HitActionsProps,
  TNoHitsFoundProps = BoxProps,
  TPageSizeProps extends SelectProps<number> = SelectProps<number>,
  TPaginationProps = PaginationProps,
  TStatsProps = TypographyProps,
  TErrorProps = AlertProps,
  TLoadingHitsProps = BoxProps,
> {
  slots: SearchSlotComponents<
    THitsProps,
    THitProps,
    THitWrapperProps,
    THitActionProps,
    TNoHitsFoundProps,
    TPageSizeProps,
    TPaginationProps,
    TStatsProps,
    TErrorProps,
    TLoadingHitsProps
  >;
  slotProps: SearchSlotProps<
    THitsProps,
    THitProps,
    THitWrapperProps,
    THitActionProps,
    TNoHitsFoundProps,
    TPageSizeProps,
    TPaginationProps,
    TStatsProps,
    TErrorProps,
    TLoadingHitsProps
  >;
  updateSlotProps: (
    updates: SearchSlotProps<
      THitsProps,
      THitProps,
      THitWrapperProps,
      THitActionProps,
      TNoHitsFoundProps,
      TPageSizeProps,
      TPaginationProps,
      TStatsProps,
      TErrorProps,
      TLoadingHitsProps
    >,
    updater?: Function
  ) => void;
}

export const SearchSlotsContext =
  createContext<SearchSlotsContextValues | null>(null);

if (import.meta.env.DEV) {
  SearchSlotsContext.displayName = 'SearchSlotsContext';
}
