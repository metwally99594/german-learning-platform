"use client";

import { useEffect, useState } from "react";

const REMINDER_INTERVAL_SECONDS = 600;
const BREAK_DURATION_SECONDS = 120;

export type UseSessionTimerReturn = {
  elapsedSeconds: number;
  showBreakReminder: boolean;
  dismissBreakReminder: () => void;
  takeBreak: () => void;
};

export function useSessionTimer(): UseSessionTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [nextReminderAt, setNextReminderAt] = useState(REMINDER_INTERVAL_SECONDS);
  const [showBreakReminder, setShowBreakReminder] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= nextReminderAt) {
          setShowBreakReminder(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextReminderAt]);

  const dismissBreakReminder = () => setShowBreakReminder(false);
  const takeBreak = () => {
    setShowBreakReminder(false);
    setNextReminderAt((prev) => prev + REMINDER_INTERVAL_SECONDS + BREAK_DURATION_SECONDS);
  };

  return { elapsedSeconds, showBreakReminder, dismissBreakReminder, takeBreak };
}
