
"use client";

import { motion } from "framer-motion";
import { 
    Award, 
    ArrowRight, 
    CheckCircle, 
    TrendingUp, 
    MessageSquare, 
    Target,
    Activity,
    BrainCircuit,
    Download,
    Share2,
    Home
} from "lucide-react";
import Link from "next/link";

interface SessionReportProps {
    stats: {
        wpm: number;
        sentiment: string;
        keyConcepts: string[];
        confidenceScore: number;
    };
    transcript: string;
    onClose?: () => void;
}

export function SessionReport({ stats, transcript, onClose }: SessionReportProps) {
    const verdict = stats.confidenceScore > 80 ? "Exceptional" : stats.confidenceScore > 60 ? "Strong candidate" : "Developing";
    const colorClass = stats.confidenceScore > 80 ? "text-green-400" : stats.confidenceScore > 60 ? "text-blue-400" : "text-amber-400";

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 overflow-y-auto"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-4xl w-full bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.1)] relative"
            >
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>

                <div className="relative z-10 p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">
                                <Award size={14} />
                                Interview Summary
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white">Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Analysis</span></h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <Download size={20} />
                            </button>
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <Share2 size={20} />
                            </button>
                            <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95">
                                <Home size={18} />
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Overall Confidence */}
                        <div className="col-span-1 md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle 
                                        cx="64" cy="64" r="58"
                                        className="stroke-gray-800 fill-none"
                                        strokeWidth="8"
                                    />
                                    <motion.circle 
                                        cx="64" cy="64" r="58"
                                        className={`fill-none ${stats.confidenceScore > 80 ? 'stroke-green-500' : stats.confidenceScore > 60 ? 'stroke-blue-500' : 'stroke-amber-500'}`}
                                        strokeWidth="8"
                                        strokeDasharray={364.4}
                                        initial={{ strokeDashoffset: 364.4 }}
                                        animate={{ strokeDashoffset: 364.4 - (364.4 * stats.confidenceScore) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-white">{stats.confidenceScore}%</span>
                                    <span className="text-[10px] uppercase text-gray-500 font-bold">Confidence</span>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className={`text-2xl font-black mb-2 ${colorClass}`}>{verdict}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                                    You demonstrated a {verdict.toLowerCase()} grasp of technical concepts and maintained a steady communication pace. Your ability to connect theoretical knowledge with practical examples was a highlight.
                                </p>
                            </div>
                        </div>

                        {/* Secondary Stats */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 text-pink-400 mb-4">
                                <Activity size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Communication Pace</span>
                            </div>
                            <div className="text-3xl font-black text-white mb-1">{stats.wpm} <span className="text-xs text-gray-500 font-normal ml-1">WPM</span></div>
                            <p className="text-xs text-gray-500">{stats.wpm > 140 ? "Fast-paced and energetic." : stats.wpm < 80 ? "Deliberate and thoughtful." : "Well-balanced delivery."}</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 text-cyan-400 mb-4">
                                <BrainCircuit size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Concept Density</span>
                            </div>
                            <div className="text-3xl font-black text-white mb-1">{stats.keyConcepts.length} <span className="text-xs text-gray-500 font-normal ml-1">Topics</span></div>
                            <p className="text-xs text-gray-500">Rich technical vocabulary covered.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 text-purple-400 mb-4">
                                <Target size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Engagement</span>
                            </div>
                            <div className="text-3xl font-black text-white mb-1">{stats.sentiment}</div>
                            <p className="text-xs text-gray-500 text-capitalize">Response sentiment index.</p>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-gradient-to-r from-purple-500/10 to-transparent border-l-2 border-purple-500 p-6 rounded-r-2xl">
                            <h5 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <TrendingUp size={16} className="text-purple-400" />
                                Key Strengths
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {stats.keyConcepts.slice(0, 5).map((concept, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 text-purple-400 text-[10px] font-bold uppercase rounded-lg border border-white/5">
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-blue-500/10 to-transparent border-l-2 border-blue-500 p-6 rounded-r-2xl">
                            <h5 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <MessageSquare size={16} className="text-blue-400" />
                                Recommended Practice
                            </h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Review your response for advanced {stats.keyConcepts[0] || 'technical'} topics. Consider deeper explanation of architectural tradeoffs.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
