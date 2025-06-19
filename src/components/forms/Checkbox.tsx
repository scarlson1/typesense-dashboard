import type { CheckboxProps as MuiCheckboxProps } from '@mui/material';
import { FormControlLabel, Checkbox as MuiCheckbox } from '@mui/material';
import { useFieldContext } from '../../hooks';

interface CheckboxProps
  extends Omit<MuiCheckboxProps, 'onChange' | 'onBlur' | 'error'> {
  label: string;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  // Use the context returned from `createFormHookContexts`
  const { state, handleBlur, handleChange } = useFieldContext<boolean>();
  // const errors = useStore(store, (state) => state.metaCheckbox
  // console.log('state: ', state);
  // console.log('store: ', store);

  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          value='remember' // TODO: force value as prop (currently hard coded for auth form)
          color='primary'
          checked={state.value}
          onChange={(e) => handleChange(e.target.checked)}
          onBlur={handleBlur}
          {...props}
        />
      }
      label={label}
    />
  );
}
