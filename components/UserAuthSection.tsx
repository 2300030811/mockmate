"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    LogOut,
    Settings,
    ChevronDown,
    LogIn,
    MessageSquare,
    Sparkles,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button, buttonVariants } from "./ui/Button";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { UserNicknameToggle } from "./UserNicknameToggle";
import { useAuth } from "@/components/providers/auth-provider";
import { getAvatarIcon } from "@/lib/icons";
import { FeedbackModal } from "./FeedbackModal";

export function UserAuthSection() {
    const { user, profile, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    // Keyboard support: Escape closes menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        if (menuOpen) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [menuOpen]);

    if (loading && !user) {
        return (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50 animate-pulse">
                <div className="w-5 h-5 rounded-[5px] bg-zinc-200 dark:bg-[#1e1e2a]" />
                <div className="w-16 h-2.5 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
            </div>
        );
    }

    if (!user) {
        return (
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
            >
                <UserNicknameToggle />

                <button
                    onClick={() => setFeedbackOpen(true)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] transition-colors"
                    title="Send Feedback"
                    aria-label="Send Feedback"
                >
                    <MessageSquare className="w-4 h-4" />
                </button>

                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] border border-zinc-200/80 dark:border-[#1e1e2a] transition-all"
                >
                    <LogIn className="w-3.5 h-3.5 text-[#5e6ad2]" />
                    <span>Login</span>
                </Link>

                <FeedbackModal
                    isOpen={feedbackOpen}
                    onClose={() => setFeedbackOpen(false)}
                />
            </m.div>
        );
    }

    const avatarIconName = profile?.avatar_icon || "User";
    const AvatarIcon = getAvatarIcon(avatarIconName);
    const nickname = profile?.nickname || user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.nickname || user.email?.split('@')[0];

    return (
        <div className="relative">
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#14141e] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] hover:border-zinc-300 dark:hover:border-[#2a2a3e] transition-all text-xs font-mono group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
            >
                <div className="w-5 h-5 rounded-[4px] bg-[#5e6ad2]/15 dark:bg-[#5e6ad2]/20 border border-[#5e6ad2]/30 flex items-center justify-center text-[#5e6ad2] dark:text-[#828df8] transition-transform group-hover:scale-105 shrink-0">
                    <AvatarIcon className="w-3 h-3 text-[#5e6ad2] dark:text-[#828df8]" />
                </div>
                <span className="max-w-[110px] truncate font-mono font-medium text-xs text-zinc-800 dark:text-[#ebebef]">
                    {nickname}
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 dark:text-[#6e6e84] group-hover:text-zinc-700 dark:group-hover:text-[#ebebef] transition-transform duration-200 ${
                        menuOpen ? "rotate-180 text-zinc-900 dark:text-[#ebebef]" : ""
                    }`}
                />
            </button>

            <AnimatePresence>
                {menuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuOpen(false)}
                        />
                        <m.div
                            role="menu"
                            initial={{ opacity: 0, scale: 0.98, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 4 }}
                            transition={{ duration: 0.12, ease: "easeOut" }}
                            className="absolute right-0 mt-1.5 w-60 bg-white/95 dark:bg-[#14141e]/95 backdrop-blur-xl border border-zinc-200 dark:border-[#1e1e2a] rounded-xl shadow-2xl z-50 p-1.5 transition-colors"
                        >
                            {/* User Header Info Card */}
                            <div className="px-2.5 py-2 rounded-lg bg-zinc-50/80 dark:bg-[#101018] border border-zinc-200/60 dark:border-[#1c1c28] mb-1">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <p className="text-[9px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                                        Account
                                    </p>
                                    {profile?.role === "admin" ? (
                                        <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="text-[8.5px] font-mono font-medium uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20">
                                            Member
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-mono font-semibold text-zinc-900 dark:text-[#ebebef] truncate" title={user.email}>
                                    {user.email}
                                </p>
                            </div>

                            {/* Menu Actions */}
                            <div className="space-y-0.5">
                                <Link
                                    href={profile?.role === "admin" ? "/admin" : "/dashboard"}
                                    onClick={() => setMenuOpen(false)}
                                    role="menuitem"
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono font-medium text-zinc-700 dark:text-[#c4c4d4] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100/80 dark:hover:bg-[#1c1c28] rounded-lg transition-colors group text-left"
                                >
                                    <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] transition-colors" />
                                    <span>{profile?.role === "admin" ? "Admin Dashboard" : "My Dashboard"}</span>
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={() => setMenuOpen(false)}
                                    role="menuitem"
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono font-medium text-zinc-700 dark:text-[#c4c4d4] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100/80 dark:hover:bg-[#1c1c28] rounded-lg transition-colors group text-left"
                                >
                                    <Settings className="w-3.5 h-3.5 text-zinc-400 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] transition-colors" />
                                    <span>Settings</span>
                                </Link>

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setFeedbackOpen(true);
                                    }}
                                    role="menuitem"
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono font-medium text-zinc-700 dark:text-[#c4c4d4] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100/80 dark:hover:bg-[#1c1c28] rounded-lg transition-colors group text-left cursor-pointer"
                                >
                                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] transition-colors" />
                                    <span>Send Feedback</span>
                                </button>
                            </div>

                            <div className="h-px bg-zinc-200/80 dark:bg-[#1e1e2a] my-1 mx-1" />

                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    logout();
                                }}
                                role="menuitem"
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors group text-left cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5 text-rose-500 transition-transform group-hover:translate-x-0.5" />
                                <span>Sign Out</span>
                            </button>
                        </m.div>
                    </>
                )}
            </AnimatePresence>

            <FeedbackModal
                isOpen={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
            />
        </div>
    );
}

