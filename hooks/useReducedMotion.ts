"use client";

import { useState, useEffect } from "react";

/**
 * Returns true if the user prefers reduced motion.
 * Checks both:
 *  - OS-level `prefers-reduced-motion: reduce`
 *  - App-level `mockmate_reduced_motion` localStorage flag
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Check app-level preference
    const appPref = localStorage.getItem("mockmate_reduced_motion") === "true";

    // Check OS-level preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const osPref = mq.matches;

    setReduced(appPref || osPref);

    // Listen for OS-level changes
    const handler = (e: MediaQueryListEvent) => {
      const appPrefCurrent =
        localStorage.getItem("mockmate_reduced_motion") === "true";
      setReduced(appPrefCurrent || e.matches);
    };
    mq.addEventListener("change", handler);

    // Listen for storage changes (app-level toggle from Settings)
    const storageHandler = (e: StorageEvent) => {
      if (e.key === "mockmate_reduced_motion") {
        setReduced(e.newValue === "true" || mq.matches);
      }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return reduced;
}
