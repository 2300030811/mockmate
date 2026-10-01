"use client";

import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Flame,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const MAX_FILE_SIZE_MB = 10;

const JOB_PRESETS = [
  {
    label: "Frontend Dev",
    value:
      "Senior Frontend Engineer with expertise in React, Next.js, TypeScript, and CSS architecture. Focus on UI/UX, Core Web Vitals, web performance, and responsive design. Experience with state management and automated test assertions.",
  },
  {
    label: "Backend Dev",
    value:
      "Backend Engineer specialized in Node.js, Python, PostgreSQL, Redis, and high-throughput system design. Experience with microservices, REST/GraphQL APIs, distributed systems, and cloud infrastructure (AWS/GCP).",
  },
  {
    label: "Full Stack",
    value:
      "Full Stack Developer proficient in React, Node.js, TypeScript, and relational databases. Experience with CI/CD pipelines, Docker, cloud deployment, system architecture, and agile product development.",
  },
  {
    label: "Data Scientist",
    value:
      "Data Scientist proficient in Python, PyTorch, SQL, and predictive modeling. Experience with machine learning pipelines, statistical experimentation, NLP, and large-scale dataset engineering.",
  },
  {
    label: "DevOps / SRE",
    value:
      "DevOps / Cloud Engineer with expertise in AWS, Kubernetes, Terraform, Docker, and CI/CD pipelines. Strong Linux fundamentals, observability tooling, and infrastructure automation experience.",
  },
];

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  selectedTone: string;
  setSelectedTone: (val: string) => void;
  isRoasting: boolean;
  onRoast: () => void;
  error: string | null;
  loadingMessage: string;
}

