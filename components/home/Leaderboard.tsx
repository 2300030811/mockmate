"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Loader2, Sparkles, ChevronRight, Clock, Flame, Shield, Zap } from "lucide-react";
import { getLeaderboard, deleteQuizResult } from "@/app/actions/results";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/providers/auth-provider";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { LeaderboardItem } from "@/types/dashboard";

const categories = [
  { id: "aws", name: "AWS", icon: "☁️" },
  { id: "azure", name: "Azure", icon: "🔷" },
  { id: "salesforce", name: "Salesforce", icon: "⚡" },
  { id: "mongodb", name: "MongoDB", icon: "🍃" },
  { id: "oracle", name: "Oracle", icon: "🗄️" },
  { id: "pcap", name: "Python", icon: "🐍" },
];

type Timeframe = 'weekly' | 'all-time';

export function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState("aws");
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await getLeaderboard(activeCategory, timeframe);
    setData(results);
    setLoading(false);
  }, [activeCategory, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Weekly Countdown Timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setHours(23, 59, 59, 999);
      
      const diff = nextSunday.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setTimeLeft(`${days}d ${hours}h`);
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the leaderboard?`)) return;
    
    const res = await deleteQuizResult(id);
    if (res.success) {
        toast.success("Result removed from leaderboard");
        loadData();
    } else {
        toast.error("Failed to remove result");
    }
  };

  const getRankTier = (index: number, percentage: number) => {
    if (percentage < 40) return { name: "Bronze", color: "text-orange-700 dark:text-orange-500", bg: "bg-orange-700/10 border-orange-700/20", icon: Zap };
    
    if (index < 3 && percentage >= 80) return { name: "Diamond", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20", icon: Crown };
    if (index < 10 && percentage >= 60) return { name: "Platinum", color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/20", icon: Shield };
    if (index < 25 && percentage >= 40) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: Medal };
    
    return { name: "Silver", color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/20", icon: Zap };
  };

  return (
    <div className="mt-20 relative px-4">
      {/* Background Glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">The Arena</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Global Rankings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            Compete for glory in our <span className="font-bold text-blue-500">Weekly Seasons</span>
          </p>
        </div>

        {/* Timeframe & Category Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/50 dark:bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-gray-200 dark:border-white/10 max-w-3xl mx-auto">
            
            {/* Timeframe Toggles */}
            <div className="flex p-1 bg-gray-100 dark:bg-black/20 rounded-xl">
                <button
                    onClick={() => setTimeframe('weekly')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${timeframe === 'weekly' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    <Flame className={`w-4 h-4 ${timeframe === 'weekly' ? 'text-orange-500' : ''}`} />
                    This Week
                </button>
                <button
                    onClick={() => setTimeframe('all-time')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${timeframe === 'all-time' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    <Trophy className={`w-4 h-4 ${timeframe === 'all-time' ? 'text-yellow-500' : ''}`} />
                    All Time
                </button>
            </div>

            {/* Category Tabs (Simplified for mobile) */}
            <select 
                value={activeCategory} 
                onChange={(e) => setActiveCategory(e.target.value)}
                className="md:hidden w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium"
            >
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>

            <div className="hidden md:flex flex-wrap justify-center gap-1" role="tablist">
            {categories.map((cat) => (
                <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={activeCategory === cat.id}
                aria-controls="leaderboard-panel"
                className={`
                    px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5
                    ${activeCategory === cat.id 
                    ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/20" 
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                    }
                `}
                >
                <span>{cat.icon}</span>
                {cat.name}
                </button>
            ))}
            </div>
        </div>

        {/* Season Timer Banner */}
        {timeframe === 'weekly' && (
             <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        Season ends in: <span className="font-mono">{timeLeft}</span>
                    </span>
                </div>
            </div>
        )}

        {/* Content Area */}
        <Card className="overflow-hidden border-orange-500/20 shadow-2xl shadow-orange-500/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl" id="leaderboard-panel" role="tabpanel">
          <div className="p-2 md:p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <m.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center justify-center gap-4"
                >
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Fetching the best...</p>
                </m.div>
              ) : data.length > 0 ? (
                <m.ol 
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 list-none"
                >
                  {data.map((entry, index) => {
                    const percentage = Math.round((entry.score / entry.total_questions) * 100);
                    const tier = getRankTier(index, percentage);
                    const TierIcon = tier.icon;
                    return (
                        <m.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={`${entry.nickname}-${entry.completed_at}`}
                        className={`
                            flex items-center justify-between p-4 rounded-xl border transition-all group relative overflow-hidden
                            ${timeframe === 'weekly' ? tier.bg : 'bg-white/50 dark:bg-white/5 border-gray-100 dark:border-white/5 box-shadow-sm'}
                        `}
                        >
                        {timeframe === 'weekly' && index < 3 && (
                             <div className={`absolute top-0 right-0 p-1 opacity-10 pointer-events-none`}>
                                 <TierIcon className="w-24 h-24" />
                             </div>
                        )}
                        
                        <div className="flex items-center gap-4 min-w-0 z-10">
                            <div className={`flex flex-col items-center justify-center w-10 flex-shrink-0 ${tier.color}`}>
                                <span className="text-lg font-black">{index + 1}</span>
                            </div>
                            
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                        {entry.nickname}
                                    </p>
                                    {timeframe === 'weekly' && (
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${tier.color} bg-black/5 dark:bg-white/5 border-current opacity-70`}>
                                            {tier.name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                    {new Date(entry.completed_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 z-10">
                            <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                                <span className={`text-xl font-black ${tier.color}`}>
                                {Math.round((entry.score / entry.total_questions) * 100)}%
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                {entry.score}/{entry.total_questions} Correct
                            </p>
                            </div>
                            
                            {isAdmin && (
                            <button 
                                onClick={() => handleDelete(entry.id, entry.nickname)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete result"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            )}
                        </div>
                        </m.li>
                    );
                  })}
                </m.ol>
              ) : (
                <m.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300 dark:border-white/10">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No champions yet</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                    Be the first to finish an exam in this category and claim your place!
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="bg-gray-50/50 dark:bg-white/5 p-4 border-t border-gray-100 dark:border-white/10 flex justify-center">
            <Link href="/dashboard" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View All Rankings <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
