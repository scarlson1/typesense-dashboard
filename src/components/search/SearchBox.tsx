import { useSearch } from '@/hooks';
import { TextField, type TextFieldProps } from '@mui/material';
import { useCallback, type ChangeEventHandler } from 'react';

// TODO: fix flashing query_by helper text while context is loading
// currently relying on useEffect hook in UpdateSearchParameters

type SearchBoxProps = Omit<TextFieldProps, 'onChange'>;

export function SearchBox({ disabled, helperText, ...props }: SearchBoxProps) {
  const { setQuery, params } = useSearch();

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setQuery(event.target.value);
    },
    [],
  );

  const queryByValid = Boolean(params?.query_by?.length);
  const helperTextVal = !queryByValid
    ? `"query_by" param required`
    : helperText;

  return (
    <TextField
      onChange={handleChange}
      fullWidth
      helperText={helperTextVal}
      disabled={disabled || !Boolean(params?.query_by?.length)}
      error={!queryByValid}
      autoComplete='false'
      {...props}
      slotProps={{
        ...(props?.slotProps || {}),
        input: {
          ...(props?.slotProps?.input || {}),
          disableUnderline: true,
          sx: {
            fontSize: '16px', // set base to prevent auto iOS zoom
            transform: 'scale(0.9)', // adjust appearance
            transformOrigin: 'left center', // adjust layout so position stays correct
            '& .MuiInputBase-input': {
              padding: 0, // drop the 4/5 asymmetric padding
              height: '1.4375em',
              lineHeight: '1.4375em', // single-line text centers within its own line box
            },
          },
        },
      }}
      sx={{}}
    />
  );
}
