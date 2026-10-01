"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  Fingerprint
} from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/app/actions/auth";
import { AppUser } from "@/types";

interface SecurityTabProps {
  user: AppUser | null;
}

export function SecurityTab({ user }: SecurityTabProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user signed up via OAuth (Google / GitHub)
  const provider = (user?.user_metadata?.provider as string) || "";
  const isOAuthUser = provider === "google" || provider === "github";

  // Password Strength Logic
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const passedCriteria = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;
  const strengthScore = newPassword.length === 0 ? 0 : Math.min(passedCriteria + (hasSpecial ? 1 : 0), 4);

  const getStrengthMeta = () => {
    switch (strengthScore) {
      case 1:
        return { label: "Weak", color: "bg-red-500", text: "text-red-500" };
      case 2:
        return { label: "Fair", color: "bg-orange-500", text: "text-orange-500" };
      case 3:
        return { label: "Good", color: "bg-amber-500", text: "text-amber-500" };
      case 4:
        return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
      default:
        return { label: "Empty", color: "bg-zinc-200 dark:bg-zinc-800", text: "text-zinc-400" };
    }
  };

  const strengthMeta = getStrengthMeta();
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch && !loading;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (!hasMinLength) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!hasUpper || !hasLower || !hasNumber) {
      toast.error("Password must contain uppercase, lowercase, and a number.");
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({ newPassword });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isOAuthUser) {
    return (
      <Card className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-subtle overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-[#1e1e2a]/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Single Sign-On Security
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                Your account authentication is governed by a federated OAuth provider.
              </CardDescription>
            </div>
            <div className="px-2.5 py-0.5 rounded-[5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
              OAuth Active
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#11111a] space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] dark:text-[#7f8cf8] shrink-0 font-bold uppercase text-xs">
                {provider[0] || "S"}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#ebebef] capitalize">
                  {provider} Authentication
                </h4>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                  Linked to {user?.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
              Your password and two-factor authentication (2FA) credentials are managed directly by{" "}
              <strong className="capitalize text-zinc-800 dark:text-[#ebebef]">{provider}</strong>. To change your
              password or review recent login locations, visit your provider account settings.
            </p>

            <div className="pt-1">
              <a
                href={
                  provider === "google"
                    ? "https://myaccount.google.com/security"
                    : "https://github.com/settings/security"
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#161622] hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] text-xs font-medium text-zinc-700 dark:text-[#ebebef] transition-colors"
              >
                <span>Manage {provider} Security</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/40 dark:bg-[#11111a]/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-[#8b8b9e]">
              <Fingerprint className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span>Biometric / Token Auth</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-[#8b8b9e]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS 1.3 Strict Transport</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-subtle overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-[#1e1e2a]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#5e6ad2]" />
              Account Security & Password
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Rotate your master password and view connection cryptographic telemetry.
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Session</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] uppercase tracking-wide flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#5e6ad2]" />
                Rotate Password
              </h4>
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="new-password"
                  className="text-xs font-medium text-zinc-700 dark:text-[#ebebef]"
                >
                  New Password
                </label>
                {newPassword.length > 0 && (
                  <span className={`text-[11px] font-mono font-medium ${strengthMeta.text}`}>
                    Strength: {strengthMeta.label}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] px-3.5 py-2 text-sm text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] focus:bg-white dark:focus:bg-[#14141e] transition-colors pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter Bar */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step <= strengthScore ? strengthMeta.color : "bg-zinc-200 dark:bg-[#1e1e2a]"
                    }`}
                  />
                ))}
              </div>

              {/* Requirement Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-500" : "text-zinc-400 dark:text-[#5a5a6e]"}`}>
                  {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-500" : "text-zinc-400 dark:text-[#5a5a6e]"}`}>
                  {hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Uppercase letter (A–Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-500" : "text-zinc-400 dark:text-[#5a5a6e]"}`}>
                  {hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Lowercase letter (a–z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-500" : "text-zinc-400 dark:text-[#5a5a6e]"}`}>
                  {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Numeric digit (0–9)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="confirm-password"
                  className="text-xs font-medium text-zinc-700 dark:text-[#ebebef]"
                >
                  Confirm New Password
                </label>
                {confirmPassword.length > 0 && (
                  <span
                    className={`text-[11px] font-mono flex items-center gap-1 ${
                      passwordsMatch ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check className="w-3 h-3" /> Passwords match
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" /> Do not match
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter new password"
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] px-3.5 py-2 text-sm text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] focus:bg-white dark:focus:bg-[#14141e] transition-colors pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-[#1e1e2a]/80">
            <div className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e] hidden sm:block">
              Hash: Bcrypt Salt Rounds 12
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="gap-2 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-sm font-medium text-xs rounded-lg px-4 py-2 transition-all active:scale-[0.98] border border-transparent disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Cryptographic Telemetry Box */}
        <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Row-Level Security (RLS) Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Hardware Token Supported</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

