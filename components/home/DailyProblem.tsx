"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, ChevronRight, Zap, Target } from "lucide-react";
import Link from "next/link";

export function DailyProblem() {
  const [problem, setProblem] = useState({
    title: "Array Intersection",
    category: "Algorithms",
    difficulty: "Easy",
    points: 10
  });

  // Mock rotating problem based on day
  useEffect(() => {
    const problems = [
      { title: "Two Sum", category: "Data Structures", difficulty: "Easy", points: 10 },
      { title: "Longest Substring", category: "Strings", difficulty: "Medium", points: 20 },
      { title: "Merge K Lists", category: "Hard", difficulty: "Hard", points: 50 },
      { title: "Valid Palindrome", category: "Strings", difficulty: "Easy", points: 10 },
      { title: "Search in Rotated Array", category: "Algorithms", difficulty: "Medium", points: 25 },
    ];
    const day = new Date().getDate();
    setProblem(problems[day % problems.length]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group mt-12 overflow-hidden rounded-[2rem] border border-gray-800 bg-gray-900/40 backdrop-blur-md p-8 md:p-10"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -mr-32 -mt-32 rounded-full group-hover:bg-blue-600/20 transition-all duration-500" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              Daily Challenge
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Zap size={14} className="fill-current" />
              {problem.points} PTS
            </div>
          </div>
          
          <h2 className="text-3xl font-black mb-3 text-white">
            {problem.title}
          </h2>
          
          <p className="text-gray-400 mb-6 max-w-lg leading-relaxed">
            Sharpen your skills with today&apos;s coding puzzle. Solve it to maintain your streak and climb the leaderboard.
          </p>
          
          <div className="flex flex-wrap gap-3">
             <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs font-medium border border-gray-700">
               {problem.category}
             </span>
             <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
               problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
               problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
               'bg-red-500/10 text-red-400 border-red-500/20'
             }`}>
               {problem.difficulty}
             </span>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <Link 
            href="/daily-challenge" 
            className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-black hover:bg-gray-200 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5 group/btn"
          >
            Solve Now
            <ChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          <p className="text-center md:text-right mt-3 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            3,421 users solved today
          </p>
        </div>
      </div>
      
      {/* Visual Element */}
      <div className="absolute right-10 bottom-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Code2 size={120} />
      </div>
    </motion.div>
  );
}
