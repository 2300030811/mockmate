"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🎯",
    title: "AI Quiz Generator",
    description: "Upload PDFs and generate smart quizzes instantly",
    href: "/upload",
    color: "from-blue-500 to-cyan-500",
    delay: 0.4
  },
  {
    icon: "🎤",
    title: "Mock Interviews",
    description: "Practice with AI-powered interview sessions",
    href: "/demo",
    color: "from-purple-500 to-pink-500",
    delay: 0.5
  },
  {
    icon: "🏆",
    title: "Certification Quizzes",
    description: "Prepare for AWS & Azure exams with curated quizzes",
    href: "/certification",
    color: "from-orange-500 to-cyan-500",
    delay: 0.6
  }
];

export function FeatureCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="grid md:grid-cols-3 gap-6 mb-12"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: feature.delay, ease: "easeOut" }}
        >
          <Link
            href={feature.href}
            className="group relative block h-full"
          >
            <div className="relative p-8 rounded-3xl transition-all duration-300 overflow-hidden transform h-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-2xl dark:bg-gray-900/50 dark:hover:bg-gray-900/70 dark:border-gray-800 dark:hover:border-gray-700 hover:scale-105 hover:-translate-y-1 active:scale-100 flex flex-col items-center text-center">
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Shimmer Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 transition-colors text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="transition-colors text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
