"use client";

import { LazyMotion, domMax } from "framer-motion";

/**
 * LazyMotion provider that wraps the app to enable tree-shaking of
 * framer-motion features. With `domMax`, all features including 
 * drag and layout transitions are supported.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax}>
      {children}
    </LazyMotion>
  );
}
