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
    []
  );

  let queryByValid = Boolean(params?.query_by?.length);
  let helperTextVal = !queryByValid ? `"query_by" param required` : helperText;

  return (
    <TextField
      onChange={handleChange}
      fullWidth
      helperText={helperTextVal}
      disabled={disabled || !Boolean(params?.query_by?.length)}
      error={!queryByValid}
      autoComplete='false'
      {...props}
    />
  );
}
