"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface UseSessionTimerOptions {
  maxSeconds?: number;
  warnAtSeconds?: number;
  onWarning?: () => void;
  onTimeUp?: () => void;
}

interface UseSessionTimerReturn {
  elapsedSeconds: number;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

/**
 * Manages session elapsed time with optional pause/resume, time limit, and warning.
 */
export function useSessionTimer({
  maxSeconds = 45 * 60,
  warnAtSeconds = 40 * 60,
  onWarning,
  onTimeUp,
}: UseSessionTimerOptions = {}): UseSessionTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warnedRef = useRef(false);
  const onWarningRef = useRef(onWarning);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep callbacks fresh without recreating the interval
  useEffect(() => {
    onWarningRef.current = onWarning;
    onTimeUpRef.current = onTimeUp;
  }, [onWarning, onTimeUp]);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next === warnAtSeconds && !warnedRef.current) {
          warnedRef.current = true;
          onWarningRef.current?.();
        }
        if (next >= maxSeconds) {
          // Stop the timer — prevent running forever
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          onTimeUpRef.current?.();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, maxSeconds, warnAtSeconds]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const stop = useCallback(() => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { elapsedSeconds, isPaused, pause, resume, stop };
}
