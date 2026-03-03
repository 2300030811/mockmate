"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  // Check if the user signed up via OAuth (Google/GitHub) — no password to change
  const isOAuthUser = user?.user_metadata?.provider === "google" || user?.user_metadata?.provider === "github";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
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
      <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You signed in with <strong className="capitalize">{String(user?.user_metadata?.provider || "a social provider")}</strong>. 
              Password management is handled by your OAuth provider. 
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          Security
        </CardTitle>
        <CardDescription>
          Update your password and manage account security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              Change Password
            </h4>

            <div className="space-y-3">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-gray-950/50 dark:border-gray-800 dark:text-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Must be 8+ characters with uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="space-y-3">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm new password"
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-gray-950/50 dark:border-gray-800 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
