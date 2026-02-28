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
            router.push("/");
            router.refresh();
        }
        setLoading(false);
    }, [refresh, router]);

    const forgotLink = (
        <button type="button" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Forgot?
        </button>
    );

    return (
        <div className="space-y-6">
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

                <PasswordInput disabled={loading} extra={forgotLink} />

                <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
                </Button>
            </form>

            <SocialButtons disabled={loading} />

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Sign up
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
