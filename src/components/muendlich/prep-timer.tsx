"use client";

import { useEffect } from "react";
import { useCountdown } from "./use-countdown";

export type PrepTimerProps = {
  seconds: number;
  onComplete?: () => void;
};

export function PrepTimer({ seconds, onComplete }: PrepTimerProps) {
  const { remaining, start } = useCountdown(seconds, onComplete);

  useEffect(() => {
    start();
  }, [start]);

  return <p className="text-2xl font-bold">{remaining}s</p>;
}
