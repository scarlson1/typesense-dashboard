import { primaryButtonSx } from '@/components/redesign';
import { useFormContext } from '@/hooks';
import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';

interface SubmitButtonProps extends ButtonProps {
  label: string;
}

export function SubmitButton({ label, sx, ...props }: SubmitButtonProps) {
  const { Subscribe } = useFormContext();

  return (
    <Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          variant='contained'
          disableElevation
          {...props}
          sx={[
            primaryButtonSx,
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ]}
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
