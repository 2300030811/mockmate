"use client";

import { ProfileHeader } from "./ProfileHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentActivity } from "./RecentActivity";
import { Badges } from "./Badges";
import { CareerPaths } from "./CareerPaths";
import { CareerOpsTracker } from "./CareerOpsTracker";
import { CareerOpsInsights } from "./CareerOpsInsights";
import { JobRadarFeed } from "./JobRadarFeed";
import { HomeBackground } from "@/components/home/HomeBackground";
import { DashboardData } from "@/types/dashboard";

export function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] selection:bg-[#5e6ad2]/20 pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      <HomeBackground />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6 sm:space-y-8">
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

        <JobRadarFeed />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <CareerOpsTracker tracker={data.tracker} />
          <CareerOpsInsights insights={data.trackerInsights} />
        </div>
      </div>
    </div>
  );
}
