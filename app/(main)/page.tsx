"use client";

import { FeatureCards } from "@/components/home/FeatureCards";
import { HeroHeader } from "@/components/home/HeroHeader";
import { HomeBackground } from "@/components/home/HomeBackground";
import { HomeCTA } from "@/components/home/HomeCTA";
import { StatsRow } from "@/components/home/StatsRow";

export default function Home() {
  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 pt-20">
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden -mt-20">
        
        <HomeBackground />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          
          <HeroHeader />

          <FeatureCards />

          <HomeCTA />

          <StatsRow />
          
        </div>
      </div>
    </div>
  );
}