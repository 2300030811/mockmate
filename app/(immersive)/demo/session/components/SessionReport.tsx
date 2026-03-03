
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
}

// ── Helpers ──────────────────────────────────────────────────────────────
function getVerdict(score: number) {
    if (score > 85) return { label: "Exceptional", color: "text-green-400", ring: "stroke-green-500" };
    if (score > 70) return { label: "Strong Candidate", color: "text-emerald-400", ring: "stroke-emerald-500" };
    if (score > 55) return { label: "Promising", color: "text-blue-400", ring: "stroke-blue-500" };
    if (score > 40) return { label: "Developing", color: "text-amber-400", ring: "stroke-amber-500" };
    return { label: "Needs Practice", color: "text-orange-400", ring: "stroke-orange-500" };
}

function getVerdictDescription(stats: InterviewAnalytics) {
    const parts: string[] = [];
    // Pace insight
    if (stats.wpm >= 90 && stats.wpm <= 150) parts.push("Your speaking pace was well-calibrated for professional communication.");
    else if (stats.wpm > 150) parts.push("You spoke quite quickly — consider slowing down to let key points land.");
    else parts.push("Your speaking pace was on the slower side. Practicing aloud can help build fluency.");
    // Depth insight
    if (stats.answerDepth === "detailed") parts.push("Your answers showed impressive depth with specific examples and thorough explanations.");
    else if (stats.answerDepth === "moderate") parts.push("Your answers had reasonable depth but could benefit from more specifics and concrete examples.");
    else parts.push("Many responses were brief — expanding answers with examples and context would strengthen your performance.");
    // Technical
    if (stats.keyConcepts.length > 8) parts.push(`You demonstrated strong technical breadth, covering ${stats.keyConcepts.length} distinct concepts.`);
    else if (stats.keyConcepts.length > 3) parts.push("You mentioned several relevant technical concepts. Consider weaving in more specific tools and frameworks.");
    // STAR
    if (stats.starMethodCount > 0) parts.push(`You used structured (STAR-like) responses ${stats.starMethodCount} time${stats.starMethodCount > 1 ? "s" : ""}, which shows organized thinking.`);
    // Filler words
    if (stats.fillerWordsPerMinute > 4) parts.push("High filler word usage was detected. Practice pausing instead of using 'um', 'like', and 'you know'.");
    return parts.join(" ");
}

