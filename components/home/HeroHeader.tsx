"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Terminal, ShieldCheck } from "lucide-react";

export function HeroHeader() {
  const { profile, user } = useAuth();
  const nickname =
    profile?.nickname ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nickname ||
    user?.email?.split("@")[0];

  return (
    <div className="w-full text-left space-y-4">
      {/* Precision Status Pill */}
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[11px] font-medium tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 dark:bg-emerald-400/80 animate-pulse" />
        <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">MockMate Intelligence Engine</span>
        <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
        <span>{nickname ? `Active Session: ${nickname}` : "KLU Drive Radar & Cloud Prep"}</span>
      </div>

      {/* Main Display Headline (Solid high-contrast foreground, no rainbow clip) */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold tracking-[-0.035em] text-zinc-900 dark:text-[#ebebef] leading-[1.08] max-w-3xl">
        {nickname ? (
          <>Accelerate your technical mastery and interview readiness.</>
        ) : (
          <>The High-Precision Technical Interview & Certification Engine.</>
        )}
      </h1>

      {/* Disciplined Subheading */}
      <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed max-w-2xl font-normal">
        {nickname
          ? "Your curriculum and recruitment timeline are live. Continue with voice-powered mock interviews, verified AWS/Azure certification tracks, and live coding challenges."
          : "Autonomous AI interview rounds with rubric-based feedback, 2,400+ verified cloud certification questions, interactive system design canvas, and real-time KLU placement telemetry."}
      </p>

      {/* Telemetry Proof Strip */}
      <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500 dark:text-[#5a5a6e]">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#5e6ad2]" />
          <span>Multi-file code sandboxes</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AWS • Azure • Salesforce verified dumps</span>
        </div>
        <span>•</span>
        <span>10-Year historical KLU placement analytics</span>
      </div>
    </div>
  );
}
