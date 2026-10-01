"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Target,
  Sparkles,
  AlertCircle,
  Brain,
  ShieldCheck,
  Terminal,
  Cpu,
  GitBranch,
  Rocket,
  Building2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  FileText,
  Zap,
  Github,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { HomeBackground } from "@/components/home/HomeBackground";
import { ResumeUpload } from "@/components/career-path/ResumeUpload";
import { JobInput } from "@/components/career-path/JobInput";
import { DeepEvalResult } from "@/types/deep-eval";
import { analyzeDeepEvalAction } from "@/app/actions/deep-eval";
import { DeepEvalDashboard } from "@/components/career-path/DeepEvalDashboard";

const LOADING_MESSAGES = [
  "Parsing resume structure and AST text nodes...",
  "Querying public GitHub profile & commit frequency...",
  "Evaluating production experience & metric formulas...",
  "Scoring open source contributions & repository impact...",
  "Assessing project complexity & architectural scale...",
  "Matching keywords against target job taxonomy...",
  "Calculating bonus points & rubric deductions...",
  "Consolidating 120-point hiring agent report...",
];

const AUDIT_PHASES = [
  { label: "Semantic AST Document Extraction", phase: "Structure" },
  { label: "Technology & Framework Keyword Mapping", phase: "Taxonomy" },
  { label: "GitHub Profile & Public Telemetry Sync", phase: "Telemetry" },
  { label: "Production & Impact Metric Verification", phase: "Experience" },
  { label: "Algorithmic Deduction & Penalty Guardrails", phase: "Integrity" },
  { label: "120-Point Hiring Agent Score Synthesis", phase: "Scoring" },
];

