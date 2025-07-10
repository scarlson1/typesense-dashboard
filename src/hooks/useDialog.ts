import type { DialogCtx } from '@/components/DialogContext';
import { DialogContext } from '@/context';
import { useContext } from 'react';

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined)
    throw new Error('useDialog must be within a DialogProvider');

  return context as DialogCtx;
};
