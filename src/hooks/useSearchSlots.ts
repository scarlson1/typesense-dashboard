import { useContext } from 'react';
import { SearchSlotsContext, type SearchSlotsContextValues } from '../context';

export const useSearchSlots = () => {
  const context = useContext<SearchSlotsContextValues | null>(
    SearchSlotsContext
  );
  if (context === undefined)
    throw new Error(
      'useSearchSlots must be within a SearchSlotsContext Provider'
    );

  const { slots, slotProps } = (context || {}) as SearchSlotsContextValues;

  return [slots, slotProps] as const;
};
