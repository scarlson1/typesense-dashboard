import type { SlotPropsWithOverrides } from '@/components';
import type { HitActionsProps, HitProps } from '@/components/search';
import type {
  AlertProps,
  BoxProps,
  GridProps,
  PaginationProps,
  SelectProps,
  TypographyProps,
} from '@mui/material';
import { createContext, type ComponentType } from 'react';

// TODO: fix generic Slots/SlotProps
// https://stackoverflow.com/a/61020816

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
  THitsProps = GridProps, // StackProps,
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
  THitsProps = GridProps, // StackProps,
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

// TODO: need to create factory function for generic slot types ??

// import { createContext, useContext, type ReactNode } from 'react';

// function createGenericContext<T>() {
//   const Context = createContext<T | undefined>(undefined);

//   function useGenericContext() {
//     const context = useContext(Context);
//     if (context === undefined) {
//       throw new Error('useGenericContext must be used within a GenericProvider');
//     }
//     return context;
//   }

//   const Provider = ({ children, value }: { children: ReactNode; value: T }) => (
//     <Context.Provider value={value}>{children}</Context.Provider>
//   );

//   return [Provider, useGenericContext] as const;
// }
