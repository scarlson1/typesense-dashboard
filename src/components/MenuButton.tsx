import type { IconButtonProps } from '@mui/material';
import { Badge, badgeClasses, IconButton } from '@mui/material';

export interface MenuButtonProps extends IconButtonProps {
  showBadge?: boolean;
}

export function MenuButton({ showBadge = false, ...props }: MenuButtonProps) {
  return (
    <Badge
      color='error'
      variant='dot'
      invisible={!showBadge}
      sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
    >
      <IconButton size='small' {...props} />
    </Badge>
  );
}
