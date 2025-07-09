import { LoadingSpinner } from '@/components';
import type { DialogOptions } from '@/components/DialogContext';
import type { TextFieldProps } from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { Suspense, useCallback, useMemo } from 'react';
import { z } from 'zod/v4';
import { useAppForm, withForm } from './form';
import { useDialog } from './useDialog';

const deleteFormOpts = formOptions({
  defaultValues: {
    deleteName: '',
  },
});

const DeleteForm = withForm({
  ...deleteFormOpts,
  props: {
    correctValue: '',
    textFieldProps: {} as TextFieldProps | undefined,
  },
  render: ({ form, correctValue, textFieldProps }) => (
    <>
      <form.AppField
        name='deleteName'
        validators={{
          onChange: z.literal(correctValue),
        }}
      >
        {({ TextField }) => (
          <TextField
            id='deleteName'
            autoFocus
            required
            fullWidth
            variant='outlined'
            {...textFieldProps}
          />
        )}
      </form.AppField>
    </>
  ),
});

export type UseConfirmDeleteOptions = Pick<
  DialogOptions,
  'title' | 'description' | 'slots' | 'slotProps' | 'catchOnCancel'
>;

export const useConfirmDelete = (options?: UseConfirmDeleteOptions) => {
  const dialog = useDialog();

  const form = useAppForm({
    ...deleteFormOpts,
    onSubmit: ({ value: { deleteName }, formApi }) => {
      dialog.handleAccept(deleteName);
      // form.reset()
      formApi.reset();
    },
  });

  const openConfirmDelete = useCallback(
    (correctValue: string) =>
      dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Confirm Deletion ["${correctValue}"]`,
        description: `THIS ACTION CANNOT BE UNDONE. Type the value to confirm deletion (i.e. ${correctValue}).`,
        content: (
          <Suspense fallback={<LoadingSpinner />}>
            <DeleteForm
              form={form}
              correctValue={correctValue}
              textFieldProps={{ placeholder: correctValue }}
            />
          </Suspense>
        ),
        slots: {
          ...(options?.slots || {}),
          acceptButton: () => (
            <form.AppForm>
              <form.SubmitButton label='Submit' />
            </form.AppForm>
          ),
        },
        slotProps: {
          ...(options?.slotProps || {}),
          dialog: {
            maxWidth: 'sm',
            fullWidth: true,
            ...(options?.slotProps?.dialog || {}),
            component: 'form',
            onSubmit: (e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            },
            onClose: () => {
              form.reset();
              dialog.handleClose();
            },
          },
          acceptButton: {
            // necessary ??
            onClick: () => {
              console.log('button clicked --> submit form');
            },
            ...(options?.slotProps?.acceptButton || {}),
          },
          cancelButton: {
            ...(options?.slotProps?.cancelButton || {}),
            onClick: () => {
              form.reset();
              dialog.handleClose();
            },
          },
        },
      }),
    [options]
  );

  return useMemo(
    () => ({ ...dialog, openConfirmDelete }),
    [dialog, openConfirmDelete]
  );
};
