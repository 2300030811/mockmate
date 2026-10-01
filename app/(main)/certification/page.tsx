"use client";

import { useState, useMemo } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Trophy,
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
  Cpu,
  Award,
  Zap,
  Flame,
  Activity,
  Compass,
} from "lucide-react";
import { HomeBackground } from "@/components/home/HomeBackground";
import { getAllCategories } from "@/lib/quiz-registry";
import { quizThemes } from "@/lib/quiz-themes";
import type { QuizCategoryId } from "@/lib/quiz-registry";
import { ThemeIcon } from "@/components/quiz/ThemeIcon";

const BobAssistant = dynamic(
  () => import("@/components/quiz/BobAssistant").then((mod) => mod.BobAssistant),
  { ssr: false }
);

const CATEGORY_GROUPS = [
  { id: "all", label: "All Certifications" },
  { id: "cloud", label: "Cloud & Infrastructure" },
  { id: "enterprise", label: "Enterprise & AI" },
  { id: "data", label: "Database Systems" },
  { id: "programming", label: "Programming Tracks" },
] as const;

type GroupId = (typeof CATEGORY_GROUPS)[number]["id"];

// Mapping each category to a group & official exam code
const EXAM_METADATA: Record<
  string,
  {
    group: GroupId;
    code: string;
    level: "Foundational" | "Associate" | "Specialist" | "Professional";
    passBenchmark: string;
    color: {
      accent: string;
      badge: string;
      text: string;
      border: string;
      hoverBorder: string;
      glow: string;
    };
    highlightEngine?: string;
  }
> = {
  aws: {
    group: "cloud",
    code: "CLF-C02",
    level: "Foundational",
    passBenchmark: "70% (46/65)",
    color: {
      accent: "#ff9900",
      badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      text: "text-orange-500",
      border: "border-orange-500/20 dark:border-orange-500/30",
      hoverBorder: "hover:border-orange-500",
      glow: "rgba(255, 153, 0, 0.12)",
    },
    highlightEngine: "Multi-Response Architecture",
  },
  azure: {
    group: "cloud",
    code: "AZ-900",
    level: "Foundational",
    passBenchmark: "700/1000",
    color: {
      accent: "#0089d6",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      text: "text-blue-500",
      border: "border-blue-500/20 dark:border-blue-500/30",
      hoverBorder: "hover:border-blue-500",
      glow: "rgba(0, 137, 214, 0.12)",
    },
    highlightEngine: "Drag & Drop + Hotspots + Case Studies",
  },
  salesforce: {
    group: "enterprise",
    code: "AI-101",
    level: "Specialist",
    passBenchmark: "70% (42/60)",
    color: {
      accent: "#00a1e0",
      badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      text: "text-sky-500",
      border: "border-sky-500/20 dark:border-sky-500/30",
      hoverBorder: "hover:border-sky-500",
      glow: "rgba(0, 161, 224, 0.12)",
    },
    highlightEngine: "Agentforce Prompt & Logic Triggers",
  },
  mongodb: {
    group: "data",
    code: "C100DEV",
    level: "Associate",
    passBenchmark: "70% (42/60)",
    color: {
      accent: "#10b981",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      text: "text-emerald-500",
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      hoverBorder: "hover:border-emerald-500",
      glow: "rgba(16, 185, 129, 0.12)",
    },
    highlightEngine: "Aggregation Pipelines & MQL Snippets",
  },
  pcap: {
    group: "programming",
    code: "PCAP-31-03",
    level: "Associate",
    passBenchmark: "70% (28/40)",
    color: {
      accent: "#5e6ad2",
      badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      text: "text-[#5e6ad2] dark:text-[#7d88e8]",
      border: "border-indigo-500/20 dark:border-indigo-500/30",
      hoverBorder: "hover:border-indigo-500",
      glow: "rgba(94, 106, 210, 0.12)",
    },
    highlightEngine: "Python Code Tracing & AST Memory",
  },
  oracle: {
    group: "programming",
    code: "1Z0-808",
    level: "Associate",
    passBenchmark: "65% (33/50)",
    color: {
      accent: "#f87171",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      text: "text-rose-500",
      border: "border-rose-500/20 dark:border-rose-500/30",
      hoverBorder: "hover:border-rose-500",
      glow: "rgba(248, 113, 113, 0.12)",
    },
    highlightEngine: "Java JVM Syntax & Polymorphism",
  },
};

