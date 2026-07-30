"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { InteractiveCard } from "@/components/ui/Card";
import { BrainCircuit, Mic, Trophy, Rocket, Flame, Layers, Swords, Code2, FileText, Globe, Target } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Tools" },
  { id: "practice", label: "Certifications & Practice" },
  { id: "interview", label: "Interview & Code" },
  { id: "career", label: "Resume & Career" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const features = [
  {
    Icon: BrainCircuit,
    title: "AI Quiz Generator",
    description: "Upload PDFs and generate smart quizzes instantly",
    href: "/upload",
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    category: "practice",
    delay: 0.1
  },
  {
    Icon: Trophy,
    title: "Certification Hub",
    description: "Prepare for AWS, Azure, & Salesforce curated exams",
    href: "/certification",
    gradient: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-500/20",
    category: "practice",
    delay: 0.15
  },
  {
    Icon: Swords,
    title: "The Arena",
    description: "1v1 high-speed technical duels with live progress tracking",
    href: "/arena",
    gradient: "from-red-600 to-orange-600",
    shadow: "shadow-red-500/20",
    category: "practice",
    delay: 0.2
  },
  {
    Icon: Mic,
    title: "Mock Interviews",
    description: "Practice with AI-powered interview sessions",
    href: "/demo",
    gradient: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/20",
    category: "interview",
    delay: 0.25
  },
  {
    Icon: Code2,
    title: "Project Mode",
    description: "Fix real bugs in multi-file sandboxed environments",
    href: "/project-mode",
    gradient: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20",
    category: "interview",
    delay: 0.3
  },
  {
    Icon: Layers,
    title: "System Design",
    description: "Interactive canvas to design and review architectures",
    href: "/system-design",
    gradient: "from-blue-600 to-indigo-600",
    shadow: "shadow-indigo-500/20",
    category: "interview",
    delay: 0.35
  },
  {
    Icon: Flame,
    title: "Resume Roaster",
    description: "Brutally honest AI analysis of your resume & ATS score",
    href: "/resume-roaster",
    gradient: "from-orange-500 to-red-500",
    shadow: "shadow-red-500/20",
    category: "career",
    delay: 0.4
  },
  {
    Icon: Target,
    title: "ATS Score Optimizer",
    description: "Deep technical evaluation & precise ATS keyword matching",
    href: "/ats-optimizer",
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-indigo-500/20",
    category: "career",
    delay: 0.45
  },
  {
    Icon: FileText,
    title: "Resume Builder",
    description: "Generate a polished PDF resume from structured profile details",
    href: "/resume-builder",
    gradient: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/20",
    category: "career",
    delay: 0.5
  },
  {
    Icon: Rocket,
    title: "Career Path",
    description: "AI-driven skill gap analysis & learning roadmaps",
    href: "/career-path",
    gradient: "from-emerald-500 to-green-500",
    shadow: "shadow-emerald-500/20",
    category: "career",
    delay: 0.55
  },
  {
    Icon: Globe,
    title: "Portfolio Builder",
    description: "Create a stunning portfolio website instantly with Portnova",
    href: "https://portnova.vercel.app/",
    gradient: "from-teal-500 to-emerald-500",
    shadow: "shadow-teal-500/20",
    category: "career",
    delay: 0.6
  }
];

import { useState } from "react";

export function FeatureCards() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");

  const filteredFeatures = activeCategory === "all"
    ? features
    : features.filter((f) => f.category === activeCategory);

  return (
    <div className="mb-12">
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-8 px-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-white/5"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Feature Grid */}
      <m.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left px-4"
      >
        {filteredFeatures.map((feature) => (
          <m.div
            key={feature.title}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Link
              href={feature.href}
              className="group relative block h-full"
              {...(feature.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <InteractiveCard className="h-full flex flex-col items-center text-center p-6 sm:p-8 overflow-hidden border-gray-200/80 dark:border-gray-800/80">
                {/* Background Glow Effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none`} />
                <div className={`absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none`} />

                <div className="relative z-10 flex flex-col items-center h-full">
                  {/* Icon Container */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.shadow} transform group-hover:scale-110 transition-all duration-300`}>
                    <feature.Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mb-2 transition-colors text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </InteractiveCard>
            </Link>
          </m.div>
        ))}
      </m.div>
    </div>
  );
}
