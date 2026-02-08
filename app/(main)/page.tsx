"use client";

import { useState } from "react";
import { FeatureCards } from "@/components/home/FeatureCards";
import { HeroHeader } from "@/components/home/HeroHeader";
import { HomeBackground } from "@/components/home/HomeBackground";
import { HomeCTA } from "@/components/home/HomeCTA";
import { StatsRow } from "@/components/home/StatsRow";
import { BobAssistant } from "@/components/quiz/BobAssistant";

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

      <BobAssistant 
        key="home-bob"
        customContext="You are Bob, the friendly AI mascot for MockMate. Help users understand what MockMate is: a platform to practice certification exams (AWS, Azure, Salesforce, etc.) and generate quizzes from PDFs. You are encouraging, fun, and helpful."
        initialMessage="Hi! I'm Bob, your MockMate guide! 🦁 enhancing your learning journey. Ask me anything about our quizzes or features!"
      />

    </div>
  );
}