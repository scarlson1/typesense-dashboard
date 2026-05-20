import {
  DarkModeRounded,
  LaptopRounded,
  LightModeRounded,
} from '@mui/icons-material';
import { IconButton, styled, useColorScheme } from '@mui/material';
import { useCallback, type ComponentProps } from 'react';

interface IconWrapperProps extends ComponentProps<'span'> {
  transform: string;
}

const IconWrapper = styled('span')<IconWrapperProps>(
  ({ theme, transform }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    transformOrigin: '50% 100px',
    // transform: 'translate(0)', // transform (enables transforms, no effect by itself)
    transform,
    transition: theme.transitions.create(['transform'], {
      duration: theme.transitions.duration.complex,
    }), // 'transform 0.7s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
);

const StyledButton = styled(IconButton)(({ theme }) => ({
  // display: 'inline-flex',
  // alignItems: 'center',
  // justifyContent: 'center',
  // borderWidth: '2px',
  // borderColor: 'var(--color-secondary)',
  overflow: 'hidden',
  transition: theme.transitions.create('all', {
    duration: theme.transitions.duration.standard,
  }),
  outline: 'none',
  minHeight: '40px',
  minWidth: '40px',
  border: '1.5px solid transparent',
  '&:hover': {
    borderColor: theme.vars.palette.grey[300], // 'var(--color-primary)',
  },
  '&:focus': {
    borderColor: theme.vars.palette.grey[300], // 'var(--color-primary)',
  },
}));

export const ThemeModeToggle = () => {
  const { mode, setMode } = useColorScheme();
  const nextMode =
    mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';

  const handleMode = useCallback(() => {
    setMode(nextMode);
  }, [nextMode, setMode]);

  if (!mode) return null;

  return (
    <StyledButton onClick={() => handleMode()}>
      <IconWrapper transform={mode === 'dark' ? 'rotate(0)' : 'rotate(90deg)'}>
        <DarkModeRounded fontSize='small' />
      </IconWrapper>
      <IconWrapper
        transform={mode === 'light' ? 'rotate(0)' : 'rotate(-90deg)'}
      >
        <LightModeRounded fontSize='small' />
      </IconWrapper>
      <IconWrapper
        transform={mode === 'system' ? 'translateY(0)' : 'translateY(2.5rem)'}
      >
        <LaptopRounded fontSize='small' />
      </IconWrapper>
    </StyledButton>
  );
};
