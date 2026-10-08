"use client";

import { m } from "framer-motion";
import { 
    Sparkles, 
    ArrowLeft, 
    Code2, 
    Activity, 
    ShieldCheck, 
    Zap, 
    CheckCircle2, 
    Terminal,
    Cpu,
    Award
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative overflow-hidden flex flex-col justify-between selection:bg-[#5e6ad2]/20 font-sans">
      
      {/* 28px Precision Grid Background & Horizon Glow */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-40 dark:opacity-20 text-zinc-400 dark:text-zinc-600"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
          }}
        />
        {/* Horizon illumination line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1px] bg-gradient-to-r from-transparent via-[#5e6ad2]/50 to-transparent" />
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[180px] opacity-25 dark:opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, #5e6ad2 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white transition-colors group"
        >
          <Image
            src="/logo.png"
            alt="MockMate"
            width={28}
            height={28}
            className="w-7 h-7 rounded-lg object-cover shadow-subtle transition-transform group-hover:scale-105"
          />
          <span className="font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">MockMate</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 ml-1">
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </span>
        </Link>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e] shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AUTHENTICATION // ENCRYPTED</span>
        </div>
      </header>

      {/* Main Split Showcase & Form Architecture */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Product Value Showcase & Live Telemetry (7 cols) */}
          <m.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex lg:col-span-7 flex-col pr-4"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wide uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20 mb-4 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
              SIMULATION ENGINE // VOICE & AST CODE EXECUTION
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-[1.15] mb-4">
              The Engineering Cockpit for High-Stakes Tech Interviews
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] max-w-xl leading-relaxed mb-6">
              Practice real-time technical & behavioral simulations with Bob AI. Voice recognition, live sandboxed code execution in 7 languages, and STAR rubric evaluations.
            </p>

            {/* Interactive Telemetry Preview Cockpit Card */}
            <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle mb-6 relative overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-[#1e1e2a]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-300 font-semibold">
                    TRACK 02 // TECHNICAL PRO SIMULATION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">SESSION: ACTIVE • 14m 28s</span>
              </div>

              {/* Dialogue Bubble */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">Bob AI</span>
                  <span className="text-[9.5px] font-mono text-[#5e6ad2] bg-[#5e6ad2]/10 px-1.5 py-0.2 rounded border border-[#5e6ad2]/20">AI Interviewer</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                  &ldquo;I notice your solution runs in O(N log N) using a heap. Could you optimize it to O(N) by applying a sliding window with monotonic deque?&rdquo;
                </p>
              </div>

              {/* Telemetry Metrics Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a]">
                  <span className="text-[9.5px] font-mono text-zinc-400 uppercase block mb-0.5">Cadence</span>
                  <span className="text-xs font-bold text-emerald-500">132 WPM (Optimal)</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a]">
                  <span className="text-[9.5px] font-mono text-zinc-400 uppercase block mb-0.5">STAR Rubric</span>
                  <span className="text-xs font-bold text-[#5e6ad2]">94% Score</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a]">
                  <span className="text-[9.5px] font-mono text-zinc-400 uppercase block mb-0.5">Sandboxed GCC</span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">0.04s Exec</span>
                </div>
              </div>
            </div>

            {/* Three Pillar Capabilities */}
            <div className="grid grid-cols-3 gap-3 text-left">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-md bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5 border border-[#5e6ad2]/20">
                  <Code2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">7 Compilers</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-snug">Sandboxed live AST runtime</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                  <Activity size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">Voice Telemetry</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-snug">WPM & filler word detection</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/20">
                  <Award size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">Certifications</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-snug">AWS & System Design quizzes</p>
                </div>
              </div>
            </div>
          </m.div>

          {/* Right Column: Authentication Card (5 cols) */}
          <m.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-6 sm:p-8 rounded-2xl shadow-xl shadow-zinc-900/5 dark:shadow-black/40 relative">
              
              {/* Card Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 rounded-full mb-3">
                  <Sparkles className="w-3 h-3 text-[#5e6ad2]" />
                  <span className="text-[10px] font-mono font-bold text-[#5e6ad2] uppercase tracking-wider">
                    MockMate Account
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
                  {title}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 max-w-xs mx-auto leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Form Content */}
              <div>
                {children}
              </div>
            </div>
          </m.div>

        </div>
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-600 gap-2 font-mono">
        <div>
          <span>MockMate AI v2.6 // Enterprise Engineering Cockpit</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Cookies</Link>
          <Link href="/refund" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Refund</Link>
          <Link href="/system-design" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">System Architecture</Link>
        </div>
      </footer>

    </div>
  );
}
