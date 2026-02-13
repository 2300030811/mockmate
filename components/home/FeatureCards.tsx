"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { InteractiveCard } from "@/components/ui/Card";

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
  },
  {
    icon: "🚀",
    title: "Career Pathfinder",
    description: "AI-driven skill gap analysis & personalized learning roadmaps",
    href: "/career-path",
    color: "from-green-500 to-emerald-500",
    delay: 0.7
  }
];

export function FeatureCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
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
            <InteractiveCard className="h-full flex flex-col items-center text-center p-8">
              
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
            </InteractiveCard>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
