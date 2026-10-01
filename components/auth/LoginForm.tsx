"use client";

import { useState, useCallback } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Mail, Loader2, AlertCircle, CheckCircle2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AlertBanner, PasswordInput, SocialButtons, inputClassName } from "./shared";

export function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const signupSuccess = searchParams.get("signup") === "success";
    const verified = searchParams.get("verified") === "true";
    const { refresh } = useAuth();

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await login({ email, password });

        if (result.error) {
            setError(
                result.error.toLowerCase().includes("email not confirmed")
                    ? "Your email is not verified yet. Please check your inbox for the verification link."
                    : result.error
            );
        } else {
            await refresh();
            const redirectTo = searchParams.get("redirect") || "/";
            router.push(redirectTo);
            router.refresh();
        }
        setLoading(false);
    }, [refresh, router, searchParams]);

    const forgotLink = (
        <Link href="/forgot-password" className="text-xs font-medium text-[#5e6ad2] hover:underline">
            Forgot?
        </Link>
    );

    return (
        <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
                {verified && !error && (
                    <AlertBanner variant="success" Icon={CheckCircle2}>
                        <p>Email verified successfully! You can now log in.</p>
                    </AlertBanner>
                )}

                {signupSuccess && !error && !verified && (
                    <AlertBanner variant="info" Icon={MailCheck}>
                        <p className="font-semibold">Account created! Check your email.</p>
                        <p className="text-xs mt-1 opacity-80">
                            We sent a verification link to your email. Click it to verify your account, then log in here.
                        </p>
                    </AlertBanner>
                )}

                {error && (
                    <AlertBanner variant="error" Icon={AlertCircle}>
                        <p>{error}</p>
                    </AlertBanner>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-0.5">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#5e6ad2] transition-colors" />
                        <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            disabled={loading}
                            placeholder="your@email.com"
                            className={inputClassName}
                        />
                    </div>
                </div>

                <PasswordInput disabled={loading} extra={forgotLink} autoComplete="current-password" />

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-10 rounded-xl bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white font-semibold text-xs sm:text-sm shadow-subtle transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In"}
                </button>
            </form>

            <SocialButtons disabled={loading} />

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-[#5e6ad2] hover:underline">
                    Sign up
                </Link>
            </p>

            <div className="text-center pt-1">
                <Link href="/" className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    Continue as Guest
                </Link>
            </div>
        </div>
    );
}
