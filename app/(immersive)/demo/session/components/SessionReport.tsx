"use client";

import { useState, memo, useMemo } from "react";
import { m } from "framer-motion";
import { 
    Award, 
    TrendingUp, 
    MessageSquare, 
    Target,
    Activity,
    BrainCircuit,
    Download,
    Share2,
    Home,
    Check,
    FileText,
    BarChart3,
    AlertTriangle,
    Timer,
    Sparkles,
    Lightbulb,
    ArrowRight,
    RotateCcw,
    History,
    Zap,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { InterviewAnalytics } from "./SessionInsights";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

interface SessionReportProps {
    stats: InterviewAnalytics;
    transcript: string;
    aiSummary?: string | null;
    durationSeconds?: number;
    type?: string;
    difficulty?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function getVerdict(score: number) {
    if (score >= 85) return { label: "Exceptional", color: "text-emerald-500", ring: "stroke-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 70) return { label: "Strong Candidate", color: "text-emerald-600 dark:text-emerald-400", ring: "stroke-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 55) return { label: "Promising", color: "text-[#5e6ad2]", ring: "stroke-[#5e6ad2]", bg: "bg-[#5e6ad2]/10 border-[#5e6ad2]/20" };
    if (score >= 40) return { label: "Developing", color: "text-amber-500", ring: "stroke-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };
    return { label: "Needs Practice", color: "text-rose-500", ring: "stroke-rose-500", bg: "bg-rose-500/10 border-rose-500/20" };
}

function getVerdictDescription(stats: InterviewAnalytics) {
    const parts: string[] = [];
    if (stats.wpm >= 90 && stats.wpm <= 150) parts.push("Your speaking pace was well-calibrated for professional communication.");
    else if (stats.wpm > 150) parts.push("You spoke quite quickly — consider slowing down to let key architectural points land.");
    else parts.push("Your speaking pace was on the slower side. Practicing aloud will build conversational rhythm.");

    if (stats.answerDepth === "detailed") parts.push("Your answers showed impressive depth with specific examples and thorough explanations.");
    else if (stats.answerDepth === "moderate") parts.push("Your answers had reasonable depth but would benefit from more concrete real-world context.");
    else parts.push("Many responses were brief — expanding answers with concrete architectural examples strengthens performance.");

    if (stats.keyConcepts.length > 6) parts.push(`You demonstrated strong technical breadth, covering ${stats.keyConcepts.length} distinct concepts.`);
    else if (stats.keyConcepts.length > 2) parts.push("You touched upon relevant technical topics. Try introducing specific tools, protocols, and tradeoffs.");

    if (stats.starMethodCount > 0) parts.push(`You used structured STAR responses ${stats.starMethodCount} time${stats.starMethodCount > 1 ? "s" : ""}, showing organized problem solving.`);
    if (stats.fillerWordsPerMinute > 4) parts.push("Higher filler word frequency detected — replacing 'um' with silent pauses projects confidence.");
    return parts.join(" ");
}

function getImprovementTips(stats: InterviewAnalytics): string[] {
    const tips: string[] = [];
    if (stats.answerDepth === "shallow") tips.push("Aim for 3-5 sentence answers minimum. Lead with the core conclusion, then provide rationale.");
    if (stats.fillerWordsPerMinute > 3) tips.push("Replace filler words with deliberate pauses. Silence signals composure and command of the subject.");
    if (stats.starMethodCount === 0) tips.push("Structure behavioral scenarios with STAR: Situation → Task → Action → Measurable Result.");
    if (stats.keyConcepts.length < 5) tips.push("Explicitly name concrete algorithms, frameworks, and architectural patterns relevant to your target stack.");
    if (stats.vocabularyRichness < 35) tips.push("Diversify technical vocabulary — avoid repetitive phrases and explain edge-case constraints.");
    if (stats.wpm > 160) tips.push("Throttle speaking pace to 120-140 WPM. Controlled pacing allows interviewers to digest complex solutions.");
    if (stats.wpm < 80) tips.push("Practice fluid verbalization aloud with timed prompts to develop confident speaking flow.");
    if (tips.length === 0) tips.push("Continue incorporating quantifiable business and performance metrics into your architectural reasoning.");
    return tips.slice(0, 4);
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

export const SessionReport = memo(function SessionReport({ 
    stats, 
    transcript, 
    aiSummary, 
    durationSeconds,
    type = "technical",
    difficulty = "mid"
}: SessionReportProps) {
    const [copied, setCopied] = useState(false);
    const verdict = useMemo(() => getVerdict(stats.confidenceScore), [stats.confidenceScore]);
    const verdictDescription = useMemo(() => getVerdictDescription(stats), [stats]);
    const improvementTips = useMemo(() => getImprovementTips(stats), [stats]);

    const downloadReport = () => {
        const content = [
            `# MockMate Interview Telemetry Report`,
            `**Date:** ${new Date().toLocaleDateString()}`,
            `**Track:** ${type.toUpperCase()} // Difficulty: ${difficulty.toUpperCase()}`,
            durationSeconds ? `**Duration:** ${formatDuration(durationSeconds)}` : "",
            `**Overall Score:** ${stats.confidenceScore}% (${verdict.label})`,
            `**Technical Signal:** ${stats.technicalAccuracy}%`,
            `**Speaking Pace:** ${stats.wpm} WPM`,
            `**Tone / Sentiment:** ${stats.sentiment}`,
            `**Answer Depth:** ${stats.answerDepth}`,
            `**Filler Words:** ${stats.fillerWordCount} total (${stats.fillerWordsPerMinute}/min)`,
            `**STAR Responses:** ${stats.starMethodCount}`,
            `**Vocabulary Variety:** ${stats.vocabularyRichness}%`,
            `**Key Concepts Covered:** ${stats.keyConcepts.join(", ") || "None recorded"}\n`,
            `---\n`,
            `## Performance Diagnostics\n`,
            verdictDescription + "\n",
            `## Targeted Growth Areas\n`,
            ...improvementTips.map((t, i) => `${i + 1}. ${t}`),
            aiSummary ? `\n---\n\n## AI Analysis & Recommendations\n\n` + aiSummary : "",
        ].filter(Boolean).join("\n");

        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mockmate-${type}-report-${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const shareResults = async () => {
        const text = `MockMate Interview: ${stats.confidenceScore}% (${verdict.label}) | Tech: ${stats.technicalAccuracy}% | Pace: ${stats.wpm} WPM | Concepts: ${stats.keyConcepts.length}`;
        if (navigator.share) {
            try { await navigator.share({ title: "MockMate Interview Report", text }); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] overflow-y-auto selection:bg-[#5e6ad2]/20 font-sans"
        >
            {/* 28px Precision Grid Background & Horizon Glow */}
            <div className="fixed inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
                <div
                    className="absolute inset-0 opacity-40 dark:opacity-20 text-zinc-400 dark:text-zinc-600"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: "28px 28px",
                        maskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
                    }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1px] bg-gradient-to-r from-transparent via-[#5e6ad2]/50 to-transparent" />
                <div
                    className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[180px] opacity-25 dark:opacity-20 blur-3xl pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, #5e6ad2 0%, transparent 70%)",
                    }}
                />
            </div>

            {/* Main Full-Width Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                
                {/* ── Top Header Navigation Bar ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200 dark:border-[#1e1e2a]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center text-xs font-bold text-white shadow-subtle">
                            M
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    TELEMETRY REPORT // FINAL DIAGNOSTICS
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20 font-semibold">
                                    {type}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-zinc-100 dark:bg-[#181824] text-zinc-500 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
                                    {difficulty}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
                                Simulation Performance Evaluation
                            </h1>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        <button 
                            onClick={downloadReport} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:bg-zinc-50 dark:hover:bg-[#181824] text-zinc-700 dark:text-[#ebebef] transition-colors shadow-subtle"
                            title="Download Markdown Report"
                        >
                            <Download size={14} className="text-[#5e6ad2]" />
                            <span>Export (.md)</span>
                        </button>

                        <button 
                            onClick={shareResults} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:bg-zinc-50 dark:hover:bg-[#181824] text-zinc-700 dark:text-[#ebebef] transition-colors shadow-subtle"
                            title="Share Results"
                        >
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} className="text-[#5e6ad2]" />}
                            <span>{copied ? "Copied" : "Share"}</span>
                        </button>

                        <Link 
                            href="/demo" 
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100 dark:bg-[#181824] hover:bg-zinc-200 dark:hover:bg-[#222232] text-zinc-800 dark:text-zinc-200 transition-colors shadow-subtle"
                        >
                            <RotateCcw size={14} />
                            <span>New Session</span>
                        </Link>

                        <Link 
                            href="/demo/history" 
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:bg-zinc-50 dark:hover:bg-[#181824] text-zinc-700 dark:text-[#ebebef] transition-colors shadow-subtle"
                        >
                            <History size={14} />
                            <span>History</span>
                        </Link>

                        <Link 
                            href="/dashboard" 
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-subtle transition-all active:scale-95"
                        >
                            <Home size={14} />
                            <span>Dashboard</span>
                        </Link>
                    </div>
                </div>

                {/* ── Two-Column High-Efficiency Executive Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* ── Left Column: Overall Verdict & Session Metadata (5 cols) ── */}
                    <div className="lg:col-span-5 space-y-5">
                        
                        {/* Overall Score Gauge Card */}
                        <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 shadow-subtle relative overflow-hidden">
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    READINESS BENCHMARK
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${verdict.bg} ${verdict.color}`}>
                                    {verdict.label}
                                </span>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* SVG Circular Gauge */}
                                <div className="relative w-28 h-28 shrink-0">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle 
                                            cx="56" cy="56" r="46" 
                                            className="stroke-zinc-100 dark:stroke-[#1e1e2a] fill-none" 
                                            strokeWidth="7" 
                                        />
                                        <m.circle 
                                            cx="56" cy="56" r="46"
                                            className={`fill-none ${verdict.ring}`}
                                            strokeWidth="7"
                                            strokeLinecap="round"
                                            strokeDasharray={289}
                                            initial={{ strokeDashoffset: 289 }}
                                            animate={{ strokeDashoffset: 289 - (289 * Math.max(5, stats.confidenceScore)) / 100 }}
                                            transition={{ duration: 1.4, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
                                            {stats.confidenceScore}%
                                        </span>
                                        <span className="text-[9.5px] uppercase font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
                                            OVERALL
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className={`text-xl font-bold mb-1 ${verdict.color}`}>
                                        {verdict.label}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                                        Evaluation formulated across pace, technical vocabulary accuracy, explanation depth, and STAR structure.
                                    </p>
                                </div>
                            </div>

                            {/* Summary Paragraph */}
                            <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-[#1e1e2a]">
                                <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
                                    {verdictDescription}
                                </p>
                            </div>
                        </div>

                        {/* Session Metadata Info Row */}
                        <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-4 shadow-subtle grid grid-cols-3 gap-3 text-center">
                            <div>
                                <span className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
                                    DURATION
                                </span>
                                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                                    {durationSeconds ? formatDuration(durationSeconds) : "Active"}
                                </span>
                            </div>
                            <div className="border-x border-zinc-100 dark:border-[#1e1e2a]">
                                <span className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
                                    QUESTIONS
                                </span>
                                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                                    {stats.questionsCovered}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
                                    WORDS
                                </span>
                                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                                    {stats.longestAnswerWords} max
                                </span>
                            </div>
                        </div>

                        {/* Key Concepts Cloud */}
                        <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-5 shadow-subtle">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
                                    <BrainCircuit size={13} className="text-[#5e6ad2]" />
                                    Detected Topics ({stats.keyConcepts.length})
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">AST & NLP MATCH</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {stats.keyConcepts.length > 0 ? (
                                    stats.keyConcepts.map(concept => (
                                        <span 
                                            key={concept} 
                                            className="px-2.5 py-1 bg-zinc-100 dark:bg-[#181824] text-[#5e6ad2] dark:text-[#808cf0] text-[10.5px] font-mono font-medium rounded-md border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle capitalize"
                                        >
                                            {concept}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-1">
                                        No specific technical frameworks detected during this session.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Telemetry Grid & Actionable Guidance (7 cols) ── */}
                    <div className="lg:col-span-7 space-y-5">
                        
                        {/* Primary KPI Telemetry Grid (8 Metrics) */}
                        <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-[#1e1e2a]">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                                    <Activity size={14} className="text-[#5e6ad2]" />
                                    Performance Signals
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">8 CORE METRICS</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Pace */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <Zap size={11} className="text-amber-500" />
                                        Pace
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                                        {stats.wpm} <span className="text-xs font-normal text-zinc-400">WPM</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        {stats.wpm > 150 ? "Fast cadence" : stats.wpm < 80 ? "Deliberate" : "Target pace"}
                                    </span>
                                </div>

                                {/* Technical Signal */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <Sparkles size={11} className="text-[#5e6ad2]" />
                                        Tech Signal
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                                        {stats.technicalAccuracy}%
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        {stats.technicalAccuracy > 70 ? "High accuracy" : stats.technicalAccuracy > 40 ? "Moderate" : "Developing"}
                                    </span>
                                </div>

                                {/* Depth */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <BarChart3 size={11} className="text-cyan-500" />
                                        Depth
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-[#ebebef] capitalize">
                                        {stats.answerDepth}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        {stats.longestAnswerWords}w max
                                    </span>
                                </div>

                                {/* Fillers */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <AlertTriangle size={11} className="text-orange-500" />
                                        Fillers
                                    </div>
                                    <div className={`text-lg font-bold ${stats.fillerWordsPerMinute > 4 ? "text-rose-500" : "text-zinc-900 dark:text-[#ebebef]"}`}>
                                        {stats.fillerWordsPerMinute}<span className="text-xs font-normal text-zinc-400">/min</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        {stats.fillerWordCount} total count
                                    </span>
                                </div>

                                {/* Tone / Sentiment */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <Target size={11} className="text-blue-500" />
                                        Tone
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                                        {stats.sentiment}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        Emotional clarity
                                    </span>
                                </div>

                                {/* Concepts Count */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <BrainCircuit size={11} className="text-emerald-500" />
                                        Breadth
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                                        {stats.keyConcepts.length}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        Core frameworks
                                    </span>
                                </div>

                                {/* STAR Usage */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <MessageSquare size={11} className="text-indigo-500" />
                                        STAR
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                                        {stats.starMethodCount}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        Structured responses
                                    </span>
                                </div>

                                {/* Vocabulary Variety */}
                                <div className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] p-3 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-[10px] font-mono uppercase mb-1">
                                        <TrendingUp size={11} className="text-purple-500" />
                                        Vocabulary
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                                        {stats.vocabularyRichness}%
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                                        Lexical density
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Targeted Growth Areas */}
                        <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-[#1e1e2a]">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                                    <Lightbulb size={14} className="text-amber-500" />
                                    Targeted Areas For Improvement
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">ACTIONABLE PLAYBOOK</span>
                            </div>

                            <div className="space-y-2.5">
                                {improvementTips.map((tip, i) => (
                                    <div 
                                        key={i} 
                                        className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] flex items-start gap-3"
                                    >
                                        <span className="w-5 h-5 rounded-md bg-[#5e6ad2]/10 text-[#5e6ad2] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#5e6ad2]/20">
                                            {i + 1}
                                        </span>
                                        <p className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                            {tip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Full-Width AI In-Depth Diagnostic Analysis ── */}
                {aiSummary && (
                    <div className="mt-6 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-100 dark:border-[#1e1e2a]">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#5e6ad2]" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef]">
                                    AI Evaluator Qualitative Synthesis
                                </h3>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400">BOB AI TELEMETRY</span>
                        </div>

                        <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300 prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-[#ebebef] prose-strong:text-zinc-900 dark:prose-strong:text-[#ebebef] prose-p:leading-relaxed">
                            <ReactMarkdown>{aiSummary}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </m.div>
    );
});
