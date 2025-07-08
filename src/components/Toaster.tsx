import { darkToastOptions, lightToastOptions } from '@/constants';
import { useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { ToastOptions } from 'react-hot-toast';
import { Toaster as HotToaster, ToastBar } from 'react-hot-toast';
import { CustomToast } from './CustomToast';

export interface CustomToastOptions extends ToastOptions {
  withProgress?: boolean;
}

export const Toaster = () => {
  const theme = useTheme();

  const options = useMemo(
    () =>
      theme.palette.mode === 'dark' ? darkToastOptions : lightToastOptions,
    [theme.palette.mode]
  );

  return (
    <HotToaster toastOptions={options}>
      {(t) => (
        <ToastBar toast={t}>
          {(props) => <CustomToast {...props} t={t} />}
        </ToastBar>
      )}
    </HotToaster>
  );
};
