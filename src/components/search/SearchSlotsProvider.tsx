import { mergeWith } from 'lodash-es';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  SEARCH_DEFAULT_SLOT_PROPS,
  SEARCH_DEFAULT_SLOTS,
} from '../../constants';
import {
  SearchSlotsContext,
  type SearchSlotComponents,
  type SearchSlotProps,
} from '../../context';

interface SearchSlotsProvider {
  slots?: Partial<SearchSlotComponents>;
  slotProps?: Partial<SearchSlotProps>;
  children: ReactNode;
}

export const SearchSlotsProvider = ({
  slots: providedSlots,
  slotProps: providedSlotProps = {},
  children,
}: SearchSlotsProvider) => {
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
    <SearchSlotsContext.Provider value={{ slots, slotProps, updateSlotProps }}>
      {children}
    </SearchSlotsContext.Provider>
  );
};
