"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";

export function HeroHeader() {
  const { profile, user } = useAuth();
  const nickname = profile?.nickname || user?.user_metadata?.nickname || user?.email?.split('@')[0];

  return (
    <>
      {nickname && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Welcome back, {nickname}
        </motion.div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-4 md:mb-6 leading-[1.1] pb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent"
      >
        {nickname ? (
          <>Ready to crush<br />your next goal?</>
        ) : (
          <>Elevate Your<br />Tech Interviews</>
        )}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400 font-medium"
      >
        {nickname 
          ? "Your career trajectory is mapped. Continue your journey with AI-driven certification prep and realistic interview simulations." 
          : "Master the most demanding tech interviews with AI-generated quizzes, real-time feedback, and high-fidelity certification paths."}
      </motion.p>
    </>
  );
}
