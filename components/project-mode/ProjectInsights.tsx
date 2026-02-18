
"use client";

import { useState } from "react";
import { analyzeProjectCode, AnalysisResult } from "@/app/actions/project-analysis";
import ReactMarkdown from "react-markdown";
import { BrainCircuit, Loader2, Sparkles, AlertTriangle, Lightbulb, Activity, CheckCircle, Copy, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ProjectInsightsProps {
    files: Record<string, any>;
    description: string;
}

export function ProjectInsights({ files, description }: ProjectInsightsProps) {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // Convert Sandpack files to simplified format
            const simplifiedFiles = Object.entries(files).reduce((acc: any, [key, val]) => {
                acc[key] = { code: val.code };
                return acc;
            }, {});

            const data = await analyzeProjectCode(simplifiedFiles, description);
            setResult(data);
        } catch (err) {
            console.error(err);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.markdown);
        setIsCopied(true);
        toast.success("Analysis copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900/50 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="text-purple-500" />
                    AI Code Review
                </h3>
                <div className="flex items-center gap-2">
                    {result && !isAnalyzing && (
                        <button 
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
                            title="Copy Analysis"
                        >
                            {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                    )}
                    {!isAnalyzing && (
                        <button 
                            onClick={handleAnalysis}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                        >
                            <Sparkles size={14} />
                            {result ? "Re-Analyze" : "Run Analysis"}
                        </button>
                    )}
                </div>
            </div>

            {isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 animate-pulse">
                    <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
                    <p className="text-sm font-medium">Analyzing your code...</p>
                    <p className="text-xs mt-2">Checking for best practices, bugs, and optimizations.</p>
                </div>
            ) : result ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 animate-fadeIn">
                    {/* Score Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Activity size={100} />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Total Score</div>
                                <div className={`text-4xl font-black ${result.score > 80 ? 'text-green-500' : result.score > 60 ? 'text-amber-500' : 'text-red-500'}`}>
                                    {result.score}/100
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Verdict</div>
                                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {result.score > 80 ? "Production Ready" : result.score > 60 ? "Nice Attempt" : "Needs Work"}
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${result.score > 80 ? 'bg-green-500' : result.score > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${result.score}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Markdown Analysis content */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                         <ReactMarkdown 
                            components={{
                                ul: ({...props}) => <ul className="space-y-2 my-4" {...props} />,
                                li: ({...props}) => (
                                    <li className="flex gap-2 items-start text-gray-700 dark:text-gray-300">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 block"></span>
                                        <span {...props} />
                                    </li>
                                ),
                                strong: ({...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                                h3: ({...props}) => <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mt-6 mb-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2" {...props} />,
                            }}
                         >
                            {result.markdown}
                         </ReactMarkdown>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Lightbulb size={24} />
                    </div>
                    <h4 className="text-gray-900 dark:text-white font-medium mb-2">Ready for Review?</h4>
                    <p className="text-sm text-gray-500 max-w-xs">
                        Click &quot;Run Analysis&quot; to let our AI scan your code for potential bugs, improvements, and styling issues.
                    </p>
                </div>
            )}
        </div>
    );
}
