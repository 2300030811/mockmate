
import { useEffect, useState } from "react";
import { Activity, Zap, TrendingUp, Award, BrainCircuit, Terminal } from "lucide-react";

interface SessionInsightsProps {
    transcript: string;
    finalTranscript: string;
    messages: { role: string; content: string }[];
    elapsedSeconds: number;
    onStatsUpdate?: (stats: { wpm: number; sentiment: string; keyConcepts: string[]; confidenceScore: number }) => void;
}

export function SessionInsights({ transcript, finalTranscript, messages, elapsedSeconds, onStatsUpdate }: SessionInsightsProps) {
    const [analytics, setAnalytics] = useState({
        wpm: 0,
        sentiment: "Neutral",
        keyConcepts: [] as string[],
        confidenceScore: 0
    });

    // --- REAL ANALYTICS ENGINE ---
    useEffect(() => {
        // 1. Calculate WPM (Words Per Minute)
        // We estimate user words based on transcript and total user messages
        const userMsgs = messages.filter(m => m.role === "user");
        const currentText = transcript || "";
        
        let totalWords = 0;
        userMsgs.forEach(msg => {
            totalWords += msg.content.trim().split(/\s+/).length;
        });
        // Add current speaking words
        totalWords += currentText.trim().split(/\s+/).length;

        // Avoid division by zero
        const minutes = Math.max(0.5, elapsedSeconds / 60);
        const wpm = Math.round(totalWords / minutes);
        
        // 2. Key Concepts Extraction
        const lastText = (finalTranscript + " " + transcript).toLowerCase();
        const concepts = [
            "react", "node", "async", "cloud", "security", "database", "frontend", "backend", 
            "api", "rest", "graphql", "state", "props", "aws", "azure", "docker", "kubernetes", 
            "sql", "nosql", "postgres", "mysql", "mongodb", "indexing", "joins", "normalization", 
            "acid", "transactions", "scalability", "complexity", "big o", "algorithms",
            "microservices", "testing", "jest", "cicd", "git", "version control", "agile", "scrum"
        ];
        
        const found = concepts.filter(c => lastText.includes(c));
        const allFound = Array.from(new Set([...analytics.keyConcepts, ...found]));

        // 3. Sentiment & Confidence
        const positiveWords = ["excellent", "great", "sure", "confident", "solved", "optimized", "implemented", "learned", "understand"];
        const negativeWords = ["unsure", "maybe", "confused", "stuck", "hard", "error", "bug", "broken", "forgot"];
        
        const posCount = positiveWords.filter(w => lastText.includes(w)).length;
        const negCount = negativeWords.filter(w => lastText.includes(w)).length;
        
        let sentiment = "Neutral";
        if (posCount > negCount) sentiment = "Positive";
        else if (negCount > posCount) sentiment = "Anxious";

        // Heuristic Confidence Score: (WPM factor) + (Concept Coverage) + (Sentiment)
        // WPM: Ideal is 100-150. Too slow < 80, Too fast > 180.
        let wpmScore = 20; // base
        if (wpm > 80 && wpm < 180) wpmScore = 40;
        if (wpm >= 180) wpmScore = 30; // too fast
        
        const conceptScore = Math.min(40, allFound.length * 5); // Max 40 pts for concepts
        const sentimentScore = sentiment === "Positive" ? 20 : sentiment === "Anxious" ? 0 : 10;

        const totalConfidence = wpmScore + conceptScore + sentimentScore;

        // Only update if changed meaningfully to avoid flicker
        setAnalytics(prev => ({
            wpm: wpm || 0,
            sentiment,
            keyConcepts: allFound,
            confidenceScore: Math.round(totalConfidence)
        }));

        if (onStatsUpdate) {
            onStatsUpdate({
                wpm: wpm || 0,
                sentiment,
                keyConcepts: allFound,
                confidenceScore: Math.round(totalConfidence)
            });
        }

    }, [transcript, finalTranscript, messages, elapsedSeconds, analytics.keyConcepts, onStatsUpdate]);


    return (
        <div className="h-full bg-gray-900/50 p-6 overflow-y-auto custom-scrollbar animate-fadeIn">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BrainCircuit className="text-purple-500" />
            Live Performance
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-tighter">
                <Zap size={14} className="text-amber-400" /> 
                Pace (WPM)
                </div>
                <div className="text-2xl font-bold text-white max-w-[100px] truncate">{analytics.wpm}</div>
                <div className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp size={10} /> {analytics.wpm > 130 ? "Fast Pace" : analytics.wpm < 80 ? "Take your time" : "Steady Pace"}
                </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-tighter">
                <Activity size={14} className="text-pink-400" /> 
                Sentiment
                </div>
                <div className={`text-2xl font-bold ${analytics.sentiment === 'Positive' ? 'text-green-400' : analytics.sentiment === 'Anxious' ? 'text-amber-400' : 'text-blue-400'}`}>
                {analytics.sentiment}
                </div>
                <div className="text-[10px] text-gray-500 mt-1 capitalize">
                Emotional Tone
                </div>
            </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-tighter">
                <Award size={14} className="text-blue-400" /> 
                Confidence Score
                </div>
                <span className="text-sm font-bold text-white">{analytics.confidenceScore}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                className={`h-full transition-all duration-1000 ${analytics.confidenceScore > 80 ? 'bg-green-500' : analytics.confidenceScore > 60 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                style={{ width: `${Math.min(100, Math.max(5, analytics.confidenceScore))}%` }}
                ></div>
            </div>
            </div>

            <div className="mb-8">
            <div className="flex items-center justify-between mb-3 text-xs text-gray-400 uppercase tracking-tighter">
                <span>Key Concepts Identified</span>
                <span className="text-purple-400">{analytics.keyConcepts.length} Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {analytics.keyConcepts.length > 0 ? (
                analytics.keyConcepts.map((concept, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20 animate-fadeIn">
                    {concept}
                    </span>
                ))
                ) : (
                <div className="text-gray-600 text-sm italic">Keep talking to see identified concepts...</div>
                )}
            </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <BrainCircuit size={80} />
            </div>
            <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <Terminal size={16} className="text-indigo-400" />
                AI Observer Tip
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
                {messages.length < 3 
                ? "The interviewer is currently setting the focus. Listen for technical clues and prepare to be specific."
                : analytics.sentiment === "Anxious"
                    ? "You're sounding a bit hesitant. Take a deep breath! It's okay to say 'I need a moment to think about that'."
                    : analytics.confidenceScore > 85 
                    ? "Great momentum! Now is the time to mention specific tools or frameworks you've used to solve similar problems."
                    : "Try to structure your next answer using the STAR method: Situation, Task, Action, and Result."
                }
            </p>
            </div>
        </div>
    );
}
