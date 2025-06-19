import type { TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { TextField as MuiTextField } from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { useFieldContext } from '../../hooks';

type TextFieldProps = Omit<MuiTextFieldProps, 'onChange' | 'onBlur' | 'error'>;

export function TextField(props: TextFieldProps) {
  const { state, store, handleBlur, handleChange } = useFieldContext<string>();
  const errors = useStore(store, (state) => state.meta.errors);

  return (
    <MuiTextField
      fullWidth
      variant='outlined'
      color='primary'
      {...props}
      defaultValue={state.value}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      error={Boolean(state.meta.errors.length)}
      helperText={
        errors.length
          ? errors.map((e) => e?.message).join(', ')
          : props.helperText
      }
      // slotProps={{ inputLabel: { shrink: true }, ...(props.slotProps || {}) }}
    />
  );
}

export default TextField;
