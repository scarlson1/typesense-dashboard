import { SEARCH_DEFAULT_SLOT_PROPS, SEARCH_DEFAULT_SLOTS } from '@/constants';
import {
  SearchSlotsContext,
  type SearchSlotComponents,
  type SearchSlotProps,
} from '@/context';
import type {
  AlertProps,
  BoxProps,
  GridProps,
  PaginationProps,
  SelectProps,
  TypographyProps,
} from '@mui/material';
import { mergeWith } from 'lodash-es';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { HitProps } from './Hit';
import type { HitActionsProps } from './HitActions';

interface SearchSlotsProviderProps<
  THitsProps = GridProps, // Record<string, any>,
  THitProps = HitProps,
  THitWrapperProps = GridProps,
  THitActionProps = HitActionsProps,
  TNoHitsFoundProps = BoxProps,
  TPageSizeProps extends SelectProps<number> = SelectProps<number>,
  TPaginationProps extends PaginationProps = PaginationProps,
  TStatsProps = TypographyProps,
  TErrorProps = AlertProps,
  TLoadingHitsProps = BoxProps,
> {
  slots: Partial<
    SearchSlotComponents<
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
    >
  >;
  slotProps?: Partial<
    SearchSlotProps<
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
    >
  >;
  children: ReactNode;
}

// TODO: FIX GENERIC SLOT TYPES
// https://stackoverflow.com/a/61020816
export const SearchSlotsProvider =
  // <
  // THitsProps = GridProps, // Record<string, any>,
  // THitProps = HitProps,
  // THitWrapperProps = GridProps,
  // THitActionProps = HitActionsProps,
  // TNoHitsFoundProps = BoxProps,
  // TPageSizeProps extends SelectProps<number> = SelectProps<number>,
  // TPaginationProps extends PaginationProps = PaginationProps,
  // TStatsProps = TypographyProps,
  // TErrorProps = AlertProps,
  // TLoadingHitsProps = BoxProps,
  // >
  ({
    slots: providedSlots,
    slotProps: providedSlotProps = {},
    children,
  }: SearchSlotsProviderProps) => {
    const [slotPropsState, setSlotPropsState] = useState(providedSlotProps);

    const slots = useMemo(
      () => ({
        ...SEARCH_DEFAULT_SLOTS,
        ...(providedSlots || {}),
      }),
      [providedSlots]
    );

    const slotProps = useMemo(
      () =>
        mergeWith(
          SEARCH_DEFAULT_SLOT_PROPS,
          slotPropsState,
          (_: object, srcValue: object) => {
            if (Array.isArray(srcValue)) return srcValue;
          }
        ),
      [slotPropsState]
    );

    const updateSlotProps = useCallback(
      (updates: Partial<SearchSlotProps>, mergeFn: Function = () => {}) => {
        // setSlotPropsState((prev) => ({ ...merge(prev, updates) }));
        setSlotPropsState((prev) => ({ ...mergeWith(prev, updates, mergeFn) }));
      },
      []
    );

    return (
      <SearchSlotsContext.Provider
        value={{ slots, slotProps, updateSlotProps }}
      >
        {children}
      </SearchSlotsContext.Provider>
    );
  };
