import { merge } from 'lodash-es';
import { useMemo, type ReactNode } from 'react';
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
  slotProps: providedSlotProps,
  children,
}: SearchSlotsProvider) => {
  const slots = useMemo(
    () => ({
      ...SEARCH_DEFAULT_SLOTS,
      ...(providedSlots || {}),
    }),
    [providedSlots]
  );

  const slotProps = useMemo(
    () => merge(SEARCH_DEFAULT_SLOT_PROPS, providedSlotProps || {}),
    [providedSlotProps]
  );

  return (
    <SearchSlotsContext.Provider value={{ slots, slotProps }}>
      {children}
    </SearchSlotsContext.Provider>
  );
};
