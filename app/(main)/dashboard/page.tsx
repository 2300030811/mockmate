"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Map, 
  Target, 
  Trophy, 
  Zap, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  Award,
  Star,
  ArrowRight
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NavigationPill } from "@/components/ui/NavigationPill";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Badge Logic (Mocked based on potential achievements)
  const badges = [
    { id: 1, name: "Early Adopter", icon: <Star className="text-yellow-400" />, unlocked: true, desc: "Joined the platform early." },
    { id: 2, name: "Quiz Master", icon: <Trophy className="text-blue-400" />, unlocked: (data?.stats?.totalTests || 0) >= 5, desc: "Completed 5+ quizzes." },
    { id: 3, name: "Perfectionist", icon: <Target className="text-red-400" />, unlocked: (data?.stats?.avgScore || 0) >= 90, desc: "Maintained 90%+ accuracy." },
    { id: 4, name: "Explorer", icon: <Map className="text-green-400" />, unlocked: (data?.careerPaths?.length || 0) >= 1, desc: "Generated a career roadmap." },
  ];

  useEffect(() => {
    async function fetch() {
      try {
        const result = await getDashboardData();
        if (!result) {
          router.push("/login?redirect=/dashboard");
          return;
        }
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-mono animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-500/30 pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-600/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none group-hover:rotate-6 transition-transform duration-700">
            <User size={200} />
          </div>

          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-4 ring-gray-900 border border-blue-400/30">
             <span className="text-3xl md:text-5xl font-black text-white">
                {data.user.profile.nickname?.[0]?.toUpperCase() || data.user.email?.[0]?.toUpperCase()}
             </span>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
             <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                {data.user.profile.nickname || "Space Cadet"}
             </h1>
             <p className="text-gray-400 text-sm font-mono mb-4 flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                {data.user.email}
             </p>
             <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <Zap size={12} /> Level {Math.floor(data.stats.xp / 100) + 1}
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <Target size={12} /> {data.stats.xp} XP
                </div>
             </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3 z-10">

             <button 
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-600/20"
             >
                Start Practice
             </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
              { label: "Total Quizzes", value: data.stats.totalTests, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Avg. Accuracy", value: `${data.stats.avgScore}%`, icon: Target, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              { label: "Checkpoints", value: data.stats.totalQuestions, icon: Map, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { label: "Best Track", value: data.stats.bestCategory, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
           ].map((stat, i) => (
              <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-md flex flex-col items-center text-center gap-2 group hover:scale-105 transition-transform duration-300`}
              >
                 <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                 <span className="text-2xl font-black text-white">{stat.value}</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</span>
              </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Activity */}
           <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
           >
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <Calendar className="text-blue-500" /> Recent Activity
              </h2>
              
              <div className="space-y-3">
                 {data.recentActivity.length > 0 ? (
                    data.recentActivity.map((act: any, i: number) => (
                       <div key={i} className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/30 p-4 rounded-2xl flex items-center justify-between transition-colors group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 font-bold text-gray-400 group-hover:text-white group-hover:border-blue-500/50 transition-all">
                                {act.score}
                             </div>
                             <div>
                                <p className="font-bold text-white capitalize">{act.category} Quiz</p>
                                <p className="text-xs text-gray-500">{new Date(act.completed_at).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-emerald-400 font-bold text-sm">+{act.score * 10} XP</p>
                             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Completed</p>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="bg-gray-900/30 border border-gray-800 border-dashed p-8 rounded-2xl text-center text-gray-500">
                       <TrendingUp className="mx-auto mb-2 opacity-50" />
                       <p>No recent activity found. Start a quiz!</p>
                    </div>
                 )}
              </div>
           </motion.div>

           {/* Badges & Career Paths */}
           <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
           >
              {/* Badges */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-md">
                 <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <Award size={16} /> Earned Badges
                 </h2>
                 <div className="grid grid-cols-4 gap-2">
                    {badges.map((badge, i) => (
                       <div key={i} className="group relative flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all ${
                             badge.unlocked 
                               ? 'bg-gray-800 text-white shadow-lg shadow-white/5 border border-gray-700' 
                               : 'bg-gray-900 text-gray-700 border border-gray-800 grayscale opacity-50'
                          }`}>
                             {badge.icon}
                          </div>
                          {/* Tooltip */}
                          <div className="absolute top-full mt-2 w-32 p-2 bg-black border border-gray-800 rounded-lg text-center hidden group-hover:block z-20">
                             <p className="text-xs font-bold text-white mb-1">{badge.name}</p>
                             <p className="text-[10px] text-gray-500">{badge.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* saved Paths */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-md h-full">
                 <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <Map size={16} /> Latest Roadmaps
                 </h2>
                 <div className="space-y-3">
                    {data.careerPaths.length > 0 ? (
                       data.careerPaths.map((path: any, i: number) => (
                          <Link href="/career-path" key={i} className="block group">
                             <div className="p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all">
                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{path.job_role}</p>
                                <p className="text-[10px] text-gray-500 truncate">{path.company || "General Path"}</p>
                             </div>
                          </Link>
                       ))
                    ) : (
                       <p className="text-xs text-gray-500 text-center py-4">No roadmaps generated yet.</p>
                    )}
                    <Link href="/career-path" className="block text-center mt-4">
                       <span className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                          Create New <ArrowRight size={12} />
                       </span>
                    </Link>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}

 
