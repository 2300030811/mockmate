"use client";

import { useState } from "react";
import { User, LogOut, Settings, ShieldCheck, ChevronDown, LogIn } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button, buttonVariants } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { UserNicknameToggle } from "./UserNicknameToggle";
import { useAuth } from "@/app/auth-provider";

export function UserAuthSection() {
    const { user, profile, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    if (loading) {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse border border-gray-300 dark:border-gray-700"></div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <UserNicknameToggle />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                <Link 
                    href="/login" 
                    className={buttonVariants({ variant: "glass", size: "sm", className: "rounded-full gap-2 px-4 shadow-sm" })}
                >
                    <LogIn className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Login</span>
                </Link>
            </div>
        );
    }

    const nickname = profile?.nickname || user.user_metadata?.nickname || user.email?.split('@')[0];

    return (
        <div className="relative">
            <Button
                onClick={() => setMenuOpen(!menuOpen)}
                variant="glass"
                size="sm"
                className="rounded-full gap-2 px-4 border-emerald-500/20"
            >
                <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <User className="w-3 h-3 text-white" />
                </div>
                <span className="max-w-[100px] truncate font-bold text-xs uppercase tracking-wider dark:text-white">
                    {nickname}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
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
                            
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                My Dashboard
                            </button>
                            
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left">
                                <Settings className="w-4 h-4 text-blue-500" />
                                Settings
                            </button>

                            <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-2"></div>

                            <button 
                                onClick={async () => {
                                    await logout();
                                    setMenuOpen(false);
                                    window.location.reload(); // Force clear state
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
        </div>
    );
}
