import { SearchSlotsContext, type SearchSlotsContextValues } from '@/context';
import { useContext } from 'react';

export const useSearchSlots = () => {
  const context = useContext<SearchSlotsContextValues | null>(
    SearchSlotsContext
  );
  if (context === undefined)
    throw new Error(
      'useSearchSlots must be within a SearchSlotsContext Provider'
    );

  const { slots, slotProps, updateSlotProps } = (context ||
    {}) as SearchSlotsContextValues;

  return [slots, slotProps, updateSlotProps] as const;
};