export default function CertificationSelectPage() {
  const [activeGroup, setActiveGroup] = useState<GroupId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allCategories = getAllCategories();

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) => {
      const meta = EXAM_METADATA[cat.id];
      const matchesGroup =
        activeGroup === "all" || (meta && meta.group === activeGroup);

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesGroup;

      const matchesQuery =
        cat.name.toLowerCase().includes(query) ||
        (meta && meta.code.toLowerCase().includes(query)) ||
        cat.aliases.some((a) => a.toLowerCase().includes(query));

      return matchesGroup && matchesQuery;
    });
  }, [allCategories, activeGroup, searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 selection:bg-[#5e6ad2]/20 transition-colors relative">
      <HomeBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10 space-y-5 text-left">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-[#6e6e84]">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-[#ebebef] font-semibold">
            Certifications
          </span>
        </div>

        {/* ── 1. HIGH-PRECISION HERO HEADER (Matching Homepage) ── */}
        <div className="space-y-2.5">
          {/* Precision Status Pill */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[11px] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 dark:bg-emerald-400/80 animate-pulse" />
            <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">
              MockMate Certification Radar
            </span>
            <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
            <span>2,400+ Verified Questions • Official 2026 Rubrics</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-zinc-900 dark:text-[#ebebef] leading-tight max-w-3xl">
            Enterprise Cloud & Tech Certification Suites.
          </h1>

          {/* Disciplined Subheading */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed max-w-3xl font-normal">
            Master high-stakes industry credentials with verified, multi-format question engines: interactive drag-and-drop architectures, hotspot verification tables, multiple-response challenges, and case studies with step-by-step reasoning.
          </p>

          {/* Telemetry Proof Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500 dark:text-[#5a5a6e]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>AWS • Azure • Salesforce • MongoDB • PCAP • Oracle</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span>MCQs • Hotspots • Drag & Drop • Case Studies</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Timed Exam & Untimed Practice Modes</span>
            </div>
            <span>•</span>
            <span>94.2% First-Attempt Pass Rate</span>
          </div>
        </div>

        {/* ── 2. GLOBAL TELEMETRY KPIS (4-Strip Ribbon) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
            <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
              <span>Question Pool</span>
              <Trophy className="w-3.5 h-3.5 text-[#5e6ad2]" />
            </div>
            <div className="mt-1 text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] tabular-nums">
              2,400+
            </div>
            <span className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              Verified 2026 exam dumps
            </span>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
            <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
              <span>Passing Benchmarks</span>
              <Award className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-1 text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] tabular-nums">
              70% - 75%
            </div>
            <span className="mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
              Calibrated to vendor cutoffs
            </span>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
            <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
              <span>Interactive Engines</span>
              <Cpu className="w-3.5 h-3.5 text-[#5e6ad2]" />
            </div>
            <div className="mt-1 text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] tabular-nums">
              6 Engines
            </div>
            <span className="mt-1 text-[11px] text-[#5e6ad2] dark:text-[#7d88e8]">
              Drag & Drop, Hotspots, Case Studies
            </span>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
            <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
              <span>Pass Probability</span>
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              94.2%
            </div>
            <span className="mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
              With 3+ mock passes
            </span>
          </div>
        </div>

        {/* ── 3. FILTER & SEARCH CONTROL BAR ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-4">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-[#11111a] border border-zinc-200 dark:border-[#1a1a26] overflow-x-auto shrink-0">
            {CATEGORY_GROUPS.map((group) => {
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle"
                      : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exam code, role, or vendor..."
              className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] focus:border-[#5e6ad2] rounded-lg py-1.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* ── 4. FLAGSHIP CERTIFICATION CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat, idx) => {
            const theme = quizThemes[cat.id as QuizCategoryId];
            const meta = EXAM_METADATA[cat.id];
            if (!theme || !meta) return null;

            return (
              <m.div
                key={cat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <div
                  className={`relative h-full rounded-xl border border-zinc-200 dark:border-[#1e1e2a] ${meta.color.hoverBorder} bg-white dark:bg-[#14141e] p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-subtle group overflow-hidden`}
                >
                  {/* Subtle top spotlight tint */}
                  <div
                    className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: meta.color.glow }}
                  />

                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Icon + Code + Level */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${meta.color.badge} group-hover:scale-105 transition-transform`}
                        >
                          <ThemeIcon icon={theme.badge.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 dark:text-[#6e6e84] block">
                            {meta.code}
                          </span>
                          <span className="text-[11px] font-semibold text-zinc-700 dark:text-[#c4c4d4]">
                            {meta.level} Tier
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#1a1a26] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#222232]">
                        {theme.exam.count} Questions
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors leading-snug">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1.5 leading-relaxed line-clamp-2">
                        {theme.subtitle}
                      </p>
                    </div>

                    {/* Exam Specification Telemetry Strip */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200/80 dark:border-[#1e1e2a] text-center">
                      <div>
                        <div className="text-[9.5px] uppercase font-mono text-zinc-400 dark:text-[#6e6e84]">
                          Time
                        </div>
                        <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-[#ebebef] mt-0.5">
                          {theme.exam.duration} Min
                        </div>
                      </div>
                      <div>
                        <div className="text-[9.5px] uppercase font-mono text-zinc-400 dark:text-[#6e6e84]">
                          Pass Cutoff
                        </div>
                        <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {meta.passBenchmark}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9.5px] uppercase font-mono text-zinc-400 dark:text-[#6e6e84]">
                          Pool Size
                        </div>
                        <div className="text-xs font-mono font-semibold text-[#5e6ad2] mt-0.5">
                          {theme.practice.max}+ Dumps
                        </div>
                      </div>
                    </div>

                    {/* Supported Interactive Engines (Highlighting Drag & Drop, Hotspots, etc.) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                        Interactive Question Engines:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {theme.questionTypes?.map((qType, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded-[5px] text-[10.5px] font-mono border transition-colors ${
                              qType.toLowerCase().includes("drag") ||
                              qType.toLowerCase().includes("hotspot") ||
                              qType.toLowerCase().includes("case")
                                ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/30 text-[#5e6ad2] dark:text-[#7d88e8] font-semibold"
                                : "bg-zinc-100 dark:bg-[#181824] border-zinc-200 dark:border-[#222232] text-zinc-600 dark:text-[#8b8b9e]"
                            }`}
                          >
                            {qType}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-5 mt-4 border-t border-zinc-200/80 dark:border-[#1e1e2a] flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 dark:text-[#8b8b9e]">
                      Untimed Practice & Timed Exam
                    </span>
                    <Link
                      href={`/${cat.routeSlug}/mode`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-[#5e6ad2] dark:bg-[#1a1a26] dark:hover:bg-[#5e6ad2] text-zinc-800 hover:text-white dark:text-[#ebebef] dark:hover:text-white text-xs font-semibold transition-all group-hover:bg-[#5e6ad2] group-hover:text-white"
                      aria-label={`Enter ${cat.name} certification suite`}
                    >
                      <span>Enter Suite</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredCategories.length === 0 && (
          <div className="py-16 text-center rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101017] p-8 space-y-3">
            <HelpCircle size={28} className="mx-auto text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-[#ebebef]">
              No certification tracks match &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-xs text-zinc-500">
              Try searching for &quot;AWS&quot;, &quot;Azure&quot;, &quot;Salesforce&quot;, &quot;Python&quot;, or clear filters.
            </p>
            <button
              onClick={() => {
                setActiveGroup("all");
                setSearchQuery("");
              }}
              className="text-xs font-medium text-[#5e6ad2] hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── 5. AI CERTIFICATION ASSISTANT (BOB) ── */}
        <BobAssistant
          key="career-guide-bob"
          customContext="You are Bob, the MockMate certification counselor. AWS is ideal for cloud infrastructure, Azure for enterprise Microsoft environments, Salesforce for enterprise CRM and AI agents, MongoDB for NoSQL databases, and PCAP for core Python mastery. Help candidates select the track aligned with their career goals."
          initialMessage="Need guidance on which certification to tackle first? I can analyze your target roles and recommend the highest-ROI credential path! 🚀"
        />
      </div>
    </div>
  );
}
