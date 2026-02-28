"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { signInWithSocial } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import {
  Lock,
  Github,
  Chrome,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Constants ─── */

const PASSWORD_RULES = [
  { key: "length", label: "8+ characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "Lowercase", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "Number", test: (p: string) => /[0-9]/.test(p) },
] as const;

const STRENGTH_COLORS = [
  "bg-gray-200 dark:bg-gray-700",
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
];

const STRENGTH_LABELS = ["", "Weak", "Fair", "Strong"];
const STRENGTH_TEXT_COLORS = ["", "text-red-500", "text-yellow-500", "text-green-500"];

const INPUT_BASE =
  "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium disabled:opacity-50";

/* ─── Validate password against server rules (returns first failing message or null) ─── */

export function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
  return null;
}

/* ─── Password Strength Indicator ─── */

export const PasswordStrength = memo(function PasswordStrength({
  password,
}: {
  password: string;
}) {
  const checks = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password],
  );

  const passed = checks.filter((c) => c.passed).length;
  const strength = passed === 0 ? 0 : passed <= 2 ? 1 : passed === 3 ? 2 : 3;

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? STRENGTH_COLORS[strength] : STRENGTH_COLORS[0]
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(({ key, label, passed: ok }) => (
          <span
            key={key}
            className={`text-xs flex items-center gap-1 transition-colors ${
              ok
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <CheckCircle2 className={`w-3 h-3 ${ok ? "opacity-100" : "opacity-40"}`} />
            {label}
          </span>
        ))}
      </div>

      {strength > 0 && (
        <p className={`text-xs font-semibold ${STRENGTH_TEXT_COLORS[strength]}`}>
          {STRENGTH_LABELS[strength]} password
        </p>
      )}
    </div>
  );
});

/* ─── Password Input with visibility toggle ─── */

interface PasswordInputProps {
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  showStrength?: boolean;
  label?: string;
  extra?: React.ReactNode; // e.g. "Forgot?" link
}

export function PasswordInput({
  value,
  onChange,
  disabled,
  showStrength,
  label = "Password",
  extra,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const toggle = useCallback(() => setShowPassword((s) => !s), []);

  return (
    <div className="space-y-2">
      <div className={`flex items-center ${extra ? "justify-between px-1" : ""}`}>
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
          {label}
        </label>
        {extra}
      </div>
      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          disabled={disabled}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder="••••••••"
          className={`${INPUT_BASE} pl-12 pr-12`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && value !== undefined && <PasswordStrength password={value} />}
    </div>
  );
}

/* ─── Reusable Alert Banner ─── */

interface AlertBannerProps {
  variant: "error" | "success" | "info";
  Icon: LucideIcon;
  children: React.ReactNode;
}

const ALERT_STYLES = {
  error:
    "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  success:
    "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
} as const;

export function AlertBanner({ variant, Icon, children }: AlertBannerProps) {
  return (
    <div
      className={`flex items-start gap-2 p-3 border rounded-xl text-sm ${ALERT_STYLES[variant]}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

/* ─── Social Login Buttons + Divider ─── */

export function SocialButtons({ disabled }: { disabled?: boolean }) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => signInWithSocial("google")}
          disabled={disabled}
          variant="glass"
          className="flex items-center gap-2 rounded-2xl"
        >
          <Chrome className="w-4 h-4" /> Google
        </Button>
        <Button
          onClick={() => signInWithSocial("github")}
          disabled={disabled}
          variant="glass"
          className="flex items-center gap-2 rounded-2xl"
        >
          <Github className="w-4 h-4" /> GitHub
        </Button>
      </div>
    </>
  );
}

/* ─── Shared input classname export ─── */

export const inputClassName = `${INPUT_BASE} pl-12 pr-4`;
