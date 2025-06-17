import { InfoRounded, WarningAmberRounded } from '@mui/icons-material';
import { useCallback, useMemo, useRef } from 'react';
import type { ToastOptions } from 'react-hot-toast';
import { toast } from 'react-hot-toast';

export const useAsyncToast = (defOptions?: ToastOptions) => {
  const toastRef = useRef<string>('');

  const loading = useCallback(
    (msg: string = 'Loading...', options?: ToastOptions) => {
      const toastId = toast.loading(msg, { ...defOptions, ...options });
      toastRef.current = toastId;
      return toastId;
    },
    [defOptions]
  );

  const updateLoadingMsg = useCallback(
    (msg: string, options?: ToastOptions) => {
      toast.loading(msg, {
        id: toastRef.current,
        ...defOptions,
        ...options,
      });
    },
    [defOptions]
  );

  const success = useCallback(
    (msg: string, options?: ToastOptions) => {
      toast.success(msg, {
        id: toastRef.current,
        ...defOptions,
        ...options,
      });
    },
    [defOptions]
  );

  const error = useCallback(
    (msg: string = 'An Error occurred', options?: ToastOptions) => {
      toast.error(msg, {
        id: toastRef.current,
        ...defOptions,
        ...options,
      });
    },
    [defOptions]
  );

  const info = useCallback(
    (msg: string, options?: ToastOptions) =>
      toast(msg, {
        id: toastRef.current,
        icon: <InfoRounded fontSize='small' color='info' />,
        ...defOptions,
        ...options,
      }),
    [defOptions]
  );

  const warn = useCallback(
    (msg: string, options?: ToastOptions) =>
      toast(msg, {
        id: toastRef.current,
        icon: <WarningAmberRounded fontSize='small' color='warning' />,
        ...defOptions,
        ...options,
      }),
    [defOptions]
  );

  const blank = useCallback(
    (msg: string, options?: ToastOptions) =>
      toast(msg, {
        id: toastRef.current,
        ...defOptions,
        ...options,
      }),
    [defOptions]
  );

  const dismiss = useCallback(() => {
    toast.dismiss(toastRef.current || undefined);
  }, []);

  const memoed = useMemo(
    () => ({
      loading,
      updateLoadingMsg,
      success,
      info,
      error,
      warn,
      blank,
      dismiss,
    }),
    [loading, updateLoadingMsg, success, info, error, warn, blank, dismiss]
  );

  return memoed;
};
