"use client";

import { motion } from "framer-motion";

export function HeroHeader() {
  return (
    <>

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
