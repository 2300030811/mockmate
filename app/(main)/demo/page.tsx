"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/providers/providers";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Users, Code2, Home, History, FileText, Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ResumeUpload } from "@/components/career-path/ResumeUpload";
import { parseResumeAction } from "@/app/actions/resume";
import { distillJobDescriptionAction } from "@/app/actions/job";

const INTERVIEW_TYPES = [
  {
    id: "behavioral",
    Icon: Users,
    title: "Behavioral",
    description: "Leadership, teamwork, and conflict resolution scenarios",
    gradient: "from-blue-500 to-cyan-500",
    hoverGradient: "from-blue-600 to-cyan-600",
    features: ["STAR Method", "Soft Skills", "Past Experience"]
  },
  {
    id: "technical",
    Icon: Code2,
    title: "Technical",
    description: "System design, algorithms, and architecture discussions",
    gradient: "from-purple-500 to-pink-500",
    hoverGradient: "from-purple-600 to-pink-600",
    features: ["Coding", "System Design", "Problem Solving"]
  }
] as const;

export default function DemoSelection() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<"behavioral" | "technical" | null>(null);
  const [difficulty, setDifficulty] = useState<"junior" | "mid" | "senior">("mid");
  const [topic, setTopic] = useState("");
  const [voiceConsent, setVoiceConsent] = useState(true);
  const { theme } = useTheme();

  // Personalization States
  const [showTailor, setShowTailor] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [jdText, setJdText] = useState("");
  const [isDistillingJd, setIsDistillingJd] = useState(false);
  const [distilledJd, setDistilledJd] = useState<any>(null);
  const [jdError, setJdError] = useState<string | null>(null);

  const handleResumeUpload = async (file: File) => {
    setIsParsingResume(true);
    setResumeError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await parseResumeAction(formData);
      if (result.error) {
        setResumeError(result.error);
        setParsedResume(null);
      } else {
        setParsedResume(result.data);
      }
    } catch (e) {
      setResumeError("An error occurred while uploading/parsing the resume.");
      setParsedResume(null);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleResumeRemove = () => {
    setParsedResume(null);
    setResumeError(null);
  };

  const handleDistillJd = async () => {
    if (!jdText.trim()) return;
    setIsDistillingJd(true);
    setJdError(null);
    try {
      const result = await distillJobDescriptionAction(jdText);
      if (result.error) {
        setJdError(result.error);
        setDistilledJd(null);
      } else {
        setDistilledJd(result.data);
      }
    } catch (e) {
      setJdError("An error occurred while distilling the job description.");
      setDistilledJd(null);
    } finally {
      setIsDistillingJd(false);
    }
  };

  const handleStart = () => {
    if (selectedType) {
      if (typeof window !== "undefined") {
        if (parsedResume) {
          sessionStorage.setItem("interview-candidate-profile", JSON.stringify({
            schemaVersion: 1,
            ...parsedResume
          }));
        } else {
          sessionStorage.removeItem("interview-candidate-profile");
        }
        if (distilledJd) {
          sessionStorage.setItem("interview-target-role", JSON.stringify({
            schemaVersion: 1,
            ...distilledJd
          }));
        } else {
          sessionStorage.removeItem("interview-target-role");
        }
      }
      const params = new URLSearchParams({ type: selectedType, difficulty });
      if (topic.trim()) params.set("topic", topic.trim());
      router.push(`/demo/session?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 selection:bg-[#5e6ad2]/20 transition-colors relative overflow-hidden">
      {/* 28px Precision Grid Background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-40 dark:opacity-25 text-zinc-400 dark:text-zinc-600"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
          }}
        />
        {/* Subtle Linear-Horizon Top Illumination */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-[#5e6ad2]/50 to-transparent dark:via-[#5e6ad2]/40" />
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[160px] opacity-25 dark:opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, #5e6ad2 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Hero Section */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="flex items-center justify-center gap-2.5 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wide uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
              SIMULATION ENGINE // VOICE & AST CODE EXECUTION
            </div>
            <Link
              href="/demo/history"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] hover:bg-zinc-100 dark:hover:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white transition-colors group"
            >
              <History className="w-3 h-3 text-[#5e6ad2] group-hover:rotate-[-20deg] transition-transform" />
              <span>Past Sessions</span>
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef] mb-3">
            Choose Your Interview Track
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] max-w-2xl mx-auto leading-relaxed">
            Practice high-stakes engineering interviews with Bob AI. Voice recognition, live sandboxed code execution in 7 languages, STAR behavioral rubric evaluations, and comprehensive telemetry diagnostics.
          </p>
        </m.div>

        {/* Track Selection Cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-8 text-left">
          {INTERVIEW_TYPES.map((type, index) => {
            const isSelected = selectedType === type.id;
            return (
              <m.div
                key={type.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                onClick={() => setSelectedType(type.id as "behavioral" | "technical")}
                className={`relative rounded-xl border p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? "border-[#5e6ad2] bg-[#5e6ad2]/[0.03] dark:bg-[#5e6ad2]/[0.06] shadow-sm ring-1 ring-[#5e6ad2]/30"
                    : "border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:border-zinc-300 dark:hover:border-[#2e2e42]"
                }`}
              >
                {/* Accent Sheen */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 ${
                    isSelected ? "bg-[#5e6ad2] opacity-100" : "bg-transparent opacity-0"
                  }`}
                />

                <div>
                  {/* Header Row: Icon + Radio Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/30 text-[#5e6ad2]"
                          : "bg-zinc-100 dark:bg-[#181824] border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e]"
                      }`}
                    >
                      <type.Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-[#5e6ad2] bg-[#5e6ad2] text-white"
                          : "border-zinc-300 dark:border-zinc-700 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Subtitle / Track Tag */}
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                    {type.id === "behavioral" ? "TRACK 01 // COMPETENCY & CULTURE" : "TRACK 02 // CODE & ARCHITECTURE"}
                  </span>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-[#ebebef] mb-2">
                    {type.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed mb-5">
                    {type.description}
                  </p>

                  {/* Competency Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {type.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="pt-4 border-t border-zinc-100 dark:border-[#1e1e2a] flex items-center justify-between text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {type.id === "behavioral" ? "~15-20 min • Voice & Video" : "~20-30 min • Sandboxed Compiler"}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                    {type.id === "behavioral" ? "STAR Rubric" : "7 Languages"}
                  </span>
                </div>
              </m.div>
            );
          })}
        </div>

        {/* Customization Options */}
        {selectedType && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 overflow-hidden text-left"
          >
            <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-5 sm:p-6 space-y-6 shadow-subtle">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
                  Simulation Parameters
                </h3>
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  Target: {selectedType.toUpperCase()}
                </span>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-[#8b8b9e] mb-2.5">
                  Target Seniority Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["junior", "mid", "senior"] as const).map((level) => {
                    const isActive = difficulty === level;
                    const labels: Record<string, string> = {
                      junior: "Junior (L3)",
                      mid: "Mid-Level (L4/L5)",
                      senior: "Senior / Staff (L6+)",
                    };
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                          isActive
                            ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/40 text-[#5e6ad2] font-semibold"
                            : "bg-zinc-50 dark:bg-[#0d0d12] border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] hover:border-zinc-300 dark:hover:border-[#2e2e42]"
                        }`}
                      >
                        {labels[level]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Focus with Quick Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-[#8b8b9e]">
                    Specialized Topic Focus <span className="text-zinc-400 dark:text-zinc-600 font-normal">(optional)</span>
                  </label>
                  {topic && (
                    <button
                      type="button"
                      onClick={() => setTopic("")}
                      className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    selectedType === "technical"
                      ? "e.g., React & Frontend Architecture, System Scaling, Distributed DBs..."
                      : "e.g., STAR Leadership, Cross-Functional Conflict, High-Pressure Deadlines..."
                  }
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] focus:border-[#5e6ad2] transition-all text-xs font-medium"
                />

                {/* Suggested Fast Topic Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 mr-1">Suggestions:</span>
                  {(selectedType === "technical"
                    ? [
                        "System Design & Scaling",
                        "React & Frontend",
                        "Data Structures & Big-O",
                        "Distributed DBs",
                        "AWS & Cloud",
                      ]
                    : [
                        "STAR Leadership",
                        "Cross-Functional Alignment",
                        "Conflict Resolution",
                        "High-Pressure Deadlines",
                      ]
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTopic(suggestion)}
                      className={`text-[10.5px] px-2 py-0.5 rounded border transition-colors ${
                        topic === suggestion
                          ? "bg-[#5e6ad2]/15 text-[#5e6ad2] border-[#5e6ad2]/30 font-medium"
                          : "bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#2e2e42]"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Collapsible Resume & JD Personalization Section */}
            <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl overflow-hidden mt-4 text-left shadow-subtle">
              <button
                type="button"
                onClick={() => setShowTailor(!showTailor)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-zinc-50/70 dark:hover:bg-[#181826] transition-colors border-none outline-none text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center shrink-0 text-[#5e6ad2]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#ebebef] flex items-center gap-2 flex-wrap">
                      Personalize with Resume & Job Description
                      <span className="text-[10px] font-mono bg-[#5e6ad2]/10 text-[#5e6ad2] font-semibold px-2 py-0.5 rounded border border-[#5e6ad2]/20">
                        AI TAILORED
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                      Upload your CV and paste a target role to get questions custom-tailored to your actual background.
                    </p>
                  </div>
                </div>
                <div className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                  {showTailor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {showTailor && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-zinc-200 dark:border-[#1e1e2a] p-4 sm:p-6 space-y-6"
                  >
                    {/* CV & JD Inputs */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left: Resume Upload */}
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Upload Resume (PDF)
                        </label>
                        <ResumeUpload onUpload={handleResumeUpload} onRemove={handleResumeRemove} />
                        {isParsingResume && (
                          <div className="flex items-center justify-center gap-2 text-xs text-[#5e6ad2] py-2.5 bg-[#5e6ad2]/5 rounded-lg border border-[#5e6ad2]/15">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Parsing and indexing resume...</span>
                          </div>
                        )}
                        {resumeError && (
                          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/5 p-2.5 rounded-lg border border-red-500/15">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{resumeError}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: JD Input */}
                      <div className="space-y-3 flex flex-col">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Target Job Description (JD)
                        </label>
                        <textarea
                          value={jdText}
                          onChange={(e) => setJdText(e.target.value)}
                          placeholder="Paste target job description or requirements here..."
                          rows={5}
                          className="w-full flex-1 min-h-[140px] px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] focus:border-[#5e6ad2] transition-all resize-none text-xs"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={handleDistillJd}
                            disabled={!jdText.trim() || isDistillingJd}
                            className="bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-subtle py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {isDistillingJd ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Distilling Requirements...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Analyze Job Description</span>
                              </>
                            )}
                          </Button>
                        </div>
                        {jdError && (
                          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/5 p-2.5 rounded-lg border border-red-500/15">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{jdError}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personalization HUD */}
                    {(parsedResume || distilledJd) && (
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-2.5">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2]" />
                            Candidate Personalization Engine
                          </h4>
                          <span className="text-[10px] font-mono text-[#5e6ad2] bg-[#5e6ad2]/10 px-2 py-0.5 rounded border border-[#5e6ad2]/20 font-medium">
                            Status: Active Profile
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 text-xs">
                          {/* Resume Summary */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                              <FileText className="w-3.5 h-3.5 text-[#5e6ad2]" />
                              <span>{parsedResume?.name ? `${parsedResume.name}'s Profile` : "Candidate Background"}</span>
                            </div>

                            {parsedResume ? (
                              <div className="space-y-2 pl-4 border-l border-zinc-200 dark:border-[#1e1e2a]">
                                {parsedResume.summary && (
                                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] italic line-clamp-2">
                                    &ldquo;{parsedResume.summary}&rdquo;
                                  </p>
                                )}

                                {((parsedResume.skills && parsedResume.skills.length > 0) ||
                                  (parsedResume.technologies && parsedResume.technologies.length > 0)) && (
                                  <div>
                                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block mb-1">
                                      Detected Skills:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {Array.from(
                                        new Set([
                                          ...(parsedResume.skills || []),
                                          ...(parsedResume.technologies || []),
                                        ])
                                      )
                                        .slice(0, 8)
                                        .map((skill: any, i) => (
                                          <span
                                            key={i}
                                            className="text-[10px] font-mono bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-[#1e1e2a]"
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-zinc-400 italic pl-4">Upload resume to view parsed profile summary.</p>
                            )}
                          </div>

                          {/* JD Summary */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                              <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2]" />
                              <span>{distilledJd?.title ? distilledJd.title : "Target Role Focus"}</span>
                            </div>

                            {distilledJd ? (
                              <div className="space-y-2 pl-4 border-l border-zinc-200 dark:border-[#1e1e2a]">
                                {distilledJd.seniority && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400">Seniority:</span>
                                    <span className="text-[10px] font-mono uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] px-1.5 py-0.5 rounded font-medium">
                                      {distilledJd.seniority}
                                    </span>
                                  </div>
                                )}

                                {distilledJd.skillsRequired && distilledJd.skillsRequired.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-1">Required Skills:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {distilledJd.skillsRequired.slice(0, 8).map((skill: string, i: number) => (
                                        <span
                                          key={i}
                                          className="text-[10px] font-mono bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-[#1e1e2a]"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-zinc-400 italic pl-4">Paste JD to preview key requirements.</p>
                            )}
                          </div>
                        </div>
                      </m.div>
                    )}
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        )}

        {/* Start Button */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="text-center pt-2"
        >
          {/* India DPDP Act (2023) Voice & AI Consent Notice */}
          <div className="max-w-lg mx-auto mb-5 p-3 rounded-xl bg-zinc-50 dark:bg-[#12121a] border border-zinc-200 dark:border-[#1e1e2a] flex items-start gap-2.5 text-left">
            <input
              id="dpdp-voice-consent"
              type="checkbox"
              checked={voiceConsent}
              onChange={(e) => setVoiceConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#5e6ad2] focus:ring-[#5e6ad2] cursor-pointer"
            />
            <label
              htmlFor="dpdp-voice-consent"
              className="text-[11px] leading-relaxed text-zinc-500 dark:text-[#8b8b9e] cursor-pointer select-none"
            >
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">DPDP Act (2023) Audio Consent:</span> I consent to live speech transcription via Azure Cognitive Services Speech SDK and generative orchestration via Gemini 2.0 / Groq. Voice audio is streamed ephemerally without persistent recording and never used for model training. See{" "}
              <Link href="/privacy" target="_blank" className="text-[#5e6ad2] underline hover:text-[#4d59be]">
                Privacy Policy
              </Link>.
            </label>
          </div>

          <Button
            onClick={handleStart}
            disabled={!selectedType || !voiceConsent}
            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all shadow-subtle ${
              selectedType && voiceConsent
                ? "bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white hover:scale-[1.01] active:scale-[0.99]"
                : "bg-zinc-200 dark:bg-[#1e1e2a] text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            <span className="flex items-center gap-2">
              Launch Interview Simulation
              <ArrowRight className={`w-4 h-4 transition-transform ${selectedType && voiceConsent ? "group-hover:translate-x-1" : ""}`} />
            </span>
          </Button>

          {!selectedType ? (
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              Select an interview track above to configure and launch your simulation
            </p>
          ) : (
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Microphone access required for real-time speech telemetry
            </p>
          )}
        </m.div>

        {/* Platform Telemetry Specifications */}
        <div className="mt-14 pt-8 border-t border-zinc-200 dark:border-[#1e1e2a] grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                Real-Time Voice & VAD
              </h4>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
              Azure Speech SDK and Web Speech API with adaptive noise cancellation and volume visualizer.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                Sandboxed Code Execution
              </h4>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
              Multi-language isolated runtime supporting C, C++, Python, JavaScript, TypeScript, SQL, and CSS.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                Rubric Telemetry & Report
              </h4>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
              Post-interview metrics: WPM cadence, vocabulary richness, STAR method detection, and downloadable markdown reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}