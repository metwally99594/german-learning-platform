"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseCountdownReturn = {
  remaining: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (seconds?: number) => void;
};

export function useCountdown(
  initialSeconds: number,
  onComplete?: () => void
): UseCountdownReturn {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => {
    if (remaining > 0) {
      setIsRunning(true);
    }
  }, [remaining]);
  const reset = useCallback((seconds?: number) => {
    setIsRunning(false);
    setRemaining(seconds ?? initialSeconds);
  }, [initialSeconds]);

  return { remaining, isRunning, start, pause, resume, reset };
}
