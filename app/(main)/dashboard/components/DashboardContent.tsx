"use client";

import { ProfileHeader } from "./ProfileHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentActivity } from "./RecentActivity";
import { Badges } from "./Badges";
import { CareerPaths } from "./CareerPaths";
import { CareerOpsTracker } from "./CareerOpsTracker";
import { CareerOpsInsights } from "./CareerOpsInsights";
import { DashboardData } from "@/types/dashboard";

export function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 text-gray-900 dark:text-white selection:bg-blue-500/30 pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none contain-strict">
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] will-change-transform" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-400/10 dark:bg-purple-600/5 blur-[120px] will-change-transform" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        <ProfileHeader data={data} />
        <StatsGrid stats={data.stats} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8">
            <RecentActivity activity={data.recentActivity} />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <Badges stats={data.stats} />
            <CareerPaths paths={data.careerPaths} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <CareerOpsTracker tracker={data.tracker} />
          <CareerOpsInsights insights={data.trackerInsights} />
        </div>
      </div>
    </div>
  );
}
