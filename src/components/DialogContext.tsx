import type {
  ButtonProps,
  DialogActionsProps,
  DialogContentProps,
  DialogProps,
  DialogTitleProps,
} from '@mui/material';
import { merge } from 'lodash-es';
import {
  type ComponentType,
  type ReactNode,
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
import { DialogContext } from '../context';

interface AwaitingPromise {
  resolve: (values?: any) => void;
  reject: () => void;
}

export interface DialogSlotsComponents {
  dialog: ComponentType<DialogProps>; // JSXElementConstructor<DialogProps>;
  title: ComponentType<DialogTitleProps>;
  content: ComponentType<DialogContentProps>;
  actions: ComponentType<DialogActionsProps>;
  acceptButton: ComponentType<ButtonProps>;
  cancelButton: ComponentType<ButtonProps>;
}

export type SlotPropsWithOverrides<T> = Partial<T & Record<string, any>>;

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
  onSubmit?: (values?: any, helpers?: any) => void; // update to tanstack form (from formik) ??
  onCancel?: () => void; // intercepts handleCancel
  catchOnCancel?: boolean;
  variant: DialogVariant;
  title?: ReactNode;
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
  updateSlotProps: (updates: Partial<DialogOptions['slotProps']>) => void;
}

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

  const updateSlotProps = useCallback(
    (updates: Partial<DialogOptions['slotProps']>) => {
      setDialogOptions((o) => {
        if (!o) return null;
        return {
          ...(o as DialogOptions),
          slotProps: merge(o?.slotProps || [], updates),
        };
      });
    },
    [dialogOptions?.slotProps]
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
      updateSlotProps,
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
      updateSlotProps,
    ]
  );

  return (
    <DialogContext.Provider value={memoed}>
      {children}
      <ContextDialog />
    </DialogContext.Provider>
  );
};
