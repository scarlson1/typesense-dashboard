import { useAsyncToast } from '@/hooks';
import { type MutationOptions } from '@tanstack/react-query';
import { useId, useMemo } from 'react';

interface UseMutationToast<TData, TError, TVars, TCtx> {
  toastId?: string; // needs to be dynamic ??
  loadingMsg: string | ((vars: TVars) => string);
  successMsg: string | ((data: TData, vars: TVars, ctx: TCtx) => string);
  errorMsg: string | ((err: TError, vars: TVars, ctx?: TCtx) => string);
}

export const useMutationToast = <TData, TError, TVars, TCtx>({
  toastId,
  loadingMsg,
  successMsg,
  errorMsg,
}: UseMutationToast<TData, TError, TVars, TCtx>): Omit<
  MutationOptions<TData, TError, TVars, TCtx>,
  'mutationFn'
> => {
  const toast = useAsyncToast();
  const id = useId();

  return useMemo(
    () => ({
      onMutate: (vars) => {
        let msg =
          typeof loadingMsg === 'string' ? loadingMsg : loadingMsg(vars);
        toast.loading(msg, { id: toastId || id });
        return {} as TCtx;
      },
      onSuccess: (data, vars, ctx) => {
        let msg =
          typeof successMsg === 'string'
            ? successMsg
            : successMsg(data, vars, ctx);
        toast.success(msg, { id: toastId || id });
        // return
      },
      onError: (err, vars, ctx) => {
        let msg =
          typeof errorMsg === 'string' ? errorMsg : errorMsg(err, vars, ctx);
        toast.error(msg, { id: toastId || id });
      },
    }),
    [toastId, loadingMsg, successMsg, errorMsg]
  );
};
