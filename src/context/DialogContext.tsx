import type {
  ButtonProps,
  DialogActionsProps,
  DialogContentProps,
  DialogProps,
  DialogTitleProps,
} from '@mui/material';
import { merge } from 'lodash-es';
import {
  type JSXElementConstructor,
  type ReactNode,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ContextDialog } from '../components';
import {
  CONTEXT_DIALOG_DEFAULT_SLOT_PROPS,
  CONTEXT_DIALOG_DEFAULT_SLOTS_COMPONENTS,
} from '../constants';

// TODO: slots:
// https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/DataGrid/useDataGridProps.ts
//  - pass props passed into component to "useDataGridProps" hook
//    - returns default slots, and overwrites with any provided slots (spread operator)
//  - passes the result to Root Props Context Provider

// TODO: confirmation screen ??

export interface DialogSlotsComponents {
  dialog: JSXElementConstructor<any>;
  title: JSXElementConstructor<any>;
  content: JSXElementConstructor<any>;
  actions: JSXElementConstructor<any>;
  acceptButton: JSXElementConstructor<any>;
  cancelButton: JSXElementConstructor<any>;
}

type SlotPropsWithOverrides<T> = Partial<T & Record<string, any>>;

export interface DialogSlotProps {
  dialog?: SlotPropsWithOverrides<Omit<DialogProps, 'open' | 'onClose'>>;
  title?: SlotPropsWithOverrides<DialogTitleProps>;
  content?: SlotPropsWithOverrides<DialogContentProps>;
  actions?: SlotPropsWithOverrides<DialogActionsProps>;
  acceptButton?: SlotPropsWithOverrides<Omit<ButtonProps, 'onClick'>>;
  cancelButton?: SlotPropsWithOverrides<Omit<ButtonProps, 'onClick'>>;
}

export type DialogVariant = 'danger' | 'info';
export interface DialogOptions {
  onSubmit?: (values?: any, helpers?: any) => void;
  catchOnCancel?: boolean;
  variant: DialogVariant;
  title?: ReactNode; // TODO: add description (might want text above form)
  description?: ReactNode;
  content?: ReactNode;
  // successView?: ReactNode;
  slots?: Partial<DialogSlotsComponents>;
  slotProps?: DialogSlotProps;
}

export interface DialogCtx extends DialogOptions {
  isOpen: boolean;
  submitDisabled: boolean;
  prompt: (options: DialogOptions) => Promise<any>;
  handleAccept: (values?: any) => void;
  handleClose: () => void;
  setDisabled: (val: boolean) => void;
  slots: DialogSlotsComponents;
  slotProps: DialogSlotProps;
  // showSuccessView: boolean;
}

interface AwaitingPromise {
  resolve: (values?: any) => void;
  reject: () => void;
}

export const DialogContext = createContext<DialogCtx | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(
    null
  );
  const [submitDisabled, setSubmitDisabled] = useState(false);

  const awaitingPromiseRef = useRef<AwaitingPromise | null>(null);

  const handleAccept = useCallback(
    (values: any) => {
      if (awaitingPromiseRef.current)
        awaitingPromiseRef.current.resolve(values);

      // TODO: accept optional onSuccessComponent to display after dialog is complete ??
      // if (awaitingPromiseRef.current) {
      //   awaitingPromiseRef.current.resolve(values);
      //   // show success view instead of closing dialog if provided
      //   console.log(`show success view: `, dialogOptions?.successView);
      //   if (dialogOptions?.successView) return;
      // }

      setDialogOptions(null);
    },
    [awaitingPromiseRef]
  );

  const handleClose = useCallback(() => {
    if (dialogOptions?.catchOnCancel && awaitingPromiseRef.current)
      awaitingPromiseRef.current.reject();

    setDialogOptions(null);
  }, [awaitingPromiseRef, dialogOptions]);

  const openDialog = useCallback(
    (options: DialogOptions) => {
      setDialogOptions({ ...options });

      return new Promise<any>((resolve, reject) => {
        awaitingPromiseRef.current = { resolve, reject };
      });
    },
    [awaitingPromiseRef]
  );

  const handleSubmitDisabled = useCallback(
    (val: boolean) => {
      if (!dialogOptions) return;
      setSubmitDisabled(val);
    },
    [dialogOptions]
  );

  const slots = useMemo(
    () => ({
      ...CONTEXT_DIALOG_DEFAULT_SLOTS_COMPONENTS,
      ...(dialogOptions?.slots || {}),
    }),
    [dialogOptions]
  );

  const slotProps = useMemo(
    () =>
      merge(CONTEXT_DIALOG_DEFAULT_SLOT_PROPS, dialogOptions?.slotProps || {}),
    [dialogOptions]
  );

  const memoed = useMemo<DialogCtx>(
    () => ({
      prompt: openDialog,
      handleAccept,
      handleClose,
      isOpen: Boolean(dialogOptions) || false,
      // showSuccessView: Boolean(dialogOptions) && !awaitingPromiseRef.current, // useRef won't trigger rerender ??
      variant: 'info' as DialogVariant,
      submitDisabled,
      setDisabled: handleSubmitDisabled,
      ...(dialogOptions || {}),
      slots,
      slotProps,
    }),
    [
      openDialog,
      handleAccept,
      handleClose,
      dialogOptions,
      submitDisabled,
      slots,
      slotProps,
      handleSubmitDisabled,
    ]
  );

  return (
    <DialogContext.Provider value={memoed}>
      {children}
      <ContextDialog />
    </DialogContext.Provider>
  );
};
