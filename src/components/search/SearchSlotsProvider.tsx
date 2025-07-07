import { merge } from 'lodash-es';
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
    () => merge(SEARCH_DEFAULT_SLOT_PROPS, slotPropsState), //providedSlotProps
    [slotPropsState] // providedSlotProps,
  );

  const updateSlotProps = useCallback((updates: Partial<SearchSlotProps>) => {
    console.log('updating slot props: ', updates);
    setSlotPropsState((prev) => ({ ...merge(prev, updates) }));
  }, []);

  return (
    <SearchSlotsContext.Provider value={{ slots, slotProps, updateSlotProps }}>
      {children}
    </SearchSlotsContext.Provider>
  );
};
