"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HomeCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
      className="flex flex-wrap gap-4 justify-center"
    >
      <Link
        href="/demo"
        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
      >
        {/* Button Shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </div>
        <span className="relative flex items-center gap-2">
          Start Interview
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </span>
      </Link>
      
      <Link
        href="/upload"
        className="px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-2xl dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700 dark:hover:border-gray-600"
      >
        Generate Quiz
      </Link>
    </motion.div>
  );
}
