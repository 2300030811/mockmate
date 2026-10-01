"use client";

import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Mic,
  Trophy,
  Rocket,
  Flame,
  Layers,
  Swords,
  Code2,
  FileText,
  Globe,
  Target,
  Building2,
  ArrowRight,
  CheckCircle2,
  Activity,
  Sparkles,
  TrendingUp,
  Cpu,
  FileCode,
  Terminal,
  Play,
  Upload,
  AlertTriangle,
  Zap,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Engineering Modules" },
  { id: "career", label: "Campus & Career" },
  { id: "practice", label: "Certifications & Arena" },
  { id: "interview", label: "Interview & Architecture" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

// Interactive Spotlight Card Component that illuminates under the pointer
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

export function FeatureCards() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");

  const showCareer = activeCategory === "all" || activeCategory === "career";
  const showPractice = activeCategory === "all" || activeCategory === "practice";
  const showInterview = activeCategory === "all" || activeCategory === "interview";

  return (
    <section className="space-y-4 text-left" aria-label="MockMate Engineering Modules">
      {/* Section Header & Segmented Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
              Core Platform Architecture
            </h2>
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-[#ebebef] mt-0.5">
            12 living engineering modules with real-time telemetry, competitive execution, and campus intelligence.
          </p>
        </div>

        {/* Segmented Control Filter */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-zinc-100 dark:bg-[#11111a] border border-zinc-200 dark:border-[#1a1a26] shrink-0 self-start sm:self-auto">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle"
                    : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bento Grid (Locked gap-3.5 with 12 complete living cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">

        {/* ── CARD 1: KLU PLACEMENT RADAR (Span 2 Cols Flagship) ── */}
        {showCareer && (
          <Link
            href="/placements"
            className="group block lg:col-span-2 focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors flex items-center gap-2">
                        KLU Placement Intelligence & Radar
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-normal">
                          Live Drive 2025-26
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                        Campus recruitment schedules, verified CTC benchmarks, and 10-year official placement records.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
                    Campus Flagship
                  </span>
                </div>

                {/* Living CTC Ticker & Stage Radar */}
                <div className="mt-4 p-3.5 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-[#8b8b9e] border-b border-zinc-200/60 dark:border-[#1a1a26] pb-2">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-[#ebebef]">
                      <Activity className="w-3.5 h-3.5 text-[#5e6ad2]" />
                      Verified Campus CTC Ticker
                    </span>
                    <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400">
                      1,420 Active Profiles
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                      <div className="text-[10px] text-zinc-400 dark:text-[#6e6e84] uppercase">Amazon SDE-1</div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] t mt-0.5">
                        ₹44.14 LPA
                      </div>
                      <div className="text-[9px] text-emerald-500 mt-0.5">Super Dream</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                      <div className="text-[10px] text-zinc-400 dark:text-[#6e6e84] uppercase">ServiceNow</div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] t mt-0.5">
                        ₹32.00 LPA
                      </div>
                      <div className="text-[9px] text-emerald-500 mt-0.5">Product Core</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                      <div className="text-[10px] text-zinc-400 dark:text-[#6e6e84] uppercase">Oracle Cloud</div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] t mt-0.5">
                        ₹28.50 LPA
                      </div>
                      <div className="text-[9px] text-indigo-400 mt-0.5">Infra Systems</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                      <div className="text-[10px] text-zinc-400 dark:text-[#6e6e84] uppercase">JPMorgan Chase</div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] t mt-0.5">
                        ₹24.00 LPA
                      </div>
                      <div className="text-[9px] text-indigo-400 mt-0.5">FinTech Track</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[10.5px]">
                    <span className="text-zinc-500 dark:text-[#6e6e84] font-medium">Recruitment Phase:</span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <span className="h-1.5 flex-1 rounded-full bg-emerald-500/80" />
                      <span className="h-1.5 flex-1 rounded-full bg-emerald-500/80" />
                      <span className="h-1.5 flex-1 rounded-full bg-[#5e6ad2] animate-pulse" />
                      <span className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-[#20202e]" />
                    </div>
                    <span className="text-[10px] font-mono text-[#5e6ad2]">Day-1 Super Dream Slot</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  10-Yr Historical PDF Archive · 98.4% Match Engine
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Open Placement Command Center
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 2: AUTONOMOUS MOCK INTERVIEWS (Voice Waveform) ── */}
        {showInterview && (
          <Link
            href="/demo"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Audio & Speech AI
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  Autonomous Mock Interviews
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Real-time speech evaluation, adaptive algorithmic follow-ups, and rubric scoring.
                </p>

                {/* Living Audio Frequency Waveform */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26]">
                  <div className="flex items-center justify-between text-[10.5px] text-zinc-500 dark:text-[#6e6e84] mb-2 font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      MIC_INPUT ACTIVE
                    </span>
                    <span>96% Rubric Score</span>
                  </div>

                  <div className="h-8 flex items-center justify-center gap-1 px-2 py-1 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-1" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-2" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-3" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-4" />
                    <span className="w-1 rounded-full bg-emerald-400 animate-wave-2" />
                    <span className="w-1 rounded-full bg-emerald-400 animate-wave-1" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-3" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-4" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-1" />
                    <span className="w-1 rounded-full bg-emerald-400 animate-wave-3" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-2" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-4" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-1" />
                    <span className="w-1 rounded-full bg-[#5e6ad2] animate-wave-3" />
                  </div>

                  <div className="flex justify-between items-center mt-2 text-[10px] text-zinc-400 dark:text-[#6e6e84]">
                    <span>Pacing: 142 WPM</span>
                    <span>Latency: 110ms</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  Rubric-Based AI
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Start Session
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 3: 1V1 TECHNICAL ARENA (Race HUD) ── */}
        {showPractice && (
          <Link
            href="/arena"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Swords className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Realtime Socket Duel
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  1v1 Technical Arena
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Head-to-head live algorithmic duels with instant test runner execution and ELO ranking.
                </p>

                {/* Living Dual-Coder Battle HUD */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">YOU (1,842 ELO)</span>
                    <span className="text-zinc-400">VS</span>
                    <span className="text-zinc-500">KLU_DEV (1,810 ELO)</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9.5px] text-zinc-500 dark:text-[#6e6e84]">
                      <span>Test Cases: 3/3 Passed</span>
                      <span className="text-emerald-500 font-mono">0.18s</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-[#20202e] overflow-hidden">
                      <div className="w-full h-full rounded-full bg-emerald-500 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9.5px] text-zinc-500 dark:text-[#6e6e84]">
                      <span>Competitor: 2/3 Passed</span>
                      <span className="text-amber-400 font-mono">Running...</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-[#20202e] overflow-hidden">
                      <div className="w-2/3 h-full rounded-full bg-amber-500/80" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  +28 ELO Match Win
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Enter Arena
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 4: SYSTEM DESIGN STUDIO (Topology Canvas - 2 Cols) ── */}
        {showInterview && (
          <Link
            href="/system-design"
            className="group block lg:col-span-2 focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors flex items-center gap-2">
                        System Design Architecture Studio
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-normal">
                          Interactive Canvas
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                        Construct distributed topologies, simulate failovers, and receive automated rubric evaluations.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
                    High Scale
                  </span>
                </div>

                {/* Living Distributed Topology Canvas Visual */}
                <div className="mt-4 p-3.5 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26]">
                  <div className="flex items-center justify-between text-[10.5px] text-zinc-500 dark:text-[#6e6e84] mb-3 font-mono">
                    <span>TOPOLOGY: 120K QPS RESILIENT PIPELINE</span>
                    <span className="text-emerald-500">P99: 18.4ms · HEALTHY</span>
                  </div>

                  <div className="relative flex items-center justify-between gap-2 overflow-x-auto py-2">
                    <div className="shrink-0 px-3 py-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-center">
                      <div className="text-[9px] uppercase text-zinc-400">Source</div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef]">Client Web/App</div>
                    </div>

                    <div className="relative flex-1 h-[2px] bg-zinc-200 dark:bg-[#20202e] min-w-[32px] overflow-hidden">
                      <div className="absolute top-0 bottom-0 w-3 bg-[#5e6ad2] animate-packet" />
                    </div>

                    <div className="shrink-0 px-3 py-2 rounded bg-white dark:bg-[#14141e] border border-[#5e6ad2]/40 text-center shadow-subtle">
                      <div className="text-[9px] uppercase text-[#5e6ad2] font-semibold">Gateway</div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef]">Envoy Proxy</div>
                    </div>

                    <div className="relative flex-1 h-[2px] bg-zinc-200 dark:bg-[#20202e] min-w-[32px] overflow-hidden">
                      <div className="absolute top-0 bottom-0 w-3 bg-[#5e6ad2] animate-packet" style={{ animationDelay: "0.8s" }} />
                    </div>

                    <div className="shrink-0 px-3 py-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-center">
                      <div className="text-[9px] uppercase text-amber-500">In-Memory</div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef]">Redis Cluster</div>
                    </div>

                    <div className="relative flex-1 h-[2px] bg-zinc-200 dark:bg-[#20202e] min-w-[32px] overflow-hidden">
                      <div className="absolute top-0 bottom-0 w-3 bg-[#5e6ad2] animate-packet" style={{ animationDelay: "1.4s" }} />
                    </div>

                    <div className="shrink-0 px-3 py-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-center">
                      <div className="text-[9px] uppercase text-emerald-500">Storage</div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef]">PostgreSQL Replicas</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  Automated Failure Scenarios & Scalability Grading
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Launch Canvas
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 5: CLOUD CERTIFICATION HUB ── */}
        {showPractice && (
          <Link
            href="/certification"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    2,400+ Verified Dumps
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  Cloud Certification Engine
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Real exam simulators with verified question dumps for AWS, Azure, Salesforce, and MongoDB.
                </p>

                {/* Living Certification Progress Gauges */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-zinc-700 dark:text-[#ebebef] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      AWS SAA-C03
                    </span>
                    <span className="text-emerald-500 font-mono text-[10.5px]">88% Readiness</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-[#20202e] overflow-hidden">
                    <div className="w-[88%] h-full rounded-full bg-emerald-500" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-medium text-zinc-700 dark:text-[#ebebef] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Azure AZ-104
                    </span>
                    <span className="text-blue-400 font-mono text-[10.5px]">92% Readiness</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-[#20202e] overflow-hidden">
                    <div className="w-[92%] h-full rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  AWS • Azure • Salesforce • Mongo
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Practice Simulator
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 6: ATS KEYWORD OPTIMIZER ── */}
        {showCareer && (
          <Link
            href="/ats-optimizer"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    JD Match Engine
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  ATS Keyword Optimizer
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Deep technical evaluation of resume match against Amazon, Oracle, and Google JDs.
                </p>

                {/* Living Match Dial & Tags */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26]">
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                    <span className="text-zinc-600 dark:text-[#8b8b9e]">TARGET: AMAZON SDE-1</span>
                    <span className="text-emerald-500 font-bold">88/100 MATCH</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Distributed Systems
                    </span>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Docker
                    </span>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      ! Kafka (+4)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  Keyword Match & Roaster
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Scan Resume
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 7: PDF QUIZ GENERATOR (RAG Document Ingestion) ── */}
        {showPractice && (
          <Link
            href="/upload"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    RAG Vector Parser
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  PDF Quiz Generator
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Synthesize verified mock questions instantly from academic PDFs or course slides.
                </p>

                {/* Living Document Ingestion Visual */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                    <span className="flex items-center gap-1 text-zinc-800 dark:text-[#ebebef] truncate">
                      <FileCode className="w-3 h-3 text-[#5e6ad2]" />
                      CS401_Distributed.pdf
                    </span>
                    <span className="text-emerald-500 shrink-0">100% Parsed</span>
                  </div>

                  {/* Generated Question Teaser */}
                  <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-[10.5px]">
                    <div className="text-zinc-400 dark:text-[#6e6e84] text-[9.5px]">Generated Rubric Question:</div>
                    <div className="text-zinc-800 dark:text-[#ebebef] font-medium mt-0.5 truncate">
                      Q: Raft election timeout vs heartbeat frequency?
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  RAG Document Vector Parser
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Upload PDF
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 8: PROJECT SANDBOX MODE (In-Browser IDE) ── */}
        {showInterview && (
          <Link
            href="/project-mode"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    In-Browser IDE
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  Project Sandbox Mode
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Debug multi-file production bugs with automated in-browser terminal tests.
                </p>

                {/* Living IDE Code Tabs & Vitest Terminal Visual */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-[#1a1a26] pb-1.5 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] border border-zinc-200 dark:border-[#1e1e2a]">
                      server.ts
                    </span>
                    <span className="text-zinc-400 dark:text-[#6e6e84]">auth.test.ts</span>
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] font-mono text-[10px] text-zinc-600 dark:text-[#a0a0b8] leading-tight">
                    <div>expect(jwt.verify(token)).toBe(true);</div>
                    <div className="text-emerald-500 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> 8/8 Tests Passed (118ms)
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  Multi-File Sandpack Sandbox
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Open Sandbox
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 9: RESUME DIAGNOSTIC ROASTER (AI Critique) ── */}
        {showCareer && (
          <Link
            href="/resume-roaster"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    Spicy Diagnostic 🔥
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  Resume Diagnostic Roaster
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Constructive AI critique of formatting flaws, weak action verbs, and impact deficits.
                </p>

                {/* Living Roast Visual */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-1.5">
                  <div className="text-[10px] font-mono text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>WEAK PHRASING FLAGGED:</span>
                  </div>
                  <div className="p-1.5 rounded bg-red-500/5 border border-red-500/15 text-[10px] text-zinc-600 dark:text-[#a0a0b8] line-through">
                    &quot;Helped team build features and fixed bugs&quot;
                  </div>
                  <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    &quot;Architected high-throughput Kafka ingestion pipeline (+34% speed)&quot;
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  +18 Action Verb Strength
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Roast Resume
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 10: STRUCTURED RESUME BUILDER (LaTeX ATS) ── */}
        {showCareer && (
          <Link
            href="/resume-builder"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    LaTeX Engine
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  Structured Resume Builder
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Compile an ATS-compliant LaTeX/PDF engineering resume with verified metric enhancements.
                </p>

                {/* Living Dual-Pane LaTeX / PDF Preview Visual */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>TEMPLATE: HARVARD SDE</span>
                    <span className="text-emerald-500">100% ATS SCORE</span>
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-[10px] space-y-1 font-mono">
                    <div className="text-zinc-800 dark:text-[#ebebef] font-semibold border-b border-zinc-100 dark:border-[#1a1a26] pb-0.5">
                      KL UNIVERSITY • B.TECH CSE (9.2 CGPA)
                    </div>
                    <div className="text-zinc-500 dark:text-[#8b8b9e] text-[9.5px]">
                      EXPERIENCE: Distributed Cache Architecture
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  Instant Vector PDF Export
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Build Resume
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 11: SKILL GAP & CAREER PATH (Milestone Tree) ── */}
        {showCareer && (
          <Link
            href="/career-path"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Milestone Tree
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3">
                  Skill Gap & Career Path
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Milestone roadmap mapping missing competencies to campus placement eligibility.
                </p>

                {/* Living Milestone Progress Dependency Visual */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">TARGET: DAY-1 SDE</span>
                    <span className="text-[#5e6ad2] font-semibold">84% READY</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9.5px]">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      DSA: 150 Solved ✓
                    </span>
                    <span className="text-zinc-400">→</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
                      SysDesign 68%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  Curriculum Competency Graph
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  View Roadmap
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

        {/* ── CARD 12: PORTNOVA SHOWCASE (Recruiter Portfolio) ── */}
        {showCareer && (
          <Link
            href="https://portnova.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] rounded-lg"
          >
            <SpotlightCard>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2] group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Instant Deployment
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors mt-3 flex items-center gap-1.5">
                  Portnova Showcase
                  <span className="text-[10px] font-mono text-zinc-400">↗</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                  Generate a high-performance web portfolio for engineering recruiting showcase in one click.
                </p>

                {/* Living Web Portfolio Chrome Visual */}
                <div className="mt-4 p-3 rounded-[6px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="ml-1 text-zinc-600 dark:text-[#a0a0b8]">alex-dev.portnova.app</span>
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between text-[10px]">
                    <span className="text-zinc-800 dark:text-[#ebebef] font-medium">12 Projects Synced</span>
                    <span className="text-emerald-500 font-mono">100 Lighthouse</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400 dark:text-[#6e6e84] text-[10.5px]">
                  1-Click Vercel Deploy
                </span>
                <span className="text-zinc-500 dark:text-[#8b8b9e] group-hover:text-[#5e6ad2] dark:group-hover:text-[#ebebef] group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-medium">
                  Generate Portfolio
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </SpotlightCard>
          </Link>
        )}

      </div>
    </section>
  );
}