function getImprovementTips(stats: InterviewAnalytics): string[] {
    const tips: string[] = [];
    if (stats.answerDepth === "shallow") tips.push("Aim for 3-5 sentence answers minimum. Lead with the key point, then support with evidence.");
    if (stats.fillerWordsPerMinute > 3) tips.push("Record yourself answering questions and count filler words. Replace them with brief pauses.");
    if (stats.starMethodCount === 0) tips.push("Practice structuring behavioral answers with STAR: Situation → Task → Action → Result.");
    if (stats.keyConcepts.length < 5) tips.push("Study and practice mentioning specific technologies, tools, and methodologies relevant to your target role.");
    if (stats.vocabularyRichness < 35) tips.push("Diversify your vocabulary — avoid repeating the same phrases. Read technical blogs and practice explaining concepts in different ways.");
    if (stats.wpm > 160) tips.push("Practice at a slower pace. Aim for 120-140 WPM. Pausing between ideas shows confidence.");
    if (stats.wpm < 80) tips.push("Work on speaking fluency. Practice answering questions aloud with a timer to build natural rhythm.");
    if (tips.length === 0) tips.push("Keep refining your answers with more specific metrics and quantifiable outcomes from your experience.");
    return tips.slice(0, 4);
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

export const SessionReport = memo(function SessionReport({ stats, transcript, aiSummary, durationSeconds }: SessionReportProps) {
    const [copied, setCopied] = useState(false);
    const verdict = useMemo(() => getVerdict(stats.confidenceScore), [stats.confidenceScore]);
    const verdictDescription = useMemo(() => getVerdictDescription(stats), [stats]);
    const improvementTips = useMemo(() => getImprovementTips(stats), [stats]);

    const downloadReport = () => {
        const content = [
            "# Interview Performance Report\n",
            `**Date:** ${new Date().toLocaleDateString()}`,
            durationSeconds ? `**Duration:** ${formatDuration(durationSeconds)}` : "",
            `**Confidence Score:** ${stats.confidenceScore}%`,
            `**Technical Signal:** ${stats.technicalAccuracy}%`,
            `**Communication Pace:** ${stats.wpm} WPM`,
            `**Sentiment:** ${stats.sentiment}`,
            `**Answer Depth:** ${stats.answerDepth}`,
            `**Filler Words:** ${stats.fillerWordCount} (${stats.fillerWordsPerMinute}/min)`,
            `**STAR Responses:** ${stats.starMethodCount}`,
            `**Vocabulary Richness:** ${stats.vocabularyRichness}%`,
            `**Key Concepts:** ${stats.keyConcepts.join(", ")}\n`,
            "---\n",
            "## Performance Summary\n",
            verdictDescription + "\n",
            "## Areas to Improve\n",
            ...improvementTips.map((t, i) => `${i + 1}. ${t}`),
            aiSummary ? "\n---\n\n## AI Analysis\n\n" + aiSummary : "",
        ].filter(Boolean).join("\n");
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `interview-report-${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const shareResults = async () => {
        const text = `Interview Score: ${stats.confidenceScore}% | Tech: ${stats.technicalAccuracy}% | ${stats.wpm} WPM | ${stats.keyConcepts.length} concepts | Depth: ${stats.answerDepth}`;
        if (navigator.share) {
            try { await navigator.share({ title: "Interview Report", text }); } catch { /* cancelled */ }
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
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 overflow-y-auto"
        >
            <m.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-4xl w-full bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.1)] relative"
            >
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>

                <div className="relative z-10 p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">
                                <Award size={14} />
                                Interview Summary
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white">Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Analysis</span></h2>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button onClick={downloadReport} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors" title="Download report" aria-label="Download report as Markdown">
                                <Download size={20} />
                            </button>
                            <button onClick={shareResults} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors relative" title="Share results" aria-label="Share interview results">
                                {copied ? <Check size={20} className="text-green-400" /> : <Share2 size={20} />}
                            </button>
                            <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95">
                                <Home size={18} /> Dashboard
                            </Link>
                            <Link href="/demo/history" className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-medium flex items-center gap-2 border border-white/10 transition-all active:scale-95 text-sm">
                                View History
                            </Link>
                        </div>
                    </div>

                    {/* Main Score Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" className="stroke-gray-800 fill-none" strokeWidth="8" />
                                <m.circle 
                                    cx="64" cy="64" r="58"
                                    className={`fill-none ${verdict.ring}`}
                                    strokeWidth="8"
                                    strokeDasharray={364.4}
                                    initial={{ strokeDashoffset: 364.4 }}
                                    animate={{ strokeDashoffset: 364.4 - (364.4 * stats.confidenceScore) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white">{stats.confidenceScore}%</span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold">Overall</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className={`text-2xl font-black mb-2 ${verdict.color}`}>{verdict.label}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-lg">{verdictDescription}</p>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <MetricCard icon={<Activity size={16} />} iconColor="text-pink-400" label="Pace" value={`${stats.wpm}`} unit="WPM"
                            sub={stats.wpm > 150 ? "Fast pace" : stats.wpm < 80 ? "Slow pace" : "Ideal range"} />
                        <MetricCard icon={<Sparkles size={16} />} iconColor="text-purple-400" label="Technical" value={`${stats.technicalAccuracy}%`}
                            sub={stats.technicalAccuracy > 70 ? "Strong signal" : stats.technicalAccuracy > 40 ? "Moderate" : "Needs more"} />
                        <MetricCard icon={<BarChart3 size={16} />} iconColor="text-cyan-400" label="Depth" value={stats.answerDepth}
                            sub={`${stats.longestAnswerWords}w longest`} capitalize />
                        <MetricCard icon={<AlertTriangle size={16} />} iconColor="text-orange-400" label="Fillers" value={`${stats.fillerWordsPerMinute}`} unit="/min"
                            sub={`${stats.fillerWordCount} total`}
                            alert={stats.fillerWordsPerMinute > 4} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <MetricCard icon={<Target size={16} />} iconColor="text-blue-400" label="Sentiment" value={stats.sentiment}
                            sub="Emotional tone" />
                        <MetricCard icon={<BrainCircuit size={16} />} iconColor="text-emerald-400" label="Concepts" value={`${stats.keyConcepts.length}`}
                            sub="Topics identified" />
                        <MetricCard icon={<MessageSquare size={16} />} iconColor="text-indigo-400" label="STAR Used" value={`${stats.starMethodCount}`}
                            sub={stats.starMethodCount > 0 ? "Structured answers" : "Try using STAR"} />
                        {durationSeconds != null && (
                            <MetricCard icon={<Timer size={16} />} iconColor="text-gray-400" label="Duration" value={formatDuration(durationSeconds)}
                                sub={`${stats.questionsCovered} questions`} />
                        )}
                    </div>

                    {/* Vocabulary & Concepts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 text-purple-400 mb-4">
                                <TrendingUp size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Key Concepts ({stats.keyConcepts.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {stats.keyConcepts.length > 0 ? stats.keyConcepts.map(concept => (
                                    <span key={concept} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase rounded-lg border border-purple-500/20 capitalize">
                                        {concept}
                                    </span>
                                )) : (
                                    <p className="text-gray-600 text-xs italic">No concepts detected</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 text-amber-400 mb-4">
                                <Lightbulb size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Areas to Improve</span>
                            </div>
                            <ul className="space-y-2">
                                {improvementTips.map((tip, i) => (
                                    <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                                        <span className="text-amber-500 font-bold mt-0.5">{i + 1}.</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* AI-Generated Detailed Analysis */}
                    {aiSummary && (
                        <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="flex items-center gap-3 text-emerald-400 mb-6">
                                <FileText size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">AI Detailed Analysis</span>
                            </div>
                            <div className="prose prose-sm prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-gray-200 prose-li:text-gray-300">
                                <ReactMarkdown>{aiSummary}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </m.div>
        </m.div>
    );
});

// ── Reusable Metric Card ─────────────────────────────────────────────────
function MetricCard({ icon, iconColor, label, value, unit, sub, alert, capitalize }: {
    icon: React.ReactNode;
    iconColor: string;
    label: string;
    value: string;
    unit?: string;
    sub?: string;
    alert?: boolean;
    capitalize?: boolean;
}) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className={`flex items-center gap-2 ${iconColor} mb-3`}>
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
            </div>
            <div className={`text-2xl font-black text-white mb-0.5 ${capitalize ? "capitalize" : ""} ${alert ? "text-orange-400" : ""}`}>
                {value}{unit && <span className="text-xs text-gray-500 font-normal ml-1">{unit}</span>}
            </div>
            {sub && <p className="text-[10px] text-gray-500">{sub}</p>}
        </div>
    );
}
