"use client";

import { motion } from "framer-motion";

export function HeroHeader() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex justify-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-105 bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold tracking-wider">MOCKMATE</span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-4 md:mb-6 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent"
      >
        Elevate Your
        <br />
        Tech Interviews
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400"
      >
        AI-powered platform for quiz generation, mock interviews, and certification prep
      </motion.p>
    </>
  );
}
