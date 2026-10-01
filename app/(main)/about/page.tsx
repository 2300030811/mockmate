import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Github,
  Linkedin,
  Sparkles,
  Code2,
  Users,
  Cpu,
  Layers,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Terminal,
  Activity,
  CheckCircle2,
  Building2,
  Lock,
  Compass,
} from "lucide-react";
import { HomeBackground } from "@/components/home/HomeBackground";

export const metadata: Metadata = {
  title: "About - MockMate | Story, Architecture & Team",
  description:
    "Learn about MockMate's mission, autonomous AI interview architecture, and the engineers who built the platform.",
};

interface TeamMember {
  name: string;
  role: string;
  domainTag: string;
  avatar: string;
  headline: string;
  bio: string;
  areasOfWork: {
    title: string;
    description: string;
  }[];
  technologies: string[];
  github: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Bhima Mahesh Sai",
    role: "Full Stack & AI Systems Developer",
    domainTag: "Core Platform & AI Systems",
    avatar: "/mahesh_avatar.png",
    headline: "Platform architecture, AI pipeline orchestration & core engineering",
    bio: "Full-stack and AI developer who engineered MockMate's core systems from initial architecture to production. Designed the multi-model reasoning gateway that routes between Groq Llama 3.3 and Google Gemini 2.0 Flash, implemented the acoustic speech evaluation engine with Azure Cognitive Services, and built the Placement Hub campus intelligence radar. Also developed the automated ATS resume parser, CareerOps telemetry gates, in-browser code execution sandboxes, and platform security infrastructure.",
    areasOfWork: [
      {
        title: "Multi-Model AI Gateway",
        description:
          "Engineered the low-latency streaming evaluation engine that dynamically orchestrates Groq Llama 3.3 and Gemini 2.0 Flash for comprehensive diagnostic feedback.",
      },
      {
        title: "Acoustic Speech Analysis",
        description:
          "Implemented the Azure Cognitive Speech SDK pipeline to calculate candidate speaking pace, clarity confidence, and filler-word patterns in real-time.",
      },
      {
        title: "Placement Hub & CareerOps",
        description:
          "Architected the campus recruitment radar, automated circular parsing workflow, and predictive scoring state machines to track real-time hiring benchmarks.",
      },
      {
        title: "Full-Stack Architecture & Security",
        description:
          "Designed the Next.js App Router structure, Supabase database schemas with row-level security, Monaco technical code sandboxes, and test coverage across 85+ modules.",
      },
    ],
    technologies: [
      "Next.js 14",
      "TypeScript",
      "Groq Llama 3.3",
      "Gemini 2.0 Flash",
      "Azure Speech SDK",
      "Supabase & RLS",
      "Monaco Sandbox",
      "Placement Radar",
      "Tailwind CSS",
      "CareerOps Engine",
    ],
    github: "https://github.com/2300030811",
    linkedin: "https://www.linkedin.com/in/mahesh-sai-bhima-038243286",
  },
  {
    name: "Kondaveti Tejaswanth",
    role: "Full Stack & Cloud Infrastructure Developer",
    domainTag: "Cloud & Backend Integration",
    avatar: "/tejaswanth_avatar.png",
    headline: "Cloud workflows, backend service integration & system testing",
    bio: "Full-stack developer focused on cloud infrastructure, backend service integrations, and system reliability. Contributed to microservice workflows, cloud deployment pipelines, and API reliability benchmarking. Partnered on integration testing, developer tooling, and cross-platform verification routines to support a stable candidate experience across the platform.",
    areasOfWork: [
      {
        title: "Cloud & Service Integration",
        description:
          "Assisted with cloud infrastructure setup, hosting configurations, and backend service integration workflows across application environments.",
      },
      {
        title: "API Reliability & Testing",
        description:
          "Supported endpoint verification routines, performance benchmarking, and error-handling flows to maintain consistent server communication.",
      },
      {
        title: "DevOps & Developer Tooling",
        description:
          "Contributed to continuous integration pipelines, environment configurations, and verification scripts for platform maintenance.",
      },
    ],
    technologies: [
      "TypeScript",
      "Spring Boot",
      "Cloud Architecture",
      "REST APIs",
      "DevOps & CI/CD",
      "PostgreSQL",
      "System Testing",
      "Git Workflows",
    ],
    github: "https://github.com/ktejaswanth",
    linkedin: "https://www.linkedin.com/in/ktejaswanth/",
  },
];

