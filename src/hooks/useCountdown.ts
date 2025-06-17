// import { useEffect, useRef, useState } from "react";

// // https://www.npmjs.com/package/@uidotdev/usehooks/v/2.1.1-experimental.1?activeTab=code

// // React docs (useEffectEvent experimental): https://react.dev/reference/react/experimental_useEffectEvent

// interface UseCountdownOptions {
//   interval: number;
//   onTick: () => void;
//   onComplete: () => void;
// }

// export function useCountdown(endTime: number, options: UseCountdownOptions) {
//   const [count, setCount] = useState(null);
//   const intervalIdRef = useRef(null);

//   const handleClearInterval = () => {
//     // window.clearInterval(intervalIdRef.current);
//     intervalIdRef.current && window.clearInterval(intervalIdRef.current);
//   };

//   const onTick = useEffectEvent(() => {
//     if (count === 0) {
//       handleClearInterval();
//       options.onComplete();
//     } else {
//       setCount(count - 1);
//       options.onTick();
//     }
//   });

//   useEffect(() => {
//     intervalIdRef.current = window.setInterval(() => {
//       onTick();
//     }, options.interval);

//     return () => handleClearInterval();
//   }, [options.interval]);

//   useEffect(() => {
//     setCount(Math.round((endTime - Date.now()) / options.interval));
//   }, [endTime, options.interval]);

//   return count;
// }

// SRC: https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useCountdown/useCountdown.ts
import { useCallback } from 'react';

import { useBoolean, useCounter, useInterval } from '.';

interface CountdownOption {
  countStart: number;
  intervalMs?: number;
  isIncrement?: boolean;
  countStop?: number;
}
interface CountdownControllers {
  startCountdown: () => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
}

/**
 * New interface with default value
 *
 * @param  {CountdownOption} countdownOption
 * @param  {number} countdownOption.countStart - the countdown's starting number, initial value of the returned number.
 * @param  {?number} countdownOption.countStop -  `0` by default, the countdown's stopping number. Pass `-Infinity` to decrease forever.
 * @param  {?number} countdownOption.intervalMs - `1000` by default, the countdown's interval, in milliseconds.
 * @param  {?boolean} countdownOption.isIncrement - `false` by default, true if the countdown is increment.
 * @returns [counter, CountdownControllers]
 */
export function useCountdown(
  countdownOption: CountdownOption
): [number, CountdownControllers];

export function useCountdown(
  countdownOption: CountdownOption
): [number, CountdownControllers] {
  let { countStart, intervalMs, isIncrement, countStop } = countdownOption;

  // default values
  intervalMs = intervalMs ?? 1000;
  isIncrement = isIncrement ?? false;
  countStop = countStop ?? 0;

  const {
    count,
    increment,
    decrement,
    reset: resetCounter,
  } = useCounter(countStart);

  /**
   * Note: used to control the useInterval
   * running: If true, the interval is running
   * start: Should set running true to trigger interval
   * stop: Should set running false to remove interval
   */
  const {
    value: isCountdownRunning,
    setTrue: startCountdown,
    setFalse: stopCountdown,
  } = useBoolean(false);

  /**
   * Will set running false and reset the seconds to initial value
   */
  const resetCountdown = () => {
    stopCountdown();
    resetCounter();
  };

  const countdownCallback = useCallback(() => {
    if (count === countStop) {
      stopCountdown();
      return;
    }

    if (isIncrement) {
      increment();
    } else {
      decrement();
    }
  }, [count, countStop, decrement, increment, isIncrement, stopCountdown]);

  useInterval(countdownCallback, isCountdownRunning ? intervalMs : null);

  return [
    count,
    {
      startCountdown,
      stopCountdown,
      resetCountdown,
    } as CountdownControllers,
  ];
}
