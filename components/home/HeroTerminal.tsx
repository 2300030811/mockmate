"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, RotateCcw, CheckCircle2, Mic, Building2, Terminal, Cpu } from "lucide-react";

interface InterviewSim {
  role: string;
  question: string;
  answerSnippet: string;
  score: number;
  tags: string[];
}

const INTERVIEW_SIMS: InterviewSim[] = [
  {
    role: "Senior Distributed Systems SDE",
    question: "How do you prevent cache thundering herd during a major service failover?",
    answerSnippet: "Implement probabilistic early expiration (XFetch) combined with single-flight mutex locks on cache misses.",
    score: 96,
    tags: ["Distributed Caching", "99th Percentile", "Resilience"],
  },
  {
    role: "Cloud Infrastructure Architect (AWS)",
    question: "Design multi-region active-active VPC peering with sub-50ms failover.",
    answerSnippet: "Route 53 latency-based routing with health checks, Global Accelerator, and DynamoDB Global Tables.",
    score: 98,
    tags: ["Route53", "Global Accelerator", "Disaster Recovery"],
  },
  {
    role: "KLU Campus Day-1 SDE Assessment",
    question: "Optimize median calculation over an unindexed continuous streaming window.",
    answerSnippet: "Maintain dual heaps (max-heap for lower half, min-heap for upper half) with O(log k) amortized rebalance.",
    score: 94,
    tags: ["Dual Heaps", "O(log k)", "Algorithm Precision"],
  },
];

