"use client";

import React, { useState, useEffect, useMemo, useRef, MouseEvent } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  Code2,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  Search,
  X,
  FileCode,
  Layers,
  Sparkles,
  Cpu,
} from "lucide-react";
import { projects, ProjectChallenge } from "@/lib/projects/data";
import { getCompletedProjects } from "@/app/actions/project-progress";
import { logger } from "@/lib/logger";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { HomeBackground } from "@/components/home/HomeBackground";

// Difficulty sort weighting: Easy (1) -> Medium (2) -> Hard (3)
const DIFFICULTY_WEIGHT: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

// Interactive Spotlight Card Component matching MockMate's Homepage FeatureCards
function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      className={`relative h-full rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-[#3a3a52] transition-all duration-200 shadow-surface overflow-hidden ${className}`}
    >
      {/* Individual Card Spotlight Sheen */}
      <div
        className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition-opacity duration-300 dark:block hidden"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(94, 106, 210, 0.14), transparent 75%)`,
        }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full">
        {children}
      </div>
    </div>
  );
}

export default function ProjectModeList() {
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyFilter>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch from localStorage (immediate client-side sync)
    const saved = localStorage.getItem("completedProjects");
    let localCompleted: string[] = [];
    if (saved) {
      try {
        localCompleted = JSON.parse(saved);
      } catch (e) {
        logger.error("Failed to parse completed projects from localStorage", e);
      }
    }

    // 2. Fetch from server (authenticated users) and merge
    (async () => {
      try {
        const serverCompleted = await getCompletedProjects();
        const merged = Array.from(new Set([...localCompleted, ...serverCompleted]));
        setCompletedProjects(merged);
      } catch (e) {
        logger.error("Failed to fetch server-side completions", e);
        setCompletedProjects(localCompleted);
      }
    })();
  }, []);

  // Compute counts per difficulty
  const counts = useMemo(() => {
    return {
      All: projects.length,
      Easy: projects.filter((p) => p.difficulty === "Easy").length,
      Medium: projects.filter((p) => p.difficulty === "Medium").length,
      Hard: projects.filter((p) => p.difficulty === "Hard").length,
    };
  }, []);

  // Compute all unique tags
  const popularTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, []);

  // Filter and sort challenges
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query));

        const matchesDifficulty =
          activeDifficulty === "All" || project.difficulty === activeDifficulty;

        const matchesTag =
          !selectedTag || project.tags.includes(selectedTag);

        return matchesSearch && matchesDifficulty && matchesTag;
      })
      .sort((a, b) => {
        return (
          (DIFFICULTY_WEIGHT[a.difficulty] || 99) -
          (DIFFICULTY_WEIGHT[b.difficulty] || 99)
        );
      });
  }, [searchQuery, activeDifficulty, selectedTag]);

  const completionPercentage = useMemo(() => {
    if (projects.length === 0) return 0;
    return Math.round((completedProjects.length / projects.length) * 100);
  }, [completedProjects.length]);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 selection:bg-[#5e6ad2]/20 transition-colors">
        {/* ── 1. ASYMMETRIC PRECISION HERO SECTION ── */}
        <section className="relative border-b border-zinc-200 dark:border-[#1e1e2a] overflow-hidden">
          <HomeBackground />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="space-y-4">
              {/* Precision Status Pill */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[11px] font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">
                  Multi-File Sandpack Engine
                </span>
                <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
                <span>In-Browser Live Runtime & Diagnostics</span>
              </div>

              {/* Main Display Headline (Solid high-contrast text, matching homepage standard) */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-zinc-900 dark:text-[#ebebef] leading-[1.08] max-w-3xl">
                Project Mode Sandboxes
              </h1>

              {/* Disciplined Subheading */}
              <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed max-w-2xl font-normal">
                Solve production bugs, debug broken APIs, and architect responsive UI in an authentic in-browser Node & React IDE with automated test assertions and instant hot-reload.
              </p>

              {/* Telemetry Proof Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500 dark:text-[#5a5a6e]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#5e6ad2]" />
                  <span>Multi-file code sandboxes</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Automated test evaluation</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5e6ad2]" />
                  <span>
                    {completedProjects.length} of {projects.length} completed ({completionPercentage}%)
                  </span>
                </div>
              </div>

              {/* Telemetry Stats Grid */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] uppercase font-mono tracking-wider">
                    Total Sandboxes
                  </div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-[#ebebef] mt-0.5 font-mono">
                    {projects.length}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] mt-0.5">
                    Multi-file challenges
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] uppercase font-mono tracking-wider">
                    Solved Challenges
                  </div>
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                    {completedProjects.length} / {projects.length}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 mt-0.5">
                    {completionPercentage}% complete
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] uppercase font-mono tracking-wider">
                    Execution Runtime
                  </div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-[#ebebef] mt-0.5 font-mono">
                    React 18
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] mt-0.5">
                    Sandpack Container
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] uppercase font-mono tracking-wider">
                    Engine Status
                  </div>
                  <div className="text-lg font-semibold text-[#5e6ad2] mt-0.5 flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] mt-0.5">
                    Zero-latency preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. MAIN CHALLENGES MATRIX ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          {/* Section Subheader & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-[#1e1e2a] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
                  Engineering Challenge Catalog
                </h2>
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-[#ebebef] mt-0.5">
                Select a sandbox to launch in-browser code editor with instant live preview.
              </p>
            </div>

            {/* Precision Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-[#5a5a6e]" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] focus:border-[#5e6ad2] dark:focus:border-[#5e6ad2] rounded-md outline-none text-xs text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Segmented Filter Bar & Popular Tag Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Segmented Difficulty Control */}
            <div className="flex items-center gap-1 p-1 rounded-md bg-zinc-100 dark:bg-[#11111a] border border-zinc-200 dark:border-[#1a1a26] shrink-0">
              {(["All", "Easy", "Medium", "Hard"] as const).map((difficulty) => {
                const isActive = activeDifficulty === difficulty;
                return (
                  <button
                    key={difficulty}
                    onClick={() => setActiveDifficulty(difficulty)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                        : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                    }`}
                  >
                    <span>{difficulty}</span>
                    <span
                      className={`text-[9.5px] font-mono px-1 rounded ${
                        isActive
                          ? "bg-zinc-100 dark:bg-[#14141e] text-zinc-700 dark:text-[#a0a0b8]"
                          : "text-zinc-400 dark:text-[#5a5a6e]"
                      }`}
                    >
                      {counts[difficulty]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tag Quick Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] uppercase mr-1">
                Filter by tag:
              </span>
              {popularTags.slice(0, 5).map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                      isSelected
                        ? "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#ebebef] border-[#5e6ad2]/40"
                        : "bg-zinc-100 dark:bg-[#101017] text-zinc-600 dark:text-[#8b8b9e] border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#3a3a52]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] font-mono text-[#5e6ad2] hover:underline ml-1"
                >
                  Clear tag
                </button>
              )}
            </div>
          </div>

          {/* ── CHALLENGE CARDS GRID ── */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProjects.map((project, index) => {
                const isCompleted = completedProjects.includes(project.id);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    isCompleted={isCompleted}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              onClear={() => {
                setSearchQuery("");
                setActiveDifficulty("All");
                setSelectedTag(null);
              }}
            />
          )}
        </main>
      </div>

      <Footer />
      <MobileNav />
    </>
  );
}

interface ProjectCardProps {
  project: ProjectChallenge;
  index: number;
  isCompleted: boolean;
}

const ProjectCard = React.memo(({ project, isCompleted }: ProjectCardProps) => {
  return (
    <Link
      href={`/project-mode/${project.id}`}
      className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg h-full"
    >
      <SpotlightCard>
        <div>
          {/* Card Top Meta Strip */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9.5px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  project.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : project.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                }`}
              >
                {project.difficulty}
              </span>

              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-medium font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Solved
                </span>
              )}
            </div>

            {/* Template / Runtime pill */}
            <span className="text-[9.5px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#181824] text-zinc-500 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
              {project.template === "vanilla" ? "Vanilla JS" : "React 18"}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3 line-clamp-1">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {project.description}
          </p>

          {/* Living IDE Code Tabs & File Visual */}
          <div className="mt-4 p-2.5 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#6e6e84]">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-[#c0c0d4]">
                <FileCode className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>{project.activeFile || Object.keys(project.files)[0]}</span>
              </div>
              <span className="text-[9.5px] text-zinc-400 dark:text-[#5a5a6e]">
                {Object.keys(project.files).length} files
              </span>
            </div>
          </div>

          {/* Telemetry Row (Estimated Time & Success Rate) */}
          <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
            {project.estimatedTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>{project.estimatedTime}</span>
              </div>
            )}
            {project.completionRate && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>{project.completionRate}% Success</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: Tags & Action Arrow */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#101017] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 2 && (
              <span className="text-[9.5px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                +{project.tags.length - 2}
              </span>
            )}
          </div>

          <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
            <span>{isCompleted ? "Review Code" : "Open Sandbox"}</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </SpotlightCard>
    </Link>
  );
});
ProjectCard.displayName = "ProjectCard";

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 px-4 bg-zinc-50 dark:bg-[#14141e]/40 rounded-lg border border-dashed border-zinc-200 dark:border-[#1e1e2a]"
    >
      <div className="w-12 h-12 bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg flex items-center justify-center mx-auto mb-4 text-[#5e6ad2]">
        <Target className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-[#ebebef] mb-1">
        No matching challenges
      </h3>
      <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] max-w-sm mx-auto mb-6">
        No engineering sandboxes matched your search query or active difficulty filter.
      </p>
      <button
        onClick={onClear}
        className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#5e6ad2] text-white hover:bg-[#4f5ac4] transition-colors"
      >
        Clear all filters
      </button>
    </m.div>
  );
}
