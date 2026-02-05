"use client";

import { motion } from "framer-motion";

const stats = [
  { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />, text: "AI-Powered", color: "text-green-500" },
  { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />, text: "Real-time Feedback", color: "text-blue-500" },
  { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />, text: "Customizable", color: "text-purple-500" }
];

export function StatsRow() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
      className="mt-16 flex flex-wrap gap-8 justify-center text-sm text-gray-600 dark:text-gray-500"
    >
      {stats.map((stat, i) => (
        <motion.div 
          key={i}
          className="flex items-center gap-2 transition-all duration-300 hover:scale-110 cursor-default"
          whileHover={{ y: -2 }}
        >
          <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {stat.icon}
          </svg>
          <span>{stat.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
