
import { useEffect, useRef, useState, memo, useMemo } from "react";
import { Activity, Zap, TrendingUp, Award, BrainCircuit, Terminal, Clock, MessageCircle, BarChart3, AlertTriangle, Sparkles } from "lucide-react";

// ── Shared analytics types ──────────────────────────────────────────────
export interface InterviewAnalytics {
    wpm: number;
    sentiment: string;
    keyConcepts: string[];
    confidenceScore: number;
    // New enriched metrics
    avgResponseTimeSec: number;
    fillerWordCount: number;
    fillerWordsPerMinute: number;
    answerDepth: "shallow" | "moderate" | "detailed";
    starMethodCount: number;
    questionsCovered: number;
    vocabularyRichness: number; // unique words / total words ratio
    longestAnswerWords: number;
    shortestAnswerWords: number;
    technicalAccuracy: number; // 0-100 heuristic
}

// ── Constants ───────────────────────────────────────────────────────────
const CONCEPT_TERMS = [
    // Frontend
    "react", "vue", "angular", "svelte", "next.js", "nextjs", "typescript", "javascript",
    "html", "css", "tailwind", "webpack", "vite", "sass", "dom", "virtual dom",
    "ssr", "ssg", "hydration", "component", "state", "props", "hooks", "context",
    "redux", "zustand", "jotai", "recoil",
    // Backend
    "node", "express", "fastify", "django", "flask", "spring", "nestjs",
    "rest", "graphql", "grpc", "websocket", "middleware", "authentication",
    "authorization", "jwt", "oauth", "session",
    // Databases
    "sql", "nosql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
    "indexing", "joins", "normalization", "denormalization", "sharding",
    "acid", "transactions", "replication", "partitioning",
    // Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "cicd",
    "jenkins", "github actions", "monitoring", "logging", "observability",
    // Architecture
    "microservices", "monolith", "serverless", "event-driven", "cqrs",
    "saga", "pub/sub", "message queue", "load balancer", "cdn", "caching",
    "api gateway", "service mesh", "circuit breaker",
    // CS Fundamentals
    "algorithms", "data structures", "complexity", "big o", "recursion",
    "dynamic programming", "binary search", "hash map", "linked list",
    "tree", "graph", "sorting", "bfs", "dfs", "greedy",
    // Testing & Quality
    "testing", "unit test", "integration test", "e2e", "jest", "vitest",
    "cypress", "playwright", "tdd", "bdd", "coverage",
    // Methodology
    "agile", "scrum", "kanban", "sprint", "git", "version control",
    "code review", "pair programming", "refactoring", "design patterns",
    "solid", "dry", "kiss", "scalability", "performance",
    // Behavioral
    "leadership", "teamwork", "conflict", "communication", "mentoring",
    "deadline", "prioritization", "stakeholder", "feedback", "ownership",
];

const FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "actually", "literally",
    "sort of", "kind of", "i mean", "right", "so yeah", "i guess",
    "honestly", "to be honest", "in terms of",
];

const POSITIVE_SIGNALS = [
    "solved", "implemented", "designed", "architected", "optimized", "led",
    "built", "shipped", "deployed", "delivered", "improved", "reduced",
    "increased", "automated", "mentored", "achieved", "successful",
    "confident", "proficient", "experienced", "understand", "learned",
    "collaborated", "initiated", "measured", "tested", "ensured",
];

const NEGATIVE_SIGNALS = [
    "unsure", "maybe", "confused", "stuck", "don't know", "not sure",
    "i think", "possibly", "hard to say", "no experience", "forgot",
    "haven't used", "not familiar", "struggle", "difficult", "error",
];

const STAR_KEYWORDS = {
    situation: ["situation", "context", "background", "scenario", "when i was", "at my previous", "at my last"],
    task: ["task", "responsible for", "my role", "objective", "goal", "challenge"],
    action: ["i did", "i implemented", "i designed", "i built", "i created", "my approach", "i decided", "steps i took"],
    result: ["result", "outcome", "impact", "achieved", "reduced", "increased", "improved", "led to", "delivered"],
};

