import type { TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { MenuItem, TextField as MuiTextField } from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { useFieldContext } from '../../hooks';

type Option = { value: any; label: string };

type TextFieldProps = Omit<
  MuiTextFieldProps,
  'onChange' | 'onBlur' | 'helperText' | 'error' | 'select'
> & { options: Array<string | number | Option> };

export function Select({ label, options, id, ...props }: TextFieldProps) {
  // Use the context returned from `createFormHookContexts`
  // The `Field` infers that it should have a `value` type of `string`
  const { state, store, handleBlur, handleChange } = useFieldContext<string>();
  const errors = useStore(store, (state) => state.meta.errors);

  return (
    <MuiTextField
      select
      label={label}
      fullWidth
      variant='outlined'
      color='primary'
      error={state.meta.isTouched && Boolean(errors.length)}
      value={state.value}
      defaultValue={state.value}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      helperText={
        errors.length ? errors.map((e) => e?.message).join(', ') : undefined
      }
      {...props}
    >
      {options.map((option) => {
        const val = typeof option === 'object' ? option.value : option;
        const label = typeof option === 'object' ? option.label : option;

        return (
          <MenuItem key={val} value={val}>
            {label}
          </MenuItem>
        );
      })}
    </MuiTextField>
  );
}
