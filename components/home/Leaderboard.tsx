"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { getLeaderboard } from "@/app/actions/results";
import { Card } from "@/components/ui/Card";

const categories = [
  { id: "aws", name: "AWS", icon: "☁️" },
  { id: "azure", name: "Azure", icon: "🔷" },
  { id: "salesforce", name: "Salesforce", icon: "⚡" },
  { id: "mongodb", name: "MongoDB", icon: "🍃" },
  { id: "oracle", name: "Oracle", icon: "🗄️" },
  { id: "pcap", name: "Python", icon: "🐍" },
];

export function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState("aws");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const results = await getLeaderboard(activeCategory);
      setData(results);
      setLoading(false);
    }
    loadData();
  }, [activeCategory]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-6 h-6 text-gray-300" />;
      case 2: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="mt-20 relative px-4">
      {/* Background Glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Hall of Fame</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Global Leaderboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The top achievers across our most challenging certification tracks.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 p-1 bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 max-w-2xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2
                ${activeCategory === cat.id 
                  ? "bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm ring-1 ring-black/5" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                }
              `}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <Card className="overflow-hidden border-orange-500/20 shadow-2xl shadow-orange-500/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center justify-center gap-4"
                >
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Fetching the best...</p>
                </motion.div>
              ) : data.length > 0 ? (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {data.map((entry, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={`${entry.nickname}-${entry.completed_at}`}
                      className={`
                        flex items-center justify-between p-4 rounded-xl border transition-all group
                        ${index === 0 ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20" : "bg-white/50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10"}
                      `}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center w-8 flex-shrink-0">
                          {getRankIcon(index)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {entry.nickname}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {new Date(entry.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                           <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                            {Math.round((entry.score / entry.total_questions) * 100)}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                          {entry.score}/{entry.total_questions} Questions
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="bg-gray-50/50 dark:bg-white/5 p-4 border-t border-gray-100 dark:border-white/10 flex justify-center">
            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View All Rankings <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