export default function AtsOptimizerPage() {
  const [step, setStep] = useState<"upload" | "analyzing" | "results">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [result, setResult] = useState<DeepEvalResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [activeRadarTab, setActiveRadarTab] = useState<"rubric" | "guardrails" | "benchmarks">("rubric");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === "analyzing") {
      interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleLoadSampleResume = () => {
    const sampleContent = `Alex Chen
Senior Full-Stack & Systems Engineer
Email: alex.chen@example.com | GitHub: github.com/alexchen-dev | LinkedIn: linkedin.com/in/alexchen

SUMMARY
Senior Software Engineer with 5+ years of production experience designing distributed microservices, event-driven pipelines, and high-performance React frontends. Reduced p99 latency by 42% and scaled services to handle 10M+ daily events.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | CloudScale Distributed Systems (2022 - Present)
- Architected real-time streaming pipeline using Apache Kafka, Go, and PostgreSQL processing 14,000 events/second.
- Spearheaded company-wide migration from REST to gRPC and GraphQL, decreasing server payload sizes by 38%.
- Designed multi-region Kubernetes deployments on AWS with 99.99% uptime SLA.
- Mentored 6 software engineers and authored engineering RFCs for multi-tenant database partitioning.

Software Engineer | FinFlow Payment Technologies (2020 - 2022)
- Built high-throughput transaction ledger handling $60M quarterly volume with zero data inconsistencies.
- Automated CI/CD deployment pipelines using GitHub Actions, Docker, and Kubernetes (EKS).
- Optimized Redis caching layer, decreasing database query volume by 65%.

TECHNICAL PROJECTS
HyperKV - Distributed In-Memory Key-Value Store (Rust, Raft Consensus)
- Implemented Raft consensus protocol from scratch in Rust with custom WAL (Write-Ahead Logging).
- Achieved 150,000 QPS with under 1.2ms average latency in benchmark clusters.

DevPulse - Open Source Developer Telemetry CLI (Go, SQLite)
- Created open-source CLI tool with 850+ GitHub stars adopted by 12 engineering teams.

TECHNICAL SKILLS
Languages: TypeScript, Go, Rust, Python, SQL, C++
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS, gRPC
Databases & Cloud: PostgreSQL, Redis, Apache Kafka, AWS (ECS, S3, RDS, DynamoDB), Docker, Kubernetes
Practices: System Design, CI/CD, Distributed Systems, TDD, Agile
`;
    const sampleBlob = new Blob([sampleContent], { type: "application/pdf" });
    const sampleFile = new File([sampleBlob], "alex_chen_senior_fullstack_resume.pdf", {
      type: "application/pdf",
    });
    handleUpload(sampleFile);
  };

  const handleAnalyze = async (role: string, comp: string, jobDescription?: string) => {
    if (!file) return;

    setJobRole(role);
    setCompany(comp);
    setIsAnalyzing(true);
    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await analyzeDeepEvalAction(
        formData,
        role,
        comp,
        jobDescription
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Analysis failed. Please try again.");
      }

      setResult(response.data);
      setStep("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze resume.");
      setStep("upload");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setJobRole("");
    setCompany("");
    setStep("upload");
    setError(null);
    setLoadingIndex(0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 selection:bg-[#5e6ad2]/20 transition-colors relative">
      <HomeBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-[#6e6e84]">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/career-path" className="hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors">
            Career Path
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-[#ebebef] font-semibold">
            {step === "results" ? "Evaluation Report" : "ATS Optimizer"}
          </span>
        </div>

        {/* ── 1. HIGH-PRECISION HERO HEADER (Only shown on upload state) ── */}
        {step === "upload" && (
          <div className="w-full text-left space-y-4">
            {/* Precision Status Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 dark:bg-emerald-400/80 animate-pulse" />
              <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">
                MockMate Hiring-Agent Evaluator
              </span>
              <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
              <span>Enterprise Rubric Radar v2.6</span>
            </div>

            {/* Main Display Headline (Solid high-contrast foreground, matching homepage) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-zinc-900 dark:text-[#ebebef] leading-[1.08] max-w-3xl">
              ATS Resume Score Optimizer & Telemetry Engine.
            </h1>

            {/* Disciplined Subheading */}
            <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed max-w-2xl font-normal">
              Score your resume against the exact algorithmic filters and hiring-agent rubrics used by tier-1 tech companies. Deep scoring across production engineering, open-source telemetry, system design complexity, and keyword density.
            </p>

            {/* Telemetry Proof Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500 dark:text-[#5a5a6e]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>Algorithmic ATS Parsing</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
                <span>GitHub Telemetry Verification</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>Role & JD Alignment Check</span>
              </div>
              <span>•</span>
              <span>120-Point Multi-Dimensional Rubric</span>
            </div>
          </div>
        )}

        {/* ── 2. MAIN WORKSPACE STATES ── */}
        <AnimatePresence mode="wait">
          {/* ── STATE 1: UPLOAD & CONFIGURATION CONSOLE (2-Column Architecture) ── */}
          {step === "upload" && (
            <m.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column (7 cols): Ingestion Console Card */}
              <div className="lg:col-span-7 space-y-4">
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-600 dark:text-rose-400 flex items-center gap-3 text-xs font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Double-Bezel Hardware Container (Outer Shell) */}
                <div className="relative rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-100/90 dark:bg-[#101017] p-1.5 shadow-surface dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                  {/* Inner Hardware Core */}
                  <div className="rounded-[9px] border border-zinc-200 dark:border-[#1a1a24] bg-white dark:bg-[#14141e] p-5 sm:p-6 space-y-5">
                    {/* Hardware Header Bar */}
                    <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1c1c28] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] ml-1">
                          ats_ingestion_console.sh
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleLoadSampleResume}
                          className="text-[11px] font-mono text-[#5e6ad2] hover:text-[#4f5ac4] dark:hover:text-[#7d88e8] underline transition-colors cursor-pointer"
                        >
                          Try Sample SDE Resume
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
                          <span>READY</span>
                        </div>
                      </div>
                    </div>

                    {/* Resume Upload Dropzone */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-[#8b8b9e]">
                          1. Select or Drop Resume PDF
                        </label>
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84]">
                          Standard ATS Parser Compatible
                        </span>
                      </div>

                      <ResumeUpload onUpload={handleUpload} onRemove={handleRemoveFile} />
                    </div>

                    {/* Job Input Section (Reveals or activates when file is ready) */}
                    <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-[#1c1c28]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-[#8b8b9e]">
                          2. Target Role & Hiring Specification
                        </label>
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84]">
                          {file ? "File Attached" : "Awaiting File Upload"}
                        </span>
                      </div>

                      <JobInput
                        onAnalyze={(role: string, company: string, jd?: string) => {
                          handleAnalyze(role, company, jd);
                        }}
                        isLoading={isAnalyzing}
                        hasFile={!!file}
                        buttonText="RUN ATS EVALUATION & SCORING"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): ATS Radar & Benchmark Terminal */}
              <div className="lg:col-span-5 space-y-4">
                {/* Double-Bezel Hardware Container (Outer Shell) */}
                <div className="relative rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-100/90 dark:bg-[#101017] p-1.5 shadow-surface dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                  {/* Inner Hardware Core */}
                  <div className="rounded-[9px] border border-zinc-200 dark:border-[#1a1a24] bg-white dark:bg-[#14141e] overflow-hidden">
                    {/* Hardware Top Bar */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200 dark:border-[#1c1c28] bg-zinc-50 dark:bg-[#0e0e14]">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] ml-1">
                          ats_radar_telemetry.sys
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
                        <span>LIVE BENCHMARKS</span>
                      </div>
                    </div>

                    {/* Interactive Segmented Tabs */}
                    <div className="flex items-center border-b border-zinc-200 dark:border-[#1c1c28] bg-zinc-50/50 dark:bg-[#101017] px-2 pt-1 gap-1">
                      <button
                        onClick={() => setActiveRadarTab("rubric")}
                        className={`px-3 py-1.5 text-[11px] rounded-t-[6px] font-medium transition-colors ${
                          activeRadarTab === "rubric"
                            ? "bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] border-t border-x border-zinc-200 dark:border-[#1c1c28]"
                            : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                        }`}
                      >
                        Rubric (120 Pts)
                      </button>
                      <button
                        onClick={() => setActiveRadarTab("guardrails")}
                        className={`px-3 py-1.5 text-[11px] rounded-t-[6px] font-medium transition-colors ${
                          activeRadarTab === "guardrails"
                            ? "bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] border-t border-x border-zinc-200 dark:border-[#1c1c28]"
                            : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                        }`}
                      >
                        ATS Red Flags
                      </button>
                      <button
                        onClick={() => setActiveRadarTab("benchmarks")}
                        className={`px-3 py-1.5 text-[11px] rounded-t-[6px] font-medium transition-colors ${
                          activeRadarTab === "benchmarks"
                            ? "bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] border-t border-x border-zinc-200 dark:border-[#1c1c28]"
                            : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                        }`}
                      >
                        Campus CTC Cutoffs
                      </button>
                    </div>

                    {/* Tab Body */}
                    <div className="p-4 sm:p-5 text-left">
                      {activeRadarTab === "rubric" && (
                        <div className="space-y-3.5">
                          <p className="text-xs text-zinc-600 dark:text-[#8b8b9e]">
                            The hiring agent evaluates candidates across four calibrated categories:
                          </p>

                          <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GitBranch size={14} className="text-emerald-500" />
                                <div>
                                  <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                                    Open Source Telemetry
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84]">
                                    PRs, popular repos, external contributions
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                35 Pts
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Rocket size={14} className="text-[#5e6ad2]" />
                                <div>
                                  <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                                    Self Projects Complexity
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84]">
                                    Distributed systems, deployment, architecture
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#5e6ad2] dark:text-[#7d88e8]">
                                30 Pts
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Building2 size={14} className="text-purple-500" />
                                <div>
                                  <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                                    Production Experience
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84]">
                                    Work impact, quantified metrics, scale
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                                25 Pts
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Cpu size={14} className="text-amber-500" />
                                <div>
                                  <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                                    Technical Stack Depth
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84]">
                                    Core languages, DBs, cloud infra breadth
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                                10 Pts
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] p-2 rounded bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] font-mono">
                            <span className="text-zinc-500 dark:text-[#8b8b9e]">
                              Bonus Cap: +20 pts
                            </span>
                            <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
                            <span className="text-zinc-500 dark:text-[#8b8b9e]">
                              Deduction Guardrails: -15 pts
                            </span>
                          </div>
                        </div>
                      )}

                      {activeRadarTab === "guardrails" && (
                        <div className="space-y-3">
                          <p className="text-xs text-zinc-600 dark:text-[#8b8b9e]">
                            Top algorithmic rejection traps flagged by enterprise filters:
                          </p>

                          <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs">
                              <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle size={13} />
                                Multi-Column Tables
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-[#8b8b9e] mt-0.5">
                                Two-column text blocks scramble chronological parser ordering.
                              </p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs">
                              <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle size={13} />
                                Unquantified Bullet Points
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-[#8b8b9e] mt-0.5">
                                Bullets without numerical metrics (%, $, ms, QPS) lose 40% credibility.
                              </p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs">
                              <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle size={13} />
                                Missing Keyword Synonyms
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-[#8b8b9e] mt-0.5">
                                If the JD asks for &apos;Kubernetes&apos;, writing only &apos;Containers&apos; fails vector similarity.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeRadarTab === "benchmarks" && (
                        <div className="space-y-3">
                          <p className="text-xs text-zinc-600 dark:text-[#8b8b9e]">
                            Historical minimum ATS scores required for Day-1 Campus Drives:
                          </p>

                          <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                                  Amazon SDE-1 / Super Dream
                                </div>
                                <div className="text-[10px] text-emerald-500">₹44.14 LPA Tier</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  85+ ATS Score
                                </div>
                                <div className="text-[9.5px] text-zinc-400">95th Percentile</div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                                  ServiceNow / Core Product
                                </div>
                                <div className="text-[10px] text-emerald-500">₹32.00 LPA Tier</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-mono font-bold text-[#5e6ad2]">
                                  80+ ATS Score
                                </div>
                                <div className="text-[9.5px] text-zinc-400">88th Percentile</div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                                  JPMorgan Chase / FinTech
                                </div>
                                <div className="text-[10px] text-indigo-400">₹24.00 LPA Tier</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-mono font-bold text-indigo-500">
                                  75+ ATS Score
                                </div>
                                <div className="text-[9.5px] text-zinc-400">80th Percentile</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          )}

          {/* ── STATE 2: ANALYZING (Precision Hardware Terminal Simulation) ── */}
          {step === "analyzing" && (
            <m.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-3xl mx-auto py-8"
            >
              {/* Double-Bezel Hardware Container */}
              <div className="relative rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-100/90 dark:bg-[#101017] p-1.5 shadow-surface dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                <div className="rounded-[9px] border border-zinc-200 dark:border-[#1a1a24] bg-white dark:bg-[#14141e] overflow-hidden">
                  {/* Hardware Header Bar */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#1c1c28] bg-zinc-50 dark:bg-[#0e0e14]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] ml-1">
                        mockmate_ats_engine.eval
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
                      <span>EVALUATION IN PROGRESS</span>
                    </div>
                  </div>

                  {/* Terminal Core Content */}
                  <div className="p-6 sm:p-8 space-y-6 text-left">
                    {/* Simulated Radar Scanner */}
                    <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1c1c28] pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[#5e6ad2] animate-spin" />
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef]">
                            Hiring-Agent Evaluation Telemetry
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
                          Running algorithmic rubric cross-reference against 150+ technology checkpoints
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#5e6ad2]">
                          PHASE {Math.min(loadingIndex + 1, 8)} / 8
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                        <span>Diagnostic Sequence</span>
                        <span>{Math.round(((loadingIndex + 1) / LOADING_MESSAGES.length) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-[#1e1e2a] rounded-full overflow-hidden">
                        <m.div
                          animate={{ width: `${((loadingIndex + 1) / LOADING_MESSAGES.length) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-[#5e6ad2] rounded-full"
                        />
                      </div>
                    </div>

                    {/* Active Checklist Log Stream */}
                    <div className="space-y-2 pt-2">
                      {AUDIT_PHASES.map((phase, idx) => {
                        const isDone = idx < loadingIndex;
                        const isCurrent = idx === loadingIndex;

                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-colors ${
                              isDone
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : isCurrent
                                ? "bg-[#5e6ad2]/5 border-[#5e6ad2]/30 text-zinc-900 dark:text-[#ebebef]"
                                : "bg-transparent border-transparent text-zinc-400 dark:text-[#5a5a6e]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isDone ? (
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              ) : isCurrent ? (
                                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#5e6ad2] border-t-transparent animate-spin shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2a2a38] shrink-0" />
                              )}
                              <span>{phase.label}</span>
                            </div>
                            <span className="text-[10px] uppercase opacity-70">
                              {isDone ? "PASS" : isCurrent ? "SCANNING" : "QUEUED"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Current Action Banner */}
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200 dark:border-[#1a1a26] text-xs font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
                      <span className="text-zinc-500 dark:text-[#8b8b9e]">EXEC:</span>
                      <span className="text-[#5e6ad2] dark:text-[#7d88e8]">
                        {LOADING_MESSAGES[loadingIndex]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          )}

          {/* ── STATE 3: RESULTS (Executive Report View) ── */}
          {step === "results" && result && (
            <m.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Executive Report Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-[#1e1e2a] pb-5">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                      Evaluation Report
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                      Enterprise Rubric v2.6
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-zinc-900 dark:text-[#ebebef]">
                    Hiring-Agent Evaluation & Benchmark Report
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-[#8b8b9e]">
                    <span>File: <strong className="font-medium text-zinc-800 dark:text-[#ebebef]">{file?.name || "Uploaded Resume"}</strong></span>
                    <span>•</span>
                    <span>Target: <strong className="font-medium text-zinc-800 dark:text-[#ebebef]">{jobRole || "Full Stack Engineer"}{company ? ` @ ${company}` : ""}</strong></span>
                    {result.hasGitHubData && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 font-medium">
                          <Github size={12} /> GitHub Profile Synced
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:bg-zinc-50 dark:hover:bg-[#1a1a26] text-zinc-700 dark:text-[#ebebef] text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Upload New Resume</span>
                  </button>
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white text-xs font-semibold transition-all shadow-md shadow-[#5e6ad2]/20 shrink-0"
                  >
                    <Sparkles size={13} />
                    <span>Tailor in AI Builder</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* DeepEval Results Dashboard */}
              <DeepEvalDashboard data={result} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
