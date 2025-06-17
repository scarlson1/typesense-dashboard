import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';
import { useFormContext } from '../../hooks';

interface SubmitButtonProps extends ButtonProps {
  label: string;
}

export function SubmitButton({ label, ...props }: SubmitButtonProps) {
  const { Subscribe } = useFormContext();

  return (
    <Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          variant='contained'
          {...props}
          type='submit'
          loading={isSubmitting || props.loading}
          disabled={!canSubmit || props.disabled}
        >
          {label}
        </Button>
      )}
    </Subscribe>
  );
}
