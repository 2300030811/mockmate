"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { InteractiveCard } from "@/components/ui/Card";
import { BrainCircuit, Mic, Trophy, Rocket, Flame, Layers, Swords } from "lucide-react";

const features = [
  {
    Icon: BrainCircuit,
    title: "AI Quiz Generator",
    description: "Upload PDFs and generate smart quizzes instantly",
    href: "/upload",
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    delay: 0.1
  },
  {
    Icon: Mic,
    title: "Mock Interviews",
    description: "Practice with AI-powered interview sessions",
    href: "/demo",
    gradient: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/20",
    delay: 0.2
  },
  {
    Icon: Swords,
    title: "The Arena",
    description: "1v1 high-speed technical duels with live progress tracking",
    href: "/arena",
    gradient: "from-red-600 to-orange-600",
    shadow: "shadow-red-500/20",
    delay: 0.3
  },
  {
    Icon: Trophy,
    title: "Certification Hub",
    description: "Prepare for AWS, Azure, & Salesforce curated exams",
    href: "/certification",
    gradient: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-500/20",
    delay: 0.4
  },
  {
    Icon: Flame,
    title: "Resume Roaster",
    description: "Brutally honest AI analysis of your resume & ATS score",
    href: "/resume-roaster",
    gradient: "from-orange-500 to-red-500",
    shadow: "shadow-red-500/20",
    delay: 0.5
  },
  {
    Icon: Layers,
    title: "System Design",
    description: "Interactive canvas to design and review architectures",
    href: "/system-design",
    gradient: "from-blue-600 to-indigo-600",
    shadow: "shadow-indigo-500/20",
    delay: 0.6
  },
  {
    Icon: Rocket,
    title: "Career Path",
    description: "AI-driven skill gap analysis & learning roadmaps",
    href: "/career-path",
    gradient: "from-emerald-500 to-green-500",
    shadow: "shadow-emerald-500/20",
    delay: 0.7
  }
];

export function FeatureCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 text-left px-4"
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
            <InteractiveCard className="h-full flex flex-col items-center text-center p-8 overflow-hidden">
              
              {/* Background Glow Effect */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none`}></div>
              <div className={`absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none`}></div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg ${feature.shadow} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold mb-2 transition-colors text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {feature.title}
                </h3>
                
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
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
