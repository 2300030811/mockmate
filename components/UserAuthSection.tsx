"use client";

import { useState } from "react";
import { 
    User, 
    LogOut, 
    Settings, 
    ShieldCheck, 
    ChevronDown, 
    LogIn,
    MessageSquare
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button, buttonVariants } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { UserNicknameToggle } from "./UserNicknameToggle";
import { useAuth } from "@/components/providers/auth-provider";
import { getAvatarIcon } from "@/lib/icons";
import { FeedbackModal } from "./FeedbackModal";
import { useTheme } from "./providers/providers";

export function UserAuthSection() {
    const { user, profile, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 animate-pulse">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
        );
    }

    if (!user) {
        return (
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1"
            >
                <UserNicknameToggle />
                
                <Button
                    onClick={() => setFeedbackOpen(true)}
                    variant="glass"
                    size="sm"
                    className="border-0 shadow-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-full w-9 h-9 p-0 group"
                    title="Send Feedback"
                >
                    <MessageSquare className="w-4 h-4 text-orange-500 transition-transform group-hover:scale-110" />
                </Button>

                <Link 
                    href="/login" 
                    className={buttonVariants({ variant: "glass", size: "sm", className: "border-0 shadow-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-full gap-2 px-4 transition-all" })}
                >
                    <LogIn className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Login</span>
                </Link>

                <FeedbackModal 
                    isOpen={feedbackOpen} 
                    onClose={() => setFeedbackOpen(false)} 
                    isDark={isDark}
                />
            </motion.div>
        );
    }

    const avatarIconName = profile?.avatar_icon || "User";
    const AvatarIcon = getAvatarIcon(avatarIconName);

    const nickname = profile?.nickname || user.user_metadata?.nickname || user.email?.split('@')[0];

    return (
        <div className="relative">
            <Button
                onClick={() => setMenuOpen(!menuOpen)}
                variant="glass"
                size="sm"
                className="border-0 shadow-none bg-transparent hover:bg-black/10 dark:hover:bg-white/10 rounded-full gap-2 px-3 transition-all duration-300"
            >
                <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <AvatarIcon className="w-3 h-3 text-white" />
                </div>
                <motion.span 
                    layout
                    className="max-w-[100px] truncate font-bold text-xs uppercase tracking-wider dark:text-white"
                >
                    {nickname}
                </motion.span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-500 ease-in-out ${menuOpen ? 'rotate-180' : ''}`} />
            </Button>

            <AnimatePresence>
                {menuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setMenuOpen(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                            className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-xl"
                        >
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5 mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                            </div>
                            
                            {profile?.role === 'admin' ? (
                                <Link 
                                    href="/admin"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                                >
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Admin Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                                >
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    My Dashboard
                                </Link>
                            )}
                            

                            <Link 
                                href="/settings"
                                onClick={() => setMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                            >
                                <Settings className="w-4 h-4 text-blue-500" />
                                Settings
                            </Link>

                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    setFeedbackOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                            >
                                <MessageSquare className="w-4 h-4 text-orange-500" />
                                Send Feedback
                            </button>

                            <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-2"></div>

                            <button 
                                onClick={async () => {
                                    setMenuOpen(false);
                                    await logout();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <FeedbackModal 
                isOpen={feedbackOpen} 
                onClose={() => setFeedbackOpen(false)} 
                isDark={isDark}
            />
        </div>
    );
}