export function HeroTerminal() {
  const [activeTab, setActiveTab] = useState<"interview" | "radar" | "sandbox">("interview");
  const [simIndex, setSimIndex] = useState(0);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testsPassed, setTestsPassed] = useState(true);

  const currentSim = INTERVIEW_SIMS[simIndex];

  const handleNextSimulation = () => {
    setSimIndex((prev) => (prev + 1) % INTERVIEW_SIMS.length);
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
      setTestsPassed(true);
    }, 700);
  };

  return (
    <div className="relative group/terminal text-left">
      {/* Refined Ambient Stage Illumination (Soft, luxury depth — not cheap blur balls) */}
      <div
        className="absolute -inset-1 rounded-xl opacity-60 dark:opacity-40 blur-xl pointer-events-none transition-opacity duration-500 group-hover/terminal:opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(94, 106, 210, 0.25) 0%, rgba(94, 106, 210, 0.05) 50%, transparent 80%)",
        }}
      />

      {/* Double-Bezel Hardware Container (Outer Shell) */}
      <div className="relative rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-100/90 dark:bg-[#101017] p-1.5 shadow-surface dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        {/* Inner Hardware Core */}
        <div className="rounded-[9px] border border-zinc-200 dark:border-[#1a1a24] bg-white dark:bg-[#14141e] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {/* Hardware Top Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200 dark:border-[#1c1c28] bg-zinc-50 dark:bg-[#0e0e14]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] ml-1">
                mockmate_engine.sim
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
              <span>LIVE TELEMETRY</span>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center border-b border-zinc-200 dark:border-[#1c1c28] bg-zinc-50/50 dark:bg-[#101017] px-2 pt-1 gap-1">
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-t-[6px] font-medium transition-colors ${
                activeTab === "interview"
                  ? "bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] border-t border-x border-zinc-200 dark:border-[#1c1c28]"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              <Mic className="w-3 h-3 text-[#5e6ad2]" />
              <span>Voice Interview Sim</span>
            </button>

            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-t-[6px] font-medium transition-colors ${
                activeTab === "radar"
                  ? "bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] border-t border-x border-zinc-200 dark:border-[#1c1c28]"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              <Building2 className="w-3 h-3 text-emerald-500" />
              <span>KLU Drive Radar</span>
            </button>

            <button
              onClick={() => setActiveTab("sandbox")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-t-[6px] font-medium transition-colors ${
                activeTab === "sandbox"
                  ? "bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] border-t border-x border-zinc-200 dark:border-[#1c1c28]"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              <Terminal className="w-3 h-3 text-amber-500" />
              <span>Code Sandbox</span>
            </button>
          </div>

          {/* Interactive Screen Body */}
          <div className="p-4 space-y-3 min-h-[220px]">
            {activeTab === "interview" && (
              <div className="space-y-3 animate-fadeIn">
                {/* Simulation Header */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">
                    Track: {currentSim.role}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Live Waveform Indicator */}
                    <div className="flex items-center gap-[2px] h-4 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#1e1e2a]">
                      <span className="w-[2px] bg-[#5e6ad2] rounded-full animate-wave-1" />
                      <span className="w-[2px] bg-[#5e6ad2] rounded-full animate-wave-2" />
                      <span className="w-[2px] bg-[#5e6ad2] rounded-full animate-wave-3" />
                      <span className="w-[2px] bg-[#5e6ad2] rounded-full animate-wave-4" />
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-[#8b8b9e] font-mono">
                      Vocal Analysis Active
                    </span>
                  </div>
                </div>

                {/* AI Interviewer Question Box */}
                <div className="p-3 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#11111a] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5e6ad2] uppercase tracking-wider">
                    <span>AI Interviewer (Bob Engine)</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-900 dark:text-[#ebebef] leading-snug">
                    &ldquo;{currentSim.question}&rdquo;
                  </p>
                </div>

                {/* Candidate Response & Evaluation */}
                <div className="space-y-2">
                  <div className="text-[11.5px] text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">
                      Candidate:
                    </span>
                    {currentSim.answerSnippet}
                  </div>

                  {/* Rubric Rating Pill */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-[#1c1c28] text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-[#5a5a6e]">
                        Rubric Score:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono t">
                        {currentSim.score}/100 [High Hire Confidence]
                      </span>
                    </div>

                    <button
                      onClick={handleNextSimulation}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5e6ad2] hover:text-[#4f5ac4] transition-colors"
                      title="Next Question Simulation"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Next Case</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "radar" && (
              <div className="space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 dark:text-[#8b8b9e] font-medium">
                    KLU Campus Placement Feed (Day-1 Schedule)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Live Verified
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#11111a] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                        Amazon AWS India
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                        Role: Cloud Support Engineer / SDE-I
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono t">
                        44.0 LPA
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-[#5a5a6e]">
                        Eligible: 8.5+ CGPA
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#11111a] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                        Oracle Cloud Infrastructure
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                        Role: Member Technical Staff
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono t">
                        28.5 LPA
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-[#5a5a6e]">
                        Slot: Day 1 Session
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 dark:text-[#5a5a6e]">
                    10-year historical compensation records
                  </span>
                  <Link
                    href="/placements"
                    className="font-semibold text-[#5e6ad2] hover:underline"
                  >
                    View Radar Hub →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "sandbox" && (
              <div className="space-y-2.5 animate-fadeIn font-mono text-[11.5px]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-[#8b8b9e]">
                  <span>{"// Sub-200ms In-Browser Test Runner"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10.5px]">
                    V8 JIT Isolated
                  </span>
                </div>

                <div className="p-2.5 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-900 text-zinc-200 space-y-1 text-xs">
                  <div className="text-zinc-400">
                    <span className="text-[#5e6ad2]">it</span>(&quot;validates token bucket rate limit&quot;, () =&gt; &#123;
                  </div>
                  <div className="pl-4 text-emerald-400">
                    expect(bucket.consume(1)).toBe(true); <span className="text-zinc-500">{"// 0.3ms"}</span>
                  </div>
                  <div className="pl-4 text-emerald-400">
                    expect(bucket.isThrottled()).toBe(false);
                  </div>
                  <div className="text-zinc-400">&#125;);</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>2/2 Test Specs Verified Passing</span>
                  </div>

                  <button
                    onClick={handleRunTests}
                    disabled={isRunningTests}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
                  >
                    {isRunningTests ? (
                      <span>Executing...</span>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Test Suite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Bottom Control Bar */}
          <div className="px-3.5 py-2 border-t border-zinc-200 dark:border-[#1c1c28] bg-zinc-50/70 dark:bg-[#0e0e14] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-[#8b8b9e]">
              <Cpu className="w-3 h-3 text-[#5e6ad2]" />
              <span>Evaluation Latency: 38ms</span>
            </div>

            <Link
              href="/demo"
              className="inline-flex items-center gap-1 font-semibold text-[#5e6ad2] hover:text-[#4f5ac4] transition-colors"
            >
              <span>Full Screen Simulator</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