const platformPillars = [
  {
    icon: Cpu,
    title: "Multi-Model Intelligence",
    description:
      "Dynamically pairs high-throughput Groq inference with Gemini 2.0 reasoning to deliver deep feedback on algorithmic solutions and architectural trade-offs.",
    badge: "Sub-300ms Evaluation",
  },
  {
    icon: Activity,
    title: "Acoustic Telemetry",
    description:
      "Measures speaking pace, clarity confidence, and verbal articulation live through Azure Speech SDK, coaching candidates to communicate like seasoned engineers.",
    badge: "Speech SDK Telemetry",
  },
  {
    icon: Building2,
    title: "Live Campus Intelligence",
    description:
      "Aggregates active campus drives, eligibility thresholds (CGPA, branches), and round-by-round selection intelligence into a unified radar.",
    badge: "Placement Radar",
  },
  {
    icon: Terminal,
    title: "In-Browser Sandboxes",
    description:
      "Monaco and Sandpack sandboxes allow candidates to write, compile, and debug code live while answering architectural follow-ups from the AI.",
    badge: "Isolated Runtimes",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden transition-colors selection:bg-[#5e6ad2]/20 font-sans">
      <HomeBackground />

      <div className="max-w-5xl mx-auto relative z-10 space-y-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
          <Link
            href="/"
            className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> MockMate
          </Link>
          <span>/</span>
          <span className="text-[#5e6ad2] dark:text-[#828df8] font-semibold">About</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8] text-xs font-mono font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>ORIGIN & ENGINEERING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-tight">
            The Story & Architecture Behind{" "}
            <span className="text-[#5e6ad2] dark:text-[#828df8]">MockMate</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            Technical interviews shouldn&apos;t rely on guesswork or generic advice.
            We built MockMate to provide real-time, low-latency interview simulation,
            acoustic sensory evaluation, and actionable campus recruitment intelligence.
          </p>
        </div>

        {/* The Why: Purpose & Philosophy */}
        <div className="rounded-2xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
            <Sparkles className="w-4 h-4 text-[#5e6ad2]" />
            <span>Why We Built MockMate</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
            Bridging the gap between academic study and elite industry benchmarks.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              Campus hiring has transformed into a multifaceted process. Top technology companies
              no longer evaluate candidates purely on written code; they test real-time architectural
              reasoning, verbal articulation, and technical composure under pressure. Most students
              never get the chance to practice answering technical questions out loud before their
              most important interviews.
            </p>
            <p>
              MockMate was conceived to solve this disparity. By combining high-throughput LLM reasoning
              with real-time acoustic speech analysis and live campus placement intelligence, we created
              a platform that listens, evaluates, and coaches students with the precision of an
              experienced engineering lead.
            </p>
          </div>
        </div>

        {/* The Team: Symmetric, Respectful, Natural Depth */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
              <Users className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span>Engineering Team</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
              Platform Builders
            </span>
          </div>

          {/* Symmetrical 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-6 sm:p-7 shadow-xs hover:border-zinc-300 dark:hover:border-[#2a2a3e] transition-all duration-200"
              >
                <div className="space-y-6">
                  {/* Top Profile Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-[#222232] shrink-0 bg-zinc-100 dark:bg-[#101018]">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 72px, 80px"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200/80 dark:border-[#1e1e2a]">
                        {member.domainTag}
                      </span>

                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
                        {member.name}
                      </h3>

                      <p className="text-xs font-semibold text-[#5e6ad2] dark:text-[#828df8]">
                        {member.role}
                      </p>

                      <p className="text-[11px] text-zinc-500 dark:text-[#7a7a8e] italic leading-tight">
                        &quot;{member.headline}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Bio Description */}
                  <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Focus & Technical Development Areas */}
                  <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
                    <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#6a6a7e]">
                      Technical Implementation & Scope
                    </div>

                    <div className="space-y-2.5">
                      {member.areasOfWork.map((area, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="text-xs font-semibold text-zinc-800 dark:text-[#d0d0e0] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] dark:bg-[#828df8] shrink-0" />
                            <span>{area.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] pl-3 leading-relaxed">
                            {area.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technologies Tags */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
                    <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#6a6a7e]">
                      Technologies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-[#181824] text-zinc-700 dark:text-[#c0c0d4] border border-zinc-200/60 dark:border-[#222232]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social & Profile Links */}
                <div className="flex items-center gap-3 pt-5 mt-6 border-t border-zinc-100 dark:border-[#1e1e2a]">
                  <Link
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-[#1e1e2a] transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </Link>

                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-[#1e1e2a] transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Architectural Systems */}
        <div className="space-y-6 pt-4">
          <div className="border-b border-zinc-200 dark:border-[#1e1e2a] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
              <Layers className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span>Platform Systems</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
              Architecture Overview
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 space-y-2.5 transition-colors hover:border-[#5e6ad2]/30 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] flex items-center justify-center border border-[#5e6ad2]/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engineering Standards Callout */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5e6ad2] dark:text-[#828df8]" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
              Built with Strict Engineering Standards
            </h3>
          </div>

          <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            MockMate is engineered with production-grade reliability: comprehensive test suites
            covering API routes, scoring rubrics, and calendar synchronization; strict zero data-retention
            policies with external model providers under the India DPDP Act (2023); and sub-300ms
            end-to-end evaluation latency.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 font-mono text-center text-xs">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/80 dark:border-[#222232]">
              <div className="text-base font-bold text-zinc-900 dark:text-[#ebebef]">85+</div>
              <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Test Modules</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/80 dark:border-[#222232]">
              <div className="text-base font-bold text-[#5e6ad2] dark:text-[#828df8]">114+</div>
              <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Hiring Benchmarks</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/80 dark:border-[#222232]">
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">&lt;300ms</div>
              <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Model Latency</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/80 dark:border-[#222232]">
              <div className="text-base font-bold text-zinc-900 dark:text-[#ebebef]">DPDP</div>
              <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Privacy First</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="p-7 sm:p-9 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-center space-y-3.5 shadow-xs">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-[#ebebef]">
            Ready to test your readiness?
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] max-w-md mx-auto leading-relaxed">
            Run an autonomous AI mock interview session or explore current campus placement benchmarks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/demo"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs bg-[#5e6ad2] hover:bg-[#828df8] text-white shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              Start Interview Simulation
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/placements"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-colors border border-zinc-200 dark:border-[#1e1e2a]"
            >
              <Building2 className="w-3.5 h-3.5" />
              Explore Placement Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
