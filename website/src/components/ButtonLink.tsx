import { forwardRef } from 'react'
import { createLink } from '@tanstack/react-router'
import { Button } from '@mui/material'
import type { ButtonProps } from '@mui/material'
import type { LinkComponent } from '@tanstack/react-router'

const MUIButtonLink = forwardRef<HTMLAnchorElement, ButtonProps<'a'>>(
  (props, ref) => <Button ref={ref} component="a" {...props} />,
)

const CreatedButtonLink = createLink(MUIButtonLink)

export const ButtonLink: LinkComponent<typeof MUIButtonLink> = (props) => (
  <CreatedButtonLink preload="intent" {...props} />
)
