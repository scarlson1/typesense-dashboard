import type { AutocompleteProps as MuiAutocompleteProps } from '@mui/material';
import { Autocomplete as MuiAutocomplete, TextField } from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { useFieldContext } from '../../hooks';

type AutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div',
> = Omit<
  MuiAutocompleteProps<
    Value,
    Multiple,
    DisableClearable,
    FreeSolo,
    ChipComponent
  >,
  'value' | 'onChange' | 'onBlur' | 'error' | 'renderInput'
> & {
  label: string;
  helperText?: string;
};

function Autocomplete<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div',
>({
  label,
  helperText,
  ...props
}: AutocompleteProps<
  Value,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>) {
  const { state, store, handleBlur, handleChange } = useFieldContext<Value>();
  const errors = useStore(store, (state) => state.meta.errors);

  console.log('STATE: ', state);

  return (
    <MuiAutocomplete
      disablePortal
      // @ts-ignore TODO: fix type
      value={state.value}
      // @ts-ignore
      onChange={(_, newVal: Value | null) => {
        console.log('NEW VAL: ', newVal);
        handleChange(newVal ?? ('' as Value));
      }}
      blurOnSelect
      renderInput={(params) => (
        <TextField
          {...params}
          onBlur={handleBlur}
          label={label}
          error={state.meta.isTouched && !state.meta.isValid}
          helperText={
            errors.length
              ? errors.map((e) => e?.message).join(', ')
              : helperText
          }
        />
      )}
      {...props}
      // onBlur={handleBlur}
      // disabled={state.meta.isValidating}
      // error={Boolean(state.meta.errors.length)}
      // helperText={
      //   errors.length
      //     ? errors.map((e) => e?.message).join(', ')
      //     : props.helperText
      // }
      // slotProps={{ inputLabel: { shrink: true }, ...(props.slotProps || {}) }}
    />
  );
}

export default Autocomplete;
