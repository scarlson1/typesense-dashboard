import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { CopyAllRounded } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Typography,
  type BoxProps,
  type ButtonProps,
  type SxProps,
  type TypographyProps,
} from '@mui/material';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface CopyProps extends BoxProps {
  children: React.ReactNode;
  value?: string | number | null;
  withButton?: boolean;
  textProps?: TypographyProps;
  containerProps?: BoxProps;
  buttonProps?: Omit<ButtonProps, 'onClick'>;
  iconSx?: SxProps;
}

export const Copy = ({
  children,
  value,
  withButton = true,
  textProps = {},
  containerProps = {},
  buttonProps = {},
  iconSx = {},
  ...props
}: CopyProps) => {
  const [, copy] = useCopyToClipboard();

  const handleCopy = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>
    ) => {
      e.stopPropagation();
      copy(value);
      toast.success('Copied!');
    },
    [copy, value]
  );

  if (!value) return <>{children}</>;

  return (
    <Box
      {...props}
      sx={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: '100%',
        ...(props?.sx || {}),
      }}
    >
      <Box
        onClick={handleCopy}
        sx={{
          minWidth: 0,
          // flex: '1 1 auto',
          flex: '0 1 auto',
          '&:hover': { cursor: 'pointer' },
          ...(containerProps?.sx || {}),
        }}
      >
        <Typography
          variant='body2'
          color='text.secondary'
          component='div'
          {...textProps}
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mr: 1,
            ...(textProps?.sx || {}),
          }}
        >
          {children}
        </Typography>
      </Box>
      {withButton ? (
        <IconButton
          size='small'
          onClick={(e) => handleCopy(e)}
          {...buttonProps}
          sx={{ flex: '0 0 auto', ...(buttonProps?.sx || {}) }}
        >
          <CopyAllRounded fontSize='inherit' sx={iconSx} />
        </IconButton>
      ) : null}
    </Box>
  );
};
