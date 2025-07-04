import { useContext } from 'react';

import type { DialogCtx } from '../components';
import { DialogContext } from '../context';

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined)
    throw new Error('useDialog must be within a DialogProvider');

  return context as DialogCtx;
};
