"use client";
 
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Trophy, Target, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
 
export function PersonalizedStats() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (user) {
      getDashboardData().then(data => {
        if (data) setStats(data.stats);
        setLoading(false);
      });
    }
  }, [user]);
 
  if (authLoading || !user) return null;
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="w-full max-w-4xl mx-auto mt-12 px-4"
    >
      <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-8">
            <StatItem 
              icon={<Zap className="w-5 h-5 text-yellow-500" />} 
              label="Total XP" 
              value={loading ? "..." : stats?.xp?.toLocaleString() || "0"} 
            />
            <StatItem 
              icon={<Target className="w-5 h-5 text-red-500" />} 
              label="Streak" 
              value={loading ? "..." : `${stats?.streak || 0} Days`} 
            />
            <StatItem 
              icon={<Trophy className="w-5 h-5 text-blue-500" />} 
              label="Quizzes" 
              value={loading ? "..." : stats?.totalTests || "0"} 
            />
          </div>
 
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl"
          >
            Go to Dashboard
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
 
function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center md:items-start">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</span>
    </div>
  );
}
