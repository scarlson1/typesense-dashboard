import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';
import type { LinkComponent } from '@tanstack/react-router';
import { createLink } from '@tanstack/react-router';
import { forwardRef } from 'react';

interface MUIButtonLinkProps extends ButtonProps<'a'> {
  // Add any additional props you want to pass to the Button
}

const MUIButtonLinkComponent = forwardRef<
  HTMLAnchorElement,
  MUIButtonLinkProps
>((props, ref) => <Button ref={ref} component='a' {...props} />);

const CreatedButtonLinkComponent = createLink(MUIButtonLinkComponent);

export const ButtonLink: LinkComponent<typeof MUIButtonLinkComponent> = (
  props
) => {
  return <CreatedButtonLinkComponent preload={'intent'} {...props} />;
};