// Pre-compile regexes at module level for fast matching
const CONCEPT_REGEX = new RegExp(`\\b(${CONCEPT_TERMS.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
const FILLER_REGEXES = FILLER_WORDS.map(f => new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'));

interface SessionInsightsProps {
    transcript: string;
    finalTranscript: string;
    messages: { role: string; content: string }[];
    elapsedSeconds: number;
    onStatsUpdate?: (stats: InterviewAnalytics) => void;
}

export const SessionInsights = memo(function SessionInsights({ transcript, finalTranscript, messages, elapsedSeconds, onStatsUpdate }: SessionInsightsProps) {
    const [analytics, setAnalytics] = useState<InterviewAnalytics>({
        wpm: 0,
        sentiment: "Neutral",
        keyConcepts: [],
        confidenceScore: 0,
        avgResponseTimeSec: 0,
        fillerWordCount: 0,
        fillerWordsPerMinute: 0,
        answerDepth: "shallow",
        starMethodCount: 0,
        questionsCovered: 0,
        vocabularyRichness: 0,
        longestAnswerWords: 0,
        shortestAnswerWords: 0,
        technicalAccuracy: 0,
    });

    const keyConceptsRef = useRef<Set<string>>(new Set());
    const onStatsUpdateRef = useRef(onStatsUpdate);
    onStatsUpdateRef.current = onStatsUpdate;
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            const userMsgs = messages.filter(m => m.role === "user");
            const aiMsgs = messages.filter(m => m.role === "assistant");
            const currentText = transcript || "";
            const allUserText = userMsgs.map(m => m.content).join(" ") + " " + currentText;
            const allUserTextLower = allUserText.toLowerCase();

            // ── 1. WPM ──────────────────────────────────────────────
            const userWords = allUserText.trim().split(/\s+/).filter(Boolean);
            const totalWords = userWords.length;
            const minutes = Math.max(0.5, elapsedSeconds / 60);
            const wpm = Math.round(totalWords / minutes);

            // ── 2. Vocabulary Richness ──────────────────────────────
            const uniqueWords = new Set(userWords.map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length > 2));
            const vocabularyRichness = totalWords > 10 ? Math.round((uniqueWords.size / totalWords) * 100) : 0;

            // ── 3. Key Concepts (pre-compiled regex) ────────────────
            const matches = allUserTextLower.match(CONCEPT_REGEX) || [];
            matches.forEach(m => keyConceptsRef.current.add(m.toLowerCase()));
            const keyConcepts = Array.from(keyConceptsRef.current);

            // ── 4. Filler Words (pre-compiled regexes) ───────────────
            let fillerWordCount = 0;
            for (const regex of FILLER_REGEXES) {
                regex.lastIndex = 0;
                const fillerMatches = allUserTextLower.match(regex);
                if (fillerMatches) fillerWordCount += fillerMatches.length;
            }
            const fillerWordsPerMinute = minutes > 0.5 ? Math.round((fillerWordCount / minutes) * 10) / 10 : 0;

            // ── 5. STAR Method Detection ────────────────────────────
            let starMethodCount = 0;
            for (const msg of userMsgs) {
                const lower = msg.content.toLowerCase();
                const hasCategories = Object.values(STAR_KEYWORDS).filter(
                    keywords => keywords.some(kw => lower.includes(kw))
                ).length;
                if (hasCategories >= 3) starMethodCount++; // At least 3 of 4 STAR categories
            }

            // ── 6. Sentiment (weighted) ─────────────────────────────
            let posScore = 0;
            let negScore = 0;
            for (const w of POSITIVE_SIGNALS) {
                if (allUserTextLower.includes(w)) posScore += 1;
            }
            for (const w of NEGATIVE_SIGNALS) {
                if (allUserTextLower.includes(w)) negScore += 1;
            }
            const sentimentDelta = posScore - negScore;
            const sentiment = sentimentDelta > 2 ? "Confident" : sentimentDelta > 0 ? "Positive" : sentimentDelta < -2 ? "Anxious" : sentimentDelta < 0 ? "Hesitant" : "Neutral";

            // ── 7. Answer Depth ─────────────────────────────────────
            const wordCounts = userMsgs.map(m => m.content.trim().split(/\s+/).length);
            const avgWords = wordCounts.length > 0 ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length : 0;
            const longestAnswerWords = wordCounts.length > 0 ? Math.max(...wordCounts) : 0;
            const shortestAnswerWords = wordCounts.length > 0 ? Math.min(...wordCounts) : 0;
            const answerDepth: "shallow" | "moderate" | "detailed" = avgWords > 60 ? "detailed" : avgWords > 25 ? "moderate" : "shallow";

            // ── 8. Questions Covered ────────────────────────────────
            const questionsCovered = aiMsgs.filter(m => m.content.includes("?")).length;

            // ── 9. Average Response Time (heuristic) ────────────────
            // We don't have exact timestamps, so approximate:
            // total user speaking time ≈ elapsed - (AI messages * ~5s avg TTS)
            const estimatedAISpeakingTime = aiMsgs.length * 5;
            const userTime = Math.max(5, elapsedSeconds - estimatedAISpeakingTime);
            const avgResponseTimeSec = userMsgs.length > 0 ? Math.round(userTime / userMsgs.length) : 0;

            // ── 10. Technical Accuracy Heuristic ────────────────────
            // Based on: concept density + answer depth + low filler ratio + STAR usage
            const conceptDensityScore = Math.min(35, keyConcepts.length * 3);
            const depthScore = answerDepth === "detailed" ? 25 : answerDepth === "moderate" ? 15 : 5;
            const fillerPenalty = Math.min(15, fillerWordsPerMinute * 3);
            const starBonus = Math.min(15, starMethodCount * 5);
            const vocabBonus = vocabularyRichness > 50 ? 10 : vocabularyRichness > 35 ? 5 : 0;
            const technicalAccuracy = Math.min(100, Math.max(0,
                conceptDensityScore + depthScore - fillerPenalty + starBonus + vocabBonus
            ));

            // ── 11. Confidence Score (composite) ────────────────────
            const wpmScore = (wpm >= 90 && wpm <= 160) ? 20 : (wpm >= 70 && wpm <= 180) ? 15 : 10;
            const sentimentScore = sentiment === "Confident" ? 20 : sentiment === "Positive" ? 15 : sentiment === "Neutral" ? 10 : sentiment === "Hesitant" ? 5 : 0;
            const conceptScore = Math.min(25, keyConcepts.length * 2.5);
            const depthConfScore = answerDepth === "detailed" ? 15 : answerDepth === "moderate" ? 10 : 5;
            const engagementScore = Math.min(20, (questionsCovered > 0 ? Math.min(userMsgs.length / questionsCovered, 1) * 20 : 0));
            const totalConfidence = Math.min(100, Math.round(wpmScore + sentimentScore + conceptScore + depthConfScore + engagementScore));

            const newStats: InterviewAnalytics = {
                wpm: wpm || 0,
                sentiment,
                keyConcepts,
                confidenceScore: totalConfidence,
                avgResponseTimeSec,
                fillerWordCount,
                fillerWordsPerMinute,
                answerDepth,
                starMethodCount,
                questionsCovered,
                vocabularyRichness,
                longestAnswerWords,
                shortestAnswerWords,
                technicalAccuracy,
            };

            setAnalytics(newStats);
            onStatsUpdateRef.current?.(newStats);

        }, 400);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [transcript, finalTranscript, messages]); // eslint-disable-line react-hooks/exhaustive-deps

    // Contextual AI coaching tip based on current metrics
    const coachingTip = useMemo(() => {
        if (messages.length < 3) return "The interviewer is setting the stage. Listen carefully for technical clues and prepare specific examples.";
        if (analytics.fillerWordsPerMinute > 4) return "You're using filler words frequently. Try pausing briefly instead of saying 'um' or 'like' — silence shows confidence.";
        if (analytics.answerDepth === "shallow") return "Your answers are quite short. Try expanding with specific examples, numbers, or tools you've used.";
        if (analytics.sentiment === "Anxious" || analytics.sentiment === "Hesitant") return "You sound a bit uncertain. It's okay to say 'Let me think about that for a moment' before answering.";
        if (analytics.starMethodCount === 0 && messages.length > 6) return "Try structuring your next answer using STAR: Situation → Task → Action → Result. It shows structured thinking.";
        if (analytics.vocabularyRichness < 30 && messages.length > 4) return "Try varying your vocabulary. Instead of repeating the same terms, use synonyms and more specific technical language.";
        if (analytics.confidenceScore > 85) return "Excellent momentum! Consider diving deeper into trade-offs and architectural decisions to show senior-level thinking.";
        if (analytics.technicalAccuracy > 70) return "Strong technical showing. Try connecting your answers to real-world impact — metrics, performance gains, team outcomes.";
        return "Structure your next answer: state the problem, explain your approach, describe the result. Specificity wins interviews.";
    }, [analytics, messages.length]);

    // Filler word severity
    const fillerSeverity = analytics.fillerWordsPerMinute > 5 ? "text-red-400" : analytics.fillerWordsPerMinute > 2 ? "text-amber-400" : "text-green-400";
    const depthColor = analytics.answerDepth === "detailed" ? "text-green-400" : analytics.answerDepth === "moderate" ? "text-blue-400" : "text-amber-400";

    return (
        <div className="h-full bg-gray-900/50 p-5 overflow-y-auto custom-scrollbar animate-fadeIn space-y-5">
            {/* Header */}
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="text-purple-500" />
                Live Performance
            </h3>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* WPM */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-2 uppercase tracking-wider">
                        <Zap size={12} className="text-amber-400" />
                        Pace
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.wpm} <span className="text-xs text-gray-500 font-normal">WPM</span></div>
                    <div className="text-[10px] mt-1 flex items-center gap-1">
                        <TrendingUp size={10} />
                        <span className={analytics.wpm > 160 ? "text-amber-400" : analytics.wpm < 70 ? "text-amber-400" : "text-green-400"}>
                            {analytics.wpm > 160 ? "Slow down slightly" : analytics.wpm < 70 ? "Speak up more" : "Great pace"}
                        </span>
                    </div>
                </div>

                {/* Sentiment */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-2 uppercase tracking-wider">
                        <Activity size={12} className="text-pink-400" />
                        Tone
                    </div>
                    <div className={`text-2xl font-bold ${
                        analytics.sentiment === 'Confident' ? 'text-green-400' :
                        analytics.sentiment === 'Positive' ? 'text-emerald-400' :
                        analytics.sentiment === 'Hesitant' ? 'text-amber-400' :
                        analytics.sentiment === 'Anxious' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                        {analytics.sentiment}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Emotional signal</div>
                </div>

                {/* Answer Depth */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-2 uppercase tracking-wider">
                        <BarChart3 size={12} className="text-cyan-400" />
                        Depth
                    </div>
                    <div className={`text-2xl font-bold capitalize ${depthColor}`}>{analytics.answerDepth}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Avg answer length</div>
                </div>

                {/* Filler Words */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-2 uppercase tracking-wider">
                        <AlertTriangle size={12} className="text-orange-400" />
                        Fillers
                    </div>
                    <div className={`text-2xl font-bold ${fillerSeverity}`}>{analytics.fillerWordsPerMinute}<span className="text-xs text-gray-500 font-normal">/min</span></div>
                    <div className="text-[10px] text-gray-500 mt-1">{analytics.fillerWordCount} total</div>
                </div>
            </div>

            {/* Confidence Score */}
            <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider">
                        <Award size={12} className="text-blue-400" />
                        Confidence Score
                    </div>
                    <span className="text-sm font-bold text-white">{analytics.confidenceScore}%</span>
                </div>
                <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 rounded-full ${
                            analytics.confidenceScore > 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                            analytics.confidenceScore > 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                            'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, analytics.confidenceScore))}%` }}
                    />
                </div>
            </div>

            {/* Technical Accuracy */}
            <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider">
                        <Sparkles size={12} className="text-purple-400" />
                        Technical Signal
                    </div>
                    <span className="text-sm font-bold text-white">{analytics.technicalAccuracy}%</span>
                </div>
                <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 rounded-full ${
                            analytics.technicalAccuracy > 70 ? 'bg-gradient-to-r from-purple-500 to-pink-400' :
                            analytics.technicalAccuracy > 40 ? 'bg-gradient-to-r from-indigo-500 to-blue-400' :
                            'bg-gradient-to-r from-gray-500 to-gray-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, analytics.technicalAccuracy))}%` }}
                    />
                </div>
            </div>

            {/* Session Stats Row */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-800/30 rounded-lg py-2.5 px-2">
                    <div className="text-lg font-bold text-white">{analytics.questionsCovered}</div>
                    <div className="text-[9px] text-gray-500 uppercase">Questions</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg py-2.5 px-2">
                    <div className="text-lg font-bold text-white">{analytics.starMethodCount}</div>
                    <div className="text-[9px] text-gray-500 uppercase">STAR Used</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg py-2.5 px-2">
                    <div className="text-lg font-bold text-white">{analytics.vocabularyRichness}%</div>
                    <div className="text-[9px] text-gray-500 uppercase">Vocab Rich</div>
                </div>
            </div>

            {/* Key Concepts */}
            <div>
                <div className="flex items-center justify-between mb-2 text-[10px] text-gray-400 uppercase tracking-wider">
                    <span>Key Concepts</span>
                    <span className="text-purple-400">{analytics.keyConcepts.length} identified</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {analytics.keyConcepts.length > 0 ? (
                        analytics.keyConcepts.map((concept) => (
                            <span key={concept} className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-medium rounded-full border border-purple-500/20 capitalize">
                                {concept}
                            </span>
                        ))
                    ) : (
                        <div className="text-gray-600 text-xs italic">Keep talking to detect concepts...</div>
                    )}
                </div>
            </div>

            {/* AI Coaching Tip */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4 rounded-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <BrainCircuit size={70} />
                </div>
                <h4 className="text-white text-xs font-semibold mb-1.5 flex items-center gap-2">
                    <Terminal size={14} className="text-indigo-400" />
                    AI Coach
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed relative z-10">
                    {coachingTip}
                </p>
            </div>
        </div>
    );
});
