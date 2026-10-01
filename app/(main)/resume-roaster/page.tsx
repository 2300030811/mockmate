"use client";

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { roastResumeAction } from "@/app/actions/resume";
import { addCareerPathToTracker } from "@/app/actions/career-ops";
import { Flame, ShieldCheck, Sparkles, Terminal, Volume2, VolumeX } from "lucide-react";

import { ResumeUpload } from "./components/ResumeUpload";
import { RoastResults } from "./components/RoastResults";
import { RoastData } from "./types";
import { hydrateRoastData } from "./utils/hydrateRoastData";
import { useSpeech } from "./hooks/useSpeech";
import { useMemeAudio } from "./hooks/useMemeAudio";
import { useAudio } from "@/components/providers/AudioProvider";
import { HomeBackground } from "@/components/home/HomeBackground";

const LOADING_MESSAGES = [
  "Auditing ATS keyword density against recruiter filters...",
  "Evaluating action verbs and quantifiable impact metrics...",
  "Detecting formatting red flags and multi-column parsing traps...",
  "Calculating the probability of surviving the 6-second initial scan...",
  "Consulting industry rubrics for software engineering benchmarks...",
  "Identifying buzzwords that add zero signal to your profile...",
  "Checking education, project scope, and tenure consistency...",
  "Synthesizing uncompromising, constructive feedback...",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ResumeRoasterPage() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastData, setRoastData] = useState<RoastData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState("Brutal");
  const [completedSuggestions, setCompletedSuggestions] = useState<number[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [trackerFeedback, setTrackerFeedback] = useState<string | null>(null);

  const { isSpeaking, speak, stop } = useSpeech();
  const { playBeforeUpload, playWhileLoading, playAfterLoading, stopAudio } = useMemeAudio();
  const { isAudioEnabled, toggleAudio } = useAudio();

  // Sync mounted state to prevent hydration flicker
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("last-resume-roast");
    if (saved) {
      const hydrated = hydrateRoastData(saved);
      if (hydrated) {
        setRoastData(hydrated);
      } else {
        localStorage.removeItem("last-resume-roast");
      }
    }
    return () => {
      stopAudio();
      stop();
    };
  }, [stopAudio, stop]);

  // Save to localStorage when roastData changes
  useEffect(() => {
    if (roastData) {
      localStorage.setItem("last-resume-roast", JSON.stringify(roastData));
    }
  }, [roastData]);

  // Cycle loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRoasting) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev: number) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRoasting]);

  const clearHistory = () => {
    localStorage.removeItem("last-resume-roast");
    setRoastData(null);
    setFile(null);
    setJobDescription("");
    stop();
  };

  const toggleSuggestion = (idx: number) => {
    setCompletedSuggestions((prev: number[]) =>
      prev.includes(idx) ? prev.filter((i: number) => i !== idx) : [...prev, idx]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File too large. Maximum size is 10MB.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      playBeforeUpload();
    }
  };

  const handleRoast = async () => {
    if (!file) return;

    setIsRoasting(true);
    setError(null);
    setRoastData(null);
    setLoadingMessageIndex(0);
    setCompletedSuggestions([]);
    stop();
    playWhileLoading();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await roastResumeAction(formData, jobDescription, selectedTone);

      if (result.error || !result.data) {
        throw new Error(result.error || "Failed to parse roast. Please try again.");
      }

      setRoastData(result.data);
      playAfterLoading(result.data.professionalScore);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong during the roast.");
      stopAudio();
    } finally {
      setIsRoasting(false);
    }
  };

  const copyToClipboard = () => {
    if (!roastData) return;
    const text = `
🔥 RESUME ROAST VERDICT (${selectedTone} Tone) 🔥
"${roastData.brutalRoast}"

Score: ${roastData.professionalScore}/100
ATS Score: ${roastData.atsAnalysis?.atsScore ?? "N/A"}/100 (${roastData.atsAnalysis?.matchRating ?? "N/A"})
- Format Score: ${roastData.atsAnalysis?.formatScore ?? "N/A"}
- Content Score: ${roastData.atsAnalysis?.contentScore ?? "N/A"}
- Keyword Score: ${roastData.atsAnalysis?.keywordScore ?? "N/A"}

Skill Breakdown:
- Clarity: ${roastData.skillBreakdown?.clarity || 0}%
- Impact: ${roastData.skillBreakdown?.impact || 0}%
- Technical: ${roastData.skillBreakdown?.technical || 0}%
- Layout: ${roastData.skillBreakdown?.layout || 0}%

Critical Flaws:
${roastData.criticalFlaws.map((f, i) => `${i + 1}. ${f}`).join("\n")}

ATS Tips:
${roastData.atsAnalysis?.atsTips?.map((t) => `\u2022 ${t}`).join("\n") ?? "N/A"}

Roadmap to Redemption:
${roastData.suggestions.map((s) => `\u2022 ${s}`).join("\n")}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrack = async () => {
    if (!roastData) return;
    setIsTracking(true);
    setTrackerFeedback(null);

    try {
      const result = await addCareerPathToTracker({
        jobRole: roastData.jobTitle || "Resume Roast Candidate",
        company: roastData.companyName || "General",
        matchScore: roastData.professionalScore,
        atsScore: roastData.atsAnalysis?.atsScore ?? null,
        notes: `Resume Roaster feedback was analyzed for this role using ${selectedTone} tone.`,
      });

      if (result.success) {
        setTrackerFeedback("Saved to tracker!");
        setTimeout(() => setTrackerFeedback(null), 5000);
      } else {
        setError(result.error || "Failed to save to tracker.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while saving.");
    } finally {
      setIsTracking(false);
    }
  };

  const reset = () => {
    setFile(null);
    setRoastData(null);
    setError(null);
    setJobDescription("");
    setCompletedSuggestions([]);
    stop();
  };

  if (!mounted) return <div className="min-h-screen bg-white dark:bg-[#0d0d12]" />;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] selection:bg-[#5e6ad2]/20 transition-colors">
      {/* ── 1. ASYMMETRIC PRECISION HERO SECTION ── */}
      <section className="relative border-b border-zinc-200 dark:border-[#1e1e2a] overflow-hidden">
        <HomeBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="space-y-4 text-left">
            {/* Precision Status Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">
                AI Diagnostic Roaster
              </span>
              <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
              <span>Brutally Honest Resume & ATS Heuristics</span>
            </div>

            {/* Main Display Headline (Solid high-contrast text, no rainbow clip) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-zinc-900 dark:text-[#ebebef] leading-[1.08] max-w-3xl">
              Resume Roaster
            </h1>

            {/* Disciplined Subheading */}
            <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed max-w-2xl font-normal">
              Upload your resume for an uncompromising audit. Uncover ATS parsing traps, weak action verbs, formatting red flags, and tailored fixes to double your interview callback rate.
            </p>

            {/* Telemetry Proof Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500 dark:text-[#5a5a6e]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Multi-tone roast: Brutal • Constructive • Sarcastic</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>ATS keyword & formatting audit</span>
              </div>
              <span>•</span>
              <button
                type="button"
                onClick={toggleAudio}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100/70 hover:bg-zinc-200/70 dark:bg-[#101017] dark:hover:bg-[#181824] text-zinc-700 dark:text-[#a0a0b8] transition-all cursor-pointer group"
                title={isAudioEnabled ? "Click to mute meme audio effects" : "Click to enable meme audio effects"}
              >
                {isAudioEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span>Meme Audio: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">ON</strong></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform" />
                    <span>Meme Audio: <span className="text-zinc-400 font-mono">MUTED</span></span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN PLATFORM CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!roastData ? (
          <ResumeUpload
            file={file}
            onFileChange={handleFileChange}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
            isRoasting={isRoasting}
            onRoast={handleRoast}
            error={error}
            loadingMessage={LOADING_MESSAGES[loadingMessageIndex]}
          />
        ) : (
          <RoastResults
            roastData={roastData}
            selectedTone={selectedTone}
            isSpeaking={isSpeaking}
            onSpeak={() => (isSpeaking ? stop() : speak(roastData.brutalRoast))}
            completedSuggestions={completedSuggestions}
            onToggleSuggestion={toggleSuggestion}
            onCopy={copyToClipboard}
            copied={copied}
            onReset={reset}
            onClearHistory={clearHistory}
            onTrack={handleTrack}
            isTracking={isTracking}
            trackerFeedback={trackerFeedback}
          />
        )}
      </main>
    </div>
  );
}
