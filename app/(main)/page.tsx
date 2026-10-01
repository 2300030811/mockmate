import dynamic from "next/dynamic";
import { FeatureCards } from "@/components/home/FeatureCards";
import { HeroHeader } from "@/components/home/HeroHeader";
import { HomeBackground } from "@/components/home/HomeBackground";
import { HomeCTA } from "@/components/home/HomeCTA";
import { HeroTerminal } from "@/components/home/HeroTerminal";

const BobAssistant = dynamic(
  () => import("@/components/quiz/BobAssistant").then((mod) => mod.BobAssistant),
  { ssr: false }
);

const OnboardingModal = dynamic(
  () => import("@/components/auth/OnboardingModal").then((mod) => mod.OnboardingModal),
  { ssr: false }
);

// Lazy load data components with clean precision skeletons
const DailyProblem = dynamic(
  () => import("@/components/home/DailyProblem").then((mod) => mod.DailyProblem),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 animate-pulse bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg" />
    ),
  }
);

const PersonalizedStats = dynamic(
  () => import("@/components/home/PersonalizedStats").then((mod) => mod.PersonalizedStats),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 animate-pulse bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg" />
    ),
  }
);

const StatsRow = dynamic(
  () => import("@/components/home/StatsRow").then((mod) => mod.StatsRow),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 animate-pulse bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg" />
    ),
  }
);

const ResultsHistory = dynamic(
  () => import("@/components/home/ResultsHistory").then((mod) => mod.ResultsHistory),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg" />
    ),
  }
);

const Leaderboard = dynamic(
  () => import("@/components/home/Leaderboard").then((mod) => mod.Leaderboard),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg" />
    ),
  }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 selection:bg-[#5e6ad2]/20 transition-colors">
      {/* ── 1. ASYMMETRIC HERO SECTION (2-Column Architecture) ── */}
      <section className="relative border-b border-zinc-200 dark:border-[#1e1e2a] overflow-hidden">
        <HomeBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (60%): High-Precision Typography & Action */}
            <div className="lg:col-span-7 space-y-6">
              <HeroHeader />
              <HomeCTA />
            </div>

            {/* Right Column (40%): Live Engine Simulation Terminal */}
            <div className="lg:col-span-5">
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN PLATFORM CONTENT (Locked Vertical Rhythm) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
        {/* Candidate Telemetry (Shown when authenticated) */}
        <PersonalizedStats />

        {/* Bento Engineering Modules Matrix */}
        <FeatureCards />

        {/* Daily Coding Sandbox & Global Candidate Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            <DailyProblem />
          </div>
          <div className="lg:col-span-6">
            <Leaderboard />
          </div>
        </div>

        {/* Recent Candidate Activity & Application Tracker */}
        <ResultsHistory />

        {/* Platform Trust & Engineering Specifications */}
        <StatsRow />
      </main>

      {/* Floating Helpers */}
      <BobAssistant
        key="home-bob"
        customContext="You are Bob, the friendly AI mascot for MockMate. Help users navigate the platform: certification practice (AWS, Azure, Salesforce), KLU placement intelligence, coding arena, and resume roaster."
        initialMessage="Need guidance with your certification prep or placement calendar? Ask me anytime."
      />

      <OnboardingModal />
    </div>
  );
}