export function ResumeUpload({
  file,
  onFileChange,
  jobDescription,
  setJobDescription,
  selectedTone,
  setSelectedTone,
  isRoasting,
  onRoast,
  error,
  loadingMessage,
}: ResumeUploadProps) {
  const [dpdpConsent, setDpdpConsent] = useState(true);

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* ── CARD 1: UPLOAD RESUME ── */}
        <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-surface flex flex-col justify-between hover:border-zinc-300 dark:hover:border-[#3a3a52] transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[5px] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
                  1. Upload Resume
                </h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                PDF • Max {MAX_FILE_SIZE_MB}MB
              </span>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 transition-colors flex flex-col items-center justify-center text-center min-h-[190px] ${
                file
                  ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/[0.03]"
                  : "border-zinc-200 dark:border-[#1e1e2a] hover:border-orange-500/40 dark:hover:border-orange-500/40 bg-zinc-50/50 dark:bg-[#0f0f16]/60 cursor-pointer group"
              }`}
            >
              {!file && (
                <input
                  type="file"
                  accept=".pdf"
                  onChange={onFileChange}
                  aria-label="Upload resume PDF file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              )}

              {file ? (
                <>
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2.5">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-zinc-900 dark:text-[#ebebef] truncate max-w-xs mb-0.5">
                    {file.name}
                  </p>
                  <p className="text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Verified PDF
                  </p>
                  <label className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">
                    <RotateCcw className="w-3 h-3" />
                    <span>Choose a different file</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={onFileChange}
                      className="sr-only"
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-zinc-400 dark:text-[#6e6e84] group-hover:text-orange-500 group-hover:scale-105 transition-all mb-3 shadow-subtle">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-sm text-zinc-900 dark:text-[#ebebef] mb-1">
                    Click or drag PDF resume
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
                    Compatible with Single and Multi-page layouts
                  </p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-3 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-mono">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── CARD 2: TARGET JOB DESCRIPTION ── */}
        <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-surface flex flex-col justify-between hover:border-zinc-300 dark:hover:border-[#3a3a52] transition-colors">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[5px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
                  2. Target Job Description
                </h2>
              </div>
              <span className="text-[9.5px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Recommended
              </span>
            </div>

            {/* Quick Fill Role Presets (Wrap as clean chips without overflow/scrollbar) */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] mr-0.5">
                Quick fill:
              </span>
              {JOB_PRESETS.map((p) => {
                const isSelected = jobDescription === p.value;
                return (
                  <button
                    key={p.label}
                    onClick={() => setJobDescription(p.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                      isSelected
                        ? "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#ebebef] border-[#5e6ad2]/40 font-semibold"
                        : "bg-zinc-50 dark:bg-[#101017] text-zinc-600 dark:text-[#8b8b9e] border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <textarea
              placeholder="Paste the job description here for ATS keyword and rubric alignment..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full flex-1 min-h-[130px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200 dark:border-[#1a1a26] focus:border-[#5e6ad2] dark:focus:border-[#5e6ad2] rounded-lg p-3 text-xs font-mono text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e] resize-none outline-none leading-relaxed transition-colors"
            />

            {/* Bottom Counter & Clear */}
            <div className="flex items-center justify-between text-[10.5px] font-mono text-zinc-400 dark:text-[#5a5a6e] mt-2">
              <span className="truncate mr-2">
                {!jobDescription
                  ? "Without a JD, ATS analysis will evaluate against general industry benchmarks."
                  : `${jobDescription.length} characters parsed`}
              </span>
              {jobDescription && (
                <button
                  onClick={() => setJobDescription("")}
                  className="text-zinc-400 hover:text-rose-500 uppercase tracking-wider transition-colors shrink-0 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR (Tone Segmented Control + Roast Button) ── */}
      <div className="pt-2 flex flex-col items-center gap-4">
        {/* Segmented Tone Selector */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-zinc-100 dark:bg-[#11111a] border border-zinc-200 dark:border-[#1a1a26]">
          {["Brutal", "Constructive", "Sarcastic"].map((t) => {
            const isActive = selectedTone === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTone(t)}
                aria-pressed={isActive}
                className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                {t === "Brutal"
                  ? "🔥 Brutal"
                  : t === "Constructive"
                  ? "🛠️ Constructive"
                  : "🎭 Sarcastic"}
              </button>
            );
          })}
        </div>

        {/* DPDP Act (2023) Consent Notice */}
        <div className="flex items-start gap-2 max-w-md text-left">
          <input
            id="dpdp-roast-consent"
            type="checkbox"
            checked={dpdpConsent}
            onChange={(e) => setDpdpConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
          />
          <label
            htmlFor="dpdp-roast-consent"
            className="text-[11px] leading-relaxed text-zinc-500 dark:text-[#8b8b9e] cursor-pointer select-none"
          >
            I consent under <strong className="text-zinc-700 dark:text-zinc-300 font-medium">DPDP Act (2023)</strong> to ephemeral AI processing. Resumes are analyzed in memory with zero model training. See{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-orange-600 dark:text-orange-400 underline hover:opacity-80"
            >
              Privacy Policy
            </Link>.
          </label>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onRoast}
          disabled={!file || !dpdpConsent || isRoasting}
          aria-label={isRoasting ? "Analyzing resume" : "Start resume analysis"}
          className={`h-11 px-8 rounded-md font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
            !file || !dpdpConsent || isRoasting
              ? "bg-zinc-100 dark:bg-[#14141e] text-zinc-400 dark:text-[#5a5a6e] border border-zinc-200 dark:border-[#1e1e2a] cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-500 text-white shadow-subtle hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          {isRoasting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-orange-200" />
              <span>Analyzing Resume Heuristics...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" />
              <span>Roast My Resume</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Live Loading Feedback */}
        {isRoasting && (
          <div className="w-full max-w-md space-y-2 text-center pt-2">
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-[#14141e] rounded-full overflow-hidden border border-zinc-200 dark:border-[#1e1e2a]">
              <m.div
                animate={{ width: ["0%", "92%"] }}
                transition={{ duration: 12, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              />
            </div>
            <p className="text-xs font-mono text-orange-600 dark:text-orange-400 italic">
              {loadingMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
