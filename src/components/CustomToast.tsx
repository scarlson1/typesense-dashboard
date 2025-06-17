import { CloseRounded } from '@mui/icons-material';
import type { CircularProgressProps, LinearProgressProps } from '@mui/material';
import {
  Box,
  CircularProgress,
  IconButton,
  keyframes,
  LinearProgress,
  linearProgressClasses,
  styled,
} from '@mui/material';
import { useCallback, useEffect } from 'react';
import type { Toast } from 'react-hot-toast';
import { toast, useToasterStore } from 'react-hot-toast';
import type { SwipeEventData } from 'react-swipeable';
import { useSwipeable } from 'react-swipeable';

import { useCountdown } from '../hooks';

const ToastLinearProgress = styled(LinearProgress)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 2,
  borderRadius: 1,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 1,
  },
}));

const ToastCircularProgress = styled(CircularProgress)(({ theme }) => ({
  scale: '-1 1',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
  opacity: 0.2,
}));

function getProgressProps<
  T extends LinearProgressProps | CircularProgressProps,
>(t: Toast): Partial<T> {
  switch (t.type) {
    case 'success':
      return { color: 'success' } as Partial<T>;
    case 'error':
      return { color: 'error' } as Partial<T>;
    case 'loading':
      return { variant: 'indeterminate', color: 'primary' } as Partial<T>;
    case 'custom':
      return { color: 'inherit' } as Partial<T>;
    case 'blank':
      return { color: 'inherit' } as Partial<T>;
  }
}

interface CloseToastButtonProps extends CircularProgressProps {
  timeRemaining: number;
  onClose: () => void;
}

const CloseToastButton = ({
  timeRemaining,
  onClose,
  ...props
}: CloseToastButtonProps) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        size='small'
        aria-label='close'
        onClick={onClose}
        sx={{ zIndex: 2 }}
      >
        <CloseRounded fontSize='inherit' />
      </IconButton>
      <ToastCircularProgress
        variant='determinate'
        value={timeRemaining}
        size={28}
        color='inherit'
        thickness={2}
        {...props}
      />
    </Box>
  );
};

function useToastCountdown(t: Toast) {
  const { pausedAt } = useToasterStore({ id: t.id });
  const countStart = (t.duration || 4000) / 100;
  const [count, { startCountdown, stopCountdown }] = useCountdown({
    countStart,
    intervalMs: 100,
  });

  useEffect(() => {
    const fn = pausedAt ? stopCountdown : startCountdown;
    t.visible && fn(); // BUG can leave other toasts stuck on stopCountdown
  }, [pausedAt, stopCountdown, startCountdown, t.visible]);

  const timeRemaining = (count / countStart) * 100;

  return [timeRemaining, { startCountdown, stopCountdown }] as const;
}

const enter = keyframes`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`;

const AnimatedIconWrapper = styled('div')`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(0.4);
  opacity: 0.3;
  min-width: 20px;
  animation-delay: 1000ms;
  animation: ${enter} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`;

export function CustomToast({ icon, message, t }: any) {
  const [timeRemaining, { stopCountdown }] = useToastCountdown(t);

  const handleClose = useCallback(() => {
    stopCountdown();
    toast.dismiss(t.id);
  }, [stopCountdown, t.id]);

  // TODO: swipe direction based on toast position ??
  const handlers = useSwipeable({
    onSwiped: (eventData: SwipeEventData) => handleClose(),
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <Box {...handlers} sx={{ display: 'flex', minWidth: 240 }}>
      <Box sx={{ flex: '0 0 auto', alignSelf: 'center' }}>
        <AnimatedIconWrapper>{icon}</AnimatedIconWrapper>
      </Box>
      <Box
        sx={{
          flex: '1 1 auto',
          '& div[role=status]': { justifyContent: 'flex-start' },
        }}
      >
        {message}
      </Box>
      {t.type !== 'loading' && (
        <CloseToastButton
          timeRemaining={timeRemaining}
          {...getProgressProps<CircularProgressProps>(t)}
          onClose={handleClose}
        />
      )}
      {t.withProgress && t.type !== 'loading' && (
        <ToastLinearProgress
          variant='determinate'
          value={timeRemaining}
          {...getProgressProps<LinearProgressProps>(t)}
        />
      )}
    </Box>
  );
}
