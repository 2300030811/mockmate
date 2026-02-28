"use client";

import { useState, useCallback } from "react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Mail, User, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AlertBanner,
  PasswordInput,
  SocialButtons,
  validatePassword,
  inputClassName,
} from "./shared";
import { AlertCircle } from "lucide-react";

export function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [signupComplete, setSignupComplete] = useState(false);
    const [signupEmail, setSignupEmail] = useState("");
    const router = useRouter();

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const pwd = formData.get("password") as string;
        const nickname = formData.get("nickname") as string;

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        const pwdError = validatePassword(pwd);
        if (pwdError) {
            setError(pwdError);
            setLoading(false);
            return;
        }

        const result = await signup({ email, password: pwd, nickname });

        if (result.error) {
            setError(result.error);
        } else {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/");
                router.refresh();
            } else {
                setSignupEmail(email);
                setSignupComplete(true);
            }
        }
        setLoading(false);
    }, [router]);

    const handleReset = useCallback(() => {
        setSignupComplete(false);
        setSignupEmail("");
        setPassword("");
        setError(null);
    }, []);

    if (signupComplete) {
        return (
            <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <MailCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check your email</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        We&apos;ve sent a verification link to
                    </p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {signupEmail}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click the link in the email to verify your account, then come back and log in.
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        <strong>Didn&apos;t get the email?</strong> Check your spam or junk folder. The email may take a few minutes to arrive.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link href="/login" className="block">
                        <Button className="w-full h-12 rounded-2xl">Go to Login</Button>
                    </Link>
                    <button
                        onClick={handleReset}
                        className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        Use a different email
                    </button>
                </div>
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

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nickname</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            name="nickname"
                            type="text"
                            required
                            disabled={loading}
                            placeholder="Enter your leaderboard name"
                            className={inputClassName}
                        />
                    </div>
                    <p className="text-xs text-gray-400 ml-1">Letters, numbers, and underscores only (2-20 chars)</p>
                </div>

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

                <PasswordInput
                    value={password}
                    onChange={setPassword}
                    disabled={loading}
                    showStrength
                />

                <div className="pt-1">
                    <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                    </Button>
                </div>

                <p className="text-xs text-center text-gray-400">
                    We&apos;ll send you a verification email to confirm your address.
                </p>
            </form>

            <SocialButtons disabled={loading} />

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Log in
                </Link>
            </p>

            <div className="text-center">
                <Link href="/" className="text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 uppercase tracking-widest transition-colors">
                    Continue as Guest
                </Link>
            </div>
        </div>
    );
}
