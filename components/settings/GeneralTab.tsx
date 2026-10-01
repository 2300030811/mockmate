"use client";

import { useState } from "react";
import { User, Mail, ShieldCheck, Copy, Check, Sparkles, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { AVATAR_ICONS, getAvatarIcon } from "@/lib/icons";
import { Profile, AppUser } from "@/types";
import { toast } from "sonner";

interface GeneralTabProps {
  profile: Profile | null;
  user: AppUser | null; 
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
  submitButton: React.ReactNode;
}

export function GeneralTab({ profile, user, selectedIcon, setSelectedIcon, submitButton }: GeneralTabProps) {
  const initialNickname = (
    profile?.nickname ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nickname ||
    "User"
  ) as string;

  const [nicknameInput, setNicknameInput] = useState(initialNickname);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const CurrentAvatar = getAvatarIcon(selectedIcon);

  const copyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("Account UID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Card className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-subtle overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-[#1e1e2a]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
              <User className="w-4 h-4 text-[#5e6ad2]" />
              Public Identity & Persona
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Configure how your avatar, handle, and rank are surfaced across leaderboards and technical challenges.
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#7f8cf8] text-xs font-mono font-medium shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>Telemetry Live</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <input type="hidden" name="avatar_icon" value={selectedIcon} />

        {/* Live Identity Preview Card */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#11111a] p-3 sm:p-3.5 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-[#5e6ad2]/10 rounded-full blur-2xl opacity-60" />

          <div className="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] mb-2">
            <span>Leaderboard Card Preview</span>
            <span className="text-emerald-500 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 flex items-center justify-center text-[#5e6ad2] dark:text-[#7f8cf8] shrink-0 shadow-subtle">
              <CurrentAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef] truncate tracking-tight">
                  {nicknameInput.trim() || "Anonymous Cadet"}
                </h4>
                <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[9.5px] font-mono font-medium flex items-center gap-1">
                  <ShieldCheck size={10} />
                  <span>Verified</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-0.5 font-mono">
                <span className="truncate">{user?.email || "user@mockmate.io"}</span>
                <span>•</span>
                <span className="text-zinc-600 dark:text-zinc-400 shrink-0">
                  Role: {profile?.role || "Candidate"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selection Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] uppercase tracking-wide">
              Select Avatar Icon
            </label>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
              Selected: {selectedIcon}
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2 rounded-xl bg-zinc-50/50 dark:bg-[#11111a] border border-zinc-200 dark:border-[#1e1e2a]">
            {AVATAR_ICONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedIcon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIcon(item.id)}
                  title={item.id}
                  aria-label={`Select avatar ${item.id}`}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all text-xs font-mono gap-1 ${
                    isSelected
                      ? "bg-[#5e6ad2] text-white shadow-sm ring-1 ring-[#5e6ad2] scale-105"
                      : "bg-white dark:bg-[#161622] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-[#28283a] hover:scale-105"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8.5px] truncate max-w-full leading-none opacity-80">
                    {item.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Name Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="nickname"
              className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] uppercase tracking-wide"
            >
              Display Name / Handle
            </label>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
              {nicknameInput.length}/20 chars
            </span>
          </div>

          <input
            type="text"
            id="nickname"
            name="nickname"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            maxLength={20}
            required
            className="flex h-9 w-full rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] px-3.5 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] focus:bg-white dark:focus:bg-[#14141e] transition-colors font-medium"
            placeholder="Enter your nickname"
          />
          <p className="text-[10.5px] text-zinc-500 dark:text-[#8b8b9e]">
            Must be 2–20 characters. Alphanumeric characters, spaces, hyphens, and underscores are permitted.
          </p>
        </div>

        {/* Email Field (Read-only) */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] uppercase tracking-wide"
          >
            Registered Email Address
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                id="email"
                defaultValue={user?.email ?? ""}
                disabled
                className="flex h-9 w-full rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100/70 dark:bg-[#11111a] px-3.5 py-1.5 text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] cursor-not-allowed font-mono"
              />
              <Mail className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              onClick={copyEmail}
              className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#161622] hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono shrink-0"
              title="Copy email address"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Security & Account Telemetry Strip */}
        <div className="p-2.5 sm:p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/40 dark:bg-[#11111a]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center justify-between text-zinc-500 dark:text-[#8b8b9e]">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Key className="w-3.5 h-3.5 text-[#5e6ad2]" />
              Account UID:
            </span>
            <button
              type="button"
              onClick={copyId}
              className="text-zinc-700 dark:text-[#ebebef] hover:text-[#5e6ad2] transition-colors flex items-center gap-1 text-[11px]"
              title="Copy UID"
            >
              <span>{user?.id ? `${user.id.slice(0, 8)}...` : "—"}</span>
              {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-zinc-500 dark:text-[#8b8b9e] text-[11px]">
            <span>Account Role:</span>
            <span className="text-zinc-700 dark:text-[#ebebef] font-semibold">
              {profile?.role || "Developer"}
            </span>
          </div>
        </div>

        {/* Form Submission */}
        <div className="pt-1.5 flex items-center justify-end border-t border-zinc-100 dark:border-[#1e1e2a]/80">
          {submitButton}
        </div>
      </CardContent>
    </Card>
  );
}

