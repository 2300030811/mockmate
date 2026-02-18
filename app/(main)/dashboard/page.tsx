"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData } from "@/app/actions/dashboard";
import { ProfileHeader } from "./components/ProfileHeader";
import { StatsGrid } from "./components/StatsGrid";
import { RecentActivity } from "./components/RecentActivity";
import { Badges } from "./components/Badges";
import { CareerPaths } from "./components/CareerPaths";
import { motion } from "framer-motion";

import { DashboardData } from "@/types/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
           {/* Optimized Loading Spinner */}
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-400 font-mono animate-pulse">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-500/30 pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Optimized Background using CSS containment */}
      <div className="fixed inset-0 pointer-events-none contain-strict">
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/5 blur-[120px] will-change-transform" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-600/5 blur-[120px] will-change-transform" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Components decomposed for better render performance */}
        <ProfileHeader data={data} />
        
        <StatsGrid stats={data.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <RecentActivity activity={data.recentActivity} />

           <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
           >
              <Badges stats={data.stats} />
              <CareerPaths paths={data.careerPaths} />
           </motion.div>
        </div>
      </div>
    </div>
  );
}
