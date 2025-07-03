import { createContext } from 'react';
import { type DialogCtx } from '../components';

// TODO: slots:
// https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/DataGrid/useDataGridProps.ts
//  - pass props passed into component to "useDataGridProps" hook
//    - returns default slots, and overwrites with any provided slots (spread operator)
//  - passes the result to Root Props Context Provider

// TODO: confirmation screen ??

export const DialogContext = createContext<DialogCtx | null>(null);
