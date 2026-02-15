"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Flame, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Activity,
  Award,
  Cpu,
  Globe,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/ui/NavigationPill";

// --- Types ---
type GameState = 'lobby' | 'searching' | 'battle' | 'results';

interface Opponent {
  name: string;
  level: number;
  avatar: string;
  winRate: string;
  region: string;
  badge: string;
}

interface Question {
  q: string;
  options: string[];
  a: string;
  tip: string;
}

interface BattleResult {
  q: string;
  userAns: string;
  correct: boolean;
}

// --- Data ---
const OPPONENTS: Opponent[] = [
  { name: "CodeWizard_99", level: 42, avatar: "🧙‍♂️", winRate: "68%", region: "US-East", badge: "Legend" },
  { name: "FrontendNinja", level: 38, avatar: "🥷", winRate: "72%", region: "EU-West", badge: "Elite" },
  { name: "DevOpsKing", level: 51, avatar: "👑", winRate: "59%", region: "AS-South", badge: "Master" },
  { name: "BugHunter_X", level: 31, avatar: "🕵️", winRate: "61%", region: "US-West", badge: "Gold" },
  { name: "CloudMaster", level: 45, avatar: "☁️", winRate: "65%", region: "SA-East", badge: "Diamond" }
];

const QUESTION_POOL: Question[] = [
  { q: "Which of the following is NOT a React Hook?", options: ["useEffect", "useState", "useComponent", "useContext"], a: "useComponent", tip: "React Hooks always start with 'use' followed by a standard hook name (State, Effect, Memo, etc.). 'useComponent' isn't part of the core API." },
  { q: "What is the Big O complexity of searching in a sorted array using Binary Search?", options: ["O(N)", "O(log N)", "O(N log N)", "O(1)"], a: "O(log N)", tip: "Binary search divides the search interval in half each time, leading to logarithmic time complexity." },
  { q: "In CSS, what does 'z-index' control?", options: ["Color", "Stacking Order", "Font Size", "Width"], a: "Stacking Order", tip: "z-index determines which elements appear 'on top' of others in the 3D stacking context." },
  { q: "Which HTTP method is considered idempotent?", options: ["POST", "GET", "PATCH", "CONNECT"], a: "GET", tip: "Idempotency means multiple identical requests have the same effect as a single request. GET, PUT, and DELETE are idempotent." },
  { q: "What is the default port for PostgreSQL?", options: ["3306", "5432", "8080", "27017"], a: "5432", tip: "5432 is standard for Postgres. 3306 is MySQL, 27017 is MongoDB." },
  { q: "What does the 'A' in ACID stand for in database transactions?", options: ["Availability", "Atomicity", "Accuracy", "Authority"], a: "Atomicity", tip: "Atomicity ensures that all parts of a transaction satisfy the 'all or nothing' principle." },
  { q: "In JavaScript, what is the result of 'typeof []'?", options: ["array", "list", "object", "undefined"], a: "object", tip: "Arrays are technically objects in JavaScript. Use Array.isArray() to check correctly." }
];

