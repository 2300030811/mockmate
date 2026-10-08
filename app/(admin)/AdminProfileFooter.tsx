"use client";

import { useState } from "react";
import { LogOut, Copy, Check, ShieldCheck } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

interface AdminProfileFooterProps {
  email?: string | null;
  nickname: string;
}

export function AdminProfileFooter({ email, nickname }: AdminProfileFooterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const initial = nickname.charAt(0).toUpperCase() || "A";

  return (
    <div className="p-3 border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#0f0f16]/80">
      <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-[#222232] bg-white/90 dark:bg-[#151522] shadow-2xs space-y-3">
        {/* User Info Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5e6ad2] to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initial}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#151522]"
                title="Admin Session Active"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-zinc-900 dark:text-[#ebebef] truncate leading-tight">
                  {nickname}
                </p>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase font-semibold">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <p
                  className="text-[10px] text-zinc-500 dark:text-[#6a6a82] truncate font-mono max-w-[110px]"
                  title={email || ""}
                >
                  {email || "admin@mockmate.internal"}
                </p>
                {email && (
                  <button
                    onClick={handleCopyEmail}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-0.5"
                    title={copied ? "Copied to clipboard!" : "Copy email address"}
                    aria-label="Copy admin email"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/5 text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Write Permission</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Active
          </span>
        </div>

        {/* Sign Out Button */}
        <form action={logout} className="pt-1 border-t border-zinc-100 dark:border-white/5">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-1.5 px-2.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20 group cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out Console</span>
          </button>
        </form>
      </div>
    </div>
  );
}
