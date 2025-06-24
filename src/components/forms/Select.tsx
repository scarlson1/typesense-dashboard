import type { TextFieldProps as MuiTextFieldProps } from '@mui/material';
import {
  Checkbox,
  ListItemText,
  MenuItem,
  TextField as MuiTextField,
} from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { useFieldContext } from '../../hooks';

type Option = { value: any; label: string };

type TextFieldProps = Omit<
  MuiTextFieldProps,
  'onBlur' | 'error' | 'select' // | 'onChange'
> & { options: Array<string | number | Option>; checkmark?: boolean };

export function Select({
  label,
  options,
  id,
  helperText,
  checkmark,
  ...props
}: TextFieldProps) {
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
        errors.length ? errors.map((e) => e?.message).join(', ') : helperText
      }
      // delete render value ?? used default ??
      slotProps={{
        select: {
          renderValue: (selected) => {
            if (typeof selected === 'string') return selected;
            if (Array.isArray(selected)) return selected.join(', ');
            return JSON.stringify(selected);
          },
        },
      }}
      {...props}
    >
      {options.map((option) => {
        const val = typeof option === 'object' ? option.value : option;
        const label = typeof option === 'object' ? option.label : option;

        return (
          <MenuItem key={val} value={val} dense>
            {checkmark ? (
              <Checkbox checked={state.value.includes(val)} size='small' />
            ) : null}
            {/* {label} */}
            <ListItemText primary={label} />
          </MenuItem>
        );
      })}
    </MuiTextField>
  );
}