export default function ArenaPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userSelected, setUserSelected] = useState<string | null>(null);
  const [matchLog, setMatchLog] = useState<string[]>([]);
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);

  const logRef = useRef<HTMLDivElement>(null);

  // Matchmaking Simulation
  const startMatchmaking = () => {
    setGameState('searching');
    setMatchLog(["Connecting to Global Server...", "Searching for available players...", "Filtering by Elo rating (1200)..."]);
    
    // Pick 5 random questions
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));

    setTimeout(() => {
      setMatchLog(prev => [...prev, "Peer found!", "Synchronizing clocks...", "Ready!"]);
      setTimeout(() => {
        const randomOpponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
        setOpponent(randomOpponent);
        setGameState('battle');
        setCurrentQuestion(0);
        setUserScore(0);
        setOpponentScore(0);
        setOpponentProgress(0);
        setTimeLeft(30);
        setBattleResults([]);
      }, 1000);
    }, 4000);
  };

  // Opponent Simulation Logic
  useEffect(() => {
    if (gameState === 'battle') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             setGameState('results');
             return 0;
          }
          return prev - 1;
        });

        // Simulate opponent answering questions (more realistic)
        setOpponentProgress((prev) => {
           const increment = Math.random() * 5; 
           const next = prev + increment;
           if (next >= 100) return 100;
           return next;
        });

        // Opponent score logic based on their progress
        if (Math.random() > 0.9 && opponentScore < questions.length) {
            setOpponentScore(s => s + 1);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, opponentScore, questions.length]);

  useEffect(() => {
    if (opponentProgress >= 100 && gameState === 'battle') {
        setTimeout(() => setGameState('results'), 1500);
    }
  }, [opponentProgress, gameState]);

  const handleAnswer = (option: string) => {
    if (userSelected) return;
    setUserSelected(option);
    
    const isCorrect = option === questions[currentQuestion].a;
    if (isCorrect) setUserScore(s => s + 1);

    setBattleResults(prev => [...prev, { 
      q: questions[currentQuestion].q, 
      userAns: option, 
      correct: isCorrect 
    }]);

    setTimeout(() => {
       if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(c => c + 1);
          setUserSelected(null);
       } else {
          setGameState('results');
       }
    }, 1200);
  };

  // Scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [matchLog]);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden selection:bg-red-500/30 font-sans">
      
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,rgba(0,0,0,1)_80%)] opacity-60" />
         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-24 animate-[scan_4s_linear_infinite]" />
      </div>

      <NavigationPill className="absolute top-7 left-6 z-[100] text-white scale-75 sm:scale-90 origin-top-left" />

      <AnimatePresence mode="wait">
        
        {/* State: LOBBY */}
        {gameState === 'lobby' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
          >
            <div className="relative group mb-8">
               <div className="absolute inset-0 bg-red-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
               <div className="relative w-28 h-28 bg-gray-900 border-2 border-red-500/30 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden">
                  <span className="text-5xl animate-[wiggle_3s_ease-in-out_infinite]">⚔️</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent" />
               </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter italic">
               THE <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">ARENA</span>
            </h1>
            <p className="text-gray-500 mb-8 md:mb-12 text-center max-w-sm font-bold uppercase tracking-widest text-[8px] md:text-[10px] px-4">Technical Combat • Ranked Battles • Global Leaderboard</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl mb-8 md:mb-12 px-4">
               {[
                 { icon: Flame, label: "Win Streak", val: "0", color: "text-orange-500", bg: "bg-orange-500/10" },
                 { icon: Trophy, label: "Elo Rating", val: "1,200", color: "text-blue-500", bg: "bg-blue-500/10" },
                 { icon: Activity, label: "Global Rank", val: "#421", color: "text-emerald-500", bg: "bg-emerald-500/10", hideOnMobile: true }
               ].map((stat, i) => (
                 <div key={i} className={`bg-gray-900/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 text-center hover:border-white/20 transition-all hover:-translate-y-1 ${stat.hideOnMobile ? 'hidden md:block' : ''}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                       <stat.icon className={stat.color} size={20} />
                    </div>
                    <h3 className="text-[8px] md:text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">{stat.label}</h3>
                    <p className="text-xl md:text-2xl font-black text-white">{stat.val}</p>
                 </div>
               ))}
            </div>

            <button 
               onClick={startMatchmaking}
               className="group relative px-10 py-5 md:px-16 md:py-6 bg-white text-black rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-4 overflow-hidden"
            >
               <span className="relative z-10">ENTER COMBAT</span>
               <ChevronRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* State: SEARCHING */}
        {gameState === 'searching' && (
           <motion.div 
             key="searching"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
           >
              <div className="relative mb-16 scale-125">
                 <div className="w-32 h-32 rounded-full border-[12px] border-red-500/10 border-t-red-600 animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center text-red-500">
                    <Globe className="animate-pulse" size={48} strokeWidth={1.5} />
                 </div>
              </div>
              
              <h2 className="text-3xl font-black mb-2 tracking-tight">Matchmaking...</h2>
              
              <div className="w-full max-w-sm h-32 bg-black/50 border border-white/10 rounded-2xl p-4 font-mono text-[10px] text-emerald-500/80 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar" ref={logRef}>
                    {matchLog.map((log, i) => (
                      <div key={i} className="flex gap-2">
                         <span className="opacity-40">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                         <span>{log}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </motion.div>
        )}

        {/* State: BATTLE */}
        {gameState === 'battle' && (
           <motion.div 
             key="battle"
             initial={{ opacity: 0, scale: 1.05 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex-1 flex flex-col relative z-10"
           >
              <div className="h-20 md:h-28 border-b border-white/5 bg-gray-950/80 backdrop-blur-3xl flex items-center pl-24 pr-4 md:pl-44 md:pr-12 gap-2 md:gap-12">
                 <div className="flex-1 flex items-center gap-3 md:gap-4">
                    <div className="relative shrink-0 scale-75 md:scale-100">
                       <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-2xl shadow-2xl relative z-10">👤</div>
                    </div>
                    <div className="hidden sm:block">
                       <div className="text-sm md:text-xl font-black text-white leading-none">{userScore} <span className="text-gray-500 text-[8px] md:text-[10px] ml-0.5 md:ml-1">PTS</span></div>
                    </div>
                 </div>

                 <div className="flex flex-col items-center justify-center shrink-0 px-1 md:px-8">
                    <div className="relative scale-75 md:scale-100">
                       <svg className="w-16 h-16 md:w-20 md:h-20 -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/5" />
                          <motion.circle 
                            cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none" 
                            className="text-red-500"
                            strokeLinecap="round"
                            initial={{ pathLength: 1 }}
                            animate={{ pathLength: timeLeft / 30 }}
                            transition={{ duration: 1, ease: "linear" }}
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl md:text-2xl font-black font-mono leading-none">{timeLeft}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
                    <div className="hidden sm:block text-right">
                       <div className="text-sm md:text-xl font-black text-white leading-none">{opponentScore} <span className="text-gray-500 text-[8px] md:text-[10px] ml-0.5 md:ml-1">PTS</span></div>
                    </div>
                    <div className="relative shrink-0 scale-75 md:scale-100">
                       <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-800 rounded-xl flex items-center justify-center text-2xl shadow-2xl relative z-10">{opponent?.avatar}</div>
                    </div>
                 </div>
              </div>

              <div className="h-1 flex w-full bg-white/5">
                 <motion.div 
                    className="h-full bg-gradient-to-r from-blue-700 to-blue-400"
                    animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                 />
                 <div className="flex-1" />
                 <motion.div 
                    className="h-full bg-gradient-to-l from-red-700 to-red-400"
                    animate={{ width: `${opponentProgress}%` }}
                 />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
                 <motion.div 
                   key={currentQuestion}
                   initial={{ x: 100, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   className="w-full max-w-4xl space-y-12"
                 >
                    <div className="text-center space-y-4">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] md:text-[10px] font-black uppercase text-gray-400">
                          <Cpu size={12} /> DUEL PHASE {currentQuestion + 1} / {questions.length}
                       </div>
                       <h2 className="text-xl md:text-5xl font-black leading-tight text-white italic px-4">
                          {questions[currentQuestion]?.q}
                       </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 px-4 md:px-0">
                       {questions[currentQuestion]?.options.map((opt, i) => {
                          const isCorrect = userSelected && opt === questions[currentQuestion].a;
                          const isWrong = userSelected === opt && opt !== questions[currentQuestion].a;
                          
                          return (
                             <button
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                disabled={!!userSelected}
                                className={`relative p-5 md:p-8 rounded-2xl md:rounded-[2rem] border-2 font-black text-sm md:text-xl transition-all text-left flex items-center justify-between group overflow-hidden
                                  ${isCorrect ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' : 
                                    isWrong ? 'bg-red-600/20 border-red-500/50 text-red-400' : 
                                    userSelected ? 'bg-gray-900 border-gray-800 text-gray-800' :
                                    'bg-white/5 border-white/5 hover:border-white/20 text-white/80'}
                                `}
                             >
                                <span className="flex gap-3 md:gap-4 items-center">
                                   <span className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-black/40 flex items-center justify-center text-[10px] md:text-xs">
                                      {String.fromCharCode(65 + i)}
                                   </span>
                                   {opt}
                                </span>
                             </button>
                          );
                       })}
                    </div>
                 </motion.div>
              </div>
           </motion.div>
        )}

        {/* State: RESULTS */}
        {gameState === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-start p-6 pt-24 relative z-10 overflow-y-auto custom-scrollbar"
          >
             <div className="w-40 h-40 rounded-full bg-gray-900 flex items-center justify-center text-7xl shadow-2xl relative">
                {userScore >= opponentScore ? "🏆" : "💀"}
             </div>

             <h2 className="text-5xl md:text-7xl font-black mb-2 italic tracking-tighter">
               {userScore > opponentScore ? "DOMINATION" : userScore === opponentScore ? "STALEMATE" : "DEFEATED"}
             </h2>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl my-12">
                {[
                  { label: "XP Gain", val: `+${userScore * 120}`, color: "text-emerald-400", icon: Zap },
                  { label: "Accuracy", val: `${Math.round((userScore / 5) * 100)}%`, color: "text-blue-400", icon: Target },
                  { label: "Rank Change", val: userScore >= opponentScore ? '+32' : '-14', color: "text-indigo-400", icon: TrendingUp },
                  { label: "Credits", val: `+${userScore * 10}`, color: "text-amber-400", icon: Award }
                ].map((s, i) => (
                  <div key={i} className="bg-gray-900/60 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-center group hover:border-white/20 transition-all">
                     <div className={`w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <s.icon className={s.color} size={20} />
                     </div>
                     <div className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-widest">{s.label}</div>
                     <div className={`text-xl md:text-3xl font-black ${s.color}`}>{s.val}</div>
                  </div>
                ))}
             </div>

             <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 mb-16">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-8">Detailed Duel Analysis</h3>
                <div className="space-y-4">
                  {battleResults.map((r, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-black/40 border border-white/5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.correct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {r.correct ? "✓" : "✗"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/90">{r.q}</p>
                        <p className="text-xs text-gray-500">
                          Your answer: <span className={r.correct ? "text-emerald-400" : "text-red-400"}>{r.userAns}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-4 w-full max-w-md pb-20">
                <button 
                  onClick={() => setGameState('lobby')}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase"
                >
                   Lobby
                </button>
                <button 
                  onClick={startMatchmaking}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase"
                >
                   Rematch
                </button>
             </div>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
