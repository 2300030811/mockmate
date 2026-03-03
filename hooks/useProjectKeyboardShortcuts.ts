import { useEffect } from "react";

interface ProjectKeyboardShortcutsConfig {
  onVerify?: () => void;
  onReset?: () => void;
  onRevealHint?: () => void;
  enabled?: boolean;
}

/**
 * Hook for project mode keyboard shortcuts
 * Ctrl+Enter / Cmd+Enter: Verify solution
 * Ctrl+Shift+R / Cmd+Shift+R: Reset project
 * Ctrl+. / Cmd+.: Reveal hint (if available)
 */
export function useProjectKeyboardShortcuts({
  onVerify,
  onReset,
  onRevealHint,
  enabled = true,
}: ProjectKeyboardShortcutsConfig) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + Enter: Verify solution
      if (modKey && e.key === "Enter") {
        e.preventDefault();
        onVerify?.();
      }

      // Ctrl/Cmd + Shift + R: Reset project
      if (modKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        onReset?.();
      }

      // Ctrl/Cmd + . : Reveal hint
      if (modKey && e.key === ".") {
        e.preventDefault();
        onRevealHint?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onVerify, onReset, onRevealHint, enabled]);
}
