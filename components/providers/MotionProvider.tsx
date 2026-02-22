"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * LazyMotion provider that wraps the app to enable tree-shaking of
 * framer-motion features. With `domAnimation`, only DOM-related animation
 * features are loaded (~17KB vs ~50KB for the full bundle).
 *
 * This replaces direct `motion` imports throughout the app with the
 * lighter `m` component. However, existing `motion.*` usage still works —
 * LazyMotion just ensures the feature bundle is loaded once, not per-component.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
}
