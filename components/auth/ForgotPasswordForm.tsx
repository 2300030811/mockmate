"use client";

import { useState, useCallback } from "react";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AlertBanner, inputClassName } from "./shared";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const result = await resetPassword(email);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (success) {
    return (
      <div className="space-y-6">
        <AlertBanner variant="success" Icon={CheckCircle2}>
          <p className="font-semibold">Check your email!</p>
          <p className="text-xs mt-1 opacity-80">
            We sent a password reset link to your email. Click it to set a new password.
          </p>
        </AlertBanner>

        <Link href="/login">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <AlertBanner variant="error" Icon={AlertCircle}>
            <p>{error}</p>
          </AlertBanner>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              name="email"
              type="email"
              required
              disabled={loading}
              placeholder="your@email.com"
              className={inputClassName}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
        </Button>
      </form>

      <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>
    </div>
  );
}
