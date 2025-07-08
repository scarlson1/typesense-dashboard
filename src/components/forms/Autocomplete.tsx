import { useFieldContext } from '@/hooks';
import type {
  AutocompleteProps as MuiAutocompleteProps,
  TextFieldProps,
} from '@mui/material';
import { Autocomplete as MuiAutocomplete, TextField } from '@mui/material';
import { useStore } from '@tanstack/react-form';

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
  label: string; // TODO: move to textFieldProps ??
  helperText?: string;
  textFieldProps?: Omit<TextFieldProps, 'value' | ''>;
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
  textFieldProps,
  // slotProps ={},
  ...props
}: AutocompleteProps<
  Value,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>) {
  const { state, store, handleBlur, handleChange } = useFieldContext();
  const errors = useStore(store, (state) => state.meta.errors);

  return (
    <MuiAutocomplete
      disablePortal
      // @ts-ignore TODO: fix type
      value={state.value}
      // @ts-ignore
      onChange={(_, newVal: Value | null) => {
        // console.log('NEW VAL: ', newVal);
        handleChange(newVal ?? ('' as Value));
      }}
      blurOnSelect={!props?.multiple}
      {...props}
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
          {...(textFieldProps || {})}
          slotProps={{
            ...(textFieldProps?.slotProps || {}),
            input: {
              ...params.InputProps,
              ...(textFieldProps?.slotProps?.input || {}),
            },
          }}
        />
      )}
    />
  );
}

export default Autocomplete;
