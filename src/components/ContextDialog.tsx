import { DialogContentText } from '@mui/material';
import { type ReactNode, useCallback } from 'react';

import { useDialog } from '../hooks';

// TODO: slots & slotsProps --> allow replacing header & actions area
// useGridRootProps: https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/hooks/utils/useGridRootProps.ts
// computeSlots: https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/DataGrid/useDataGridProps.ts
// https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/internals/utils/computeSlots.ts

// Example - MUI Grid Header (uses hook to check props to determine footer component rendering)
// https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/components/GridHeader.tsx

// TODO: use selector
// mui grid createSelector: https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/utils/createSelector.ts

// TODO: optional success screen displayed after submission
// should be displayed before returning promise so dialog isn't closed ??

function CtxDialog({ children }: { children: ReactNode }) {
  const { isOpen, handleClose, slots, slotProps } = useDialog();
  if (!slots.dialog) throw new Error('dialog component required in slots prop');

  return (
    <slots.dialog
      open={Boolean(isOpen)}
      onClose={handleClose}
      {...slotProps?.dialog}
    >
      {children}
    </slots.dialog>
  );
}

const Title = () => {
  const { title, slots, slotProps } = useDialog();

  return slots.title && title ? (
    <slots.title {...slotProps?.title}>{title}</slots.title>
  ) : null;
};

CtxDialog.Title = Title;

const Content = () => {
  const { slots, slotProps, description, content } = useDialog();

  // need to clone element to inject props (if props change after dialog is opened)??
  // let clone = content
  //   ? cloneElement(content as ReactElement, slotProps.content || {})
  //   : null;

  // TODO: fix naming for "content" (different than slots.content)
  return slots.content ? (
    <slots.content {...slotProps?.content}>
      {description ? (
        <DialogContentText component='div' sx={{ pb: 4 }}>
          {description}
        </DialogContentText>
      ) : null}
      {content ?? null}
      {/* {clone ?? null} */}
    </slots.content>
  ) : null;
};

CtxDialog.Content = Content;

// const SuccessView = () => {
//   const { slots, slotProps, successView, showSuccessView } = useDialog();
//   if (!showSuccessView) return null;

//   return <slots.content {...slotProps.content}>{successView}</slots.content>;
// };

// CtxDialog.SuccessView = SuccessView;

// interface ActionsProps {
//   // confirmButtonProps?: Omit<ButtonProps, 'onClick'>;
//   confirmButtonText?: string; // TODO: use children instead ?? can pass via slotProps
// }

// const Actions = ({ confirmButtonText = 'submit' }: ActionsProps) => {
const Actions = () => {
  const {
    onSubmit,
    onCancel,
    handleAccept,
    handleClose,
    slots,
    slotProps,
    submitDisabled,
    variant,
  } = useDialog();

  const handleSubmit = useCallback(() => {
    // if adding success screen --> need to check state and skip submit
    let fn = onSubmit ?? handleAccept;
    fn && fn();
  }, [onSubmit, handleAccept]);

  const handleCancel = useCallback(() => {
    let fn = onCancel ?? handleClose;
    fn && fn();
  }, []);

  return slots.actions ? (
    <slots.actions {...slotProps.actions}>
      {variant === 'danger' && (
        <>
          {slots.cancelButton && (
            <slots.cancelButton
              // onClick={handleClose}
              onClick={handleCancel}
              {...slotProps.cancelButton}
            >
              {slotProps.cancelButton?.children || 'Cancel'}
            </slots.cancelButton>
          )}
          {slots.acceptButton && (
            <slots.acceptButton
              onClick={handleSubmit}
              disabled={submitDisabled ?? false}
              {...(slotProps.acceptButton || {})}
            >
              {slotProps.acceptButton?.children || 'Confirm'}
            </slots.acceptButton>
          )}
        </>
      )}
      {variant === 'info' && slots.acceptButton && (
        <slots.acceptButton
          onClick={handleSubmit}
          disabled={submitDisabled || false}
          {...(slotProps.acceptButton || {})}
        >
          {slotProps.acceptButton?.children || 'OK'}
        </slots.acceptButton>
      )}
    </slots.actions>
  ) : null;
};

CtxDialog.Actions = Actions;

function ContextDialog() {
  return (
    <CtxDialog>
      <CtxDialog.Title />
      <CtxDialog.Content />
      {/* <CtxDialog.SuccessView /> */}
      <CtxDialog.Actions />
    </CtxDialog>
  );
}

export { ContextDialog, CtxDialog };
