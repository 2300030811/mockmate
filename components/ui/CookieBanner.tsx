"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem("mockmate_cookie_consent");
      if (!consent) {
        // Show banner after brief delay to avoid layout shift
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in restricted iframes
    }
  }, []);

  const handleConsent = (choice: "accepted" | "essential") => {
    try {
      localStorage.setItem("mockmate_cookie_consent", choice);
      window.dispatchEvent(
        new CustomEvent("cookie-consent-updated", { detail: { consent: choice } })
      );
    } catch {
      // fallback
    }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent Banner"
      className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-md border border-zinc-200 dark:border-[#222232] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5e6ad2]/10 dark:bg-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] shrink-0">
            <Cookie className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Cookie & Data Governance
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            </h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              India DPDP Act (2023) & GDPR Aligned
            </p>
          </div>
        </div>
        <button
          onClick={() => handleConsent("essential")}
          aria-label="Dismiss cookie notice with essential cookies only"
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
        We utilize strictly necessary cookies for authentication and session integrity. Non-essential performance telemetry is kept anonymous and is never used to train external AI models.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={() => handleConsent("accepted")}
          className="w-full sm:w-auto flex-1 px-3.5 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#4d59be] active:bg-[#3d49ae] rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:ring-offset-1 text-center"
        >
          Accept All Cookies
        </button>
        <button
          onClick={() => handleConsent("essential")}
          className="w-full sm:w-auto flex-1 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-[#1c1c28] hover:bg-zinc-200 dark:hover:bg-[#252536] rounded-xl transition-colors border border-zinc-200 dark:border-[#2a2a3e] focus:outline-none focus:ring-2 focus:ring-zinc-400 text-center"
        >
          Essential Only
        </button>
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
        Review our detailed cookie classification in the{" "}
        <Link
          href="/cookies"
          className="text-[#5e6ad2] hover:underline font-medium"
        >
          Cookie Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-[#5e6ad2] hover:underline font-medium"
        >
          Privacy Policy
        </Link>.
      </div>
    </aside>
  );
}
