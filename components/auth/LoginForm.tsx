"use client";

import { useState } from "react";
import { login, signInWithSocial } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, Github, Chrome, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const signupSuccess = searchParams.get("signup") === "success";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await login({ email, password });
        
        if (result.error) {
            setError(result.error);
        } else {
            router.push("/");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {signupSuccess && !error && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <p>Registration successful! Please log in.</p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                        <button type="button" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            Forgot?
                        </button>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button 
                    onClick={() => signInWithSocial('google')}
                    variant="glass" 
                    className="flex items-center gap-2 rounded-2xl"
                >
                    <Chrome className="w-4 h-4" /> Google
                </Button>
                <Button 
                    onClick={() => signInWithSocial('github')}
                    variant="glass" 
                    className="flex items-center gap-2 rounded-2xl"
                >
                    <Github className="w-4 h-4" /> GitHub
                </Button>
            </div>

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
