import { Box, Button, DialogActions } from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';
import { useAppForm, useDialog, withForm } from '../hooks';

const deleteFormOpts = formOptions({
  defaultValues: {
    deleteName: '',
  },
});

const DeleteForm = withForm({
  ...deleteFormOpts,
  props: {
    correctValue: '',
    handleClose: () => {},
  },
  render: ({ form, handleClose, correctValue }) => (
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
          />
        )}
      </form.AppField>
      <DialogActions>
        <Button onClick={() => handleClose()}>Cancel</Button>
        <form.AppForm>
          <form.SubmitButton label='Submit' />
        </form.AppForm>
      </DialogActions>
    </>
  ),
});

interface ConfirmDeletionFormProps {
  correctValue: string;
}

export function ConfirmDeletionForm({
  correctValue,
}: ConfirmDeletionFormProps) {
  const dialog = useDialog();

  const form = useAppForm({
    ...deleteFormOpts,
    onSubmit: ({ value: { deleteName } }) => {
      // const { success } = z.literal(correctValue).safeParse(deleteName);
      // if (success)
      dialog.handleAccept(deleteName);
    },
  });

  return (
    <Box
      component='form'
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2,
      }}
    >
      <DeleteForm
        form={form}
        handleClose={() => dialog.handleClose()}
        correctValue={correctValue}
      />
    </Box>
  );
}
