"use client";

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { roastResumeAction } from "@/app/actions/resume";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { Flame } from "lucide-react";

import { ResumeUpload } from "./components/ResumeUpload";
import { RoastResults } from "./components/RoastResults";
import { RoastData } from "./types";
import { useSpeech } from "./hooks/useSpeech";
import { useMemeAudio } from "./hooks/useMemeAudio";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
  "Judging your font choice...",
  "Laughing at your 'Fluent in Microsoft Word' skill...",
  "Calculating the probability of you staying at a job for more than 6 months...",
  "Identifying exactly which buzzwords are doing nothing for you...",
  "Consulting with the ghosts of rejected candidates...",
  "Preparing a strictly filtered, organic, non-GMO roast...",
  "Finding out why your GPA is hidden behind that tiny font...",
  "Scanning for signs of actual competence...",
  "Analyzing your 'hobbies' section for personality red flags...",
  "Wondering why you used Comic Sans in 2026...",
  "Cross-referencing your skills with actual job requirements...",
  "Checking if your resume passes the 6-second recruiter test...",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ResumeRoasterPage() {
  const { resolvedTheme } = useTheme();
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

  const { isSpeaking, speak, stop } = useSpeech();
  const { playBeforeUpload, playWhileLoading, playAfterLoading, stopAudio } = useMemeAudio();

  // Sync mounted state to prevent hydration flicker
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load from localStorage on mount (validate shape to handle schema changes)
  useEffect(() => {
    const saved = localStorage.getItem("last-resume-roast");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.professionalScore === "number" &&
          parsed.atsAnalysis &&
          typeof parsed.atsAnalysis.atsScore === "number"
        ) {
          setRoastData(parsed as RoastData);
        } else {
          localStorage.removeItem("last-resume-roast");
        }
      } catch {
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
      }, 3000);
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
    stop(); // Cancel any ongoing speech
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

  const reset = () => {
    setFile(null);
    setRoastData(null);
    setError(null);
    setJobDescription("");
    setCompletedSuggestions([]);
    stop();
  };

  // Prevent flash during hydration
  if (!mounted) return <div className="min-h-screen bg-white dark:bg-gray-950" />;

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("min-h-screen transition-colors duration-500 selection:bg-orange-500/30", isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900")}>
      <NavigationPill showHome showBack={false} />

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse", isDark ? "bg-orange-600/10" : "bg-orange-500/5")} />
        <div className={cn("absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse delay-1000", isDark ? "bg-red-600/10" : "bg-red-500/5")} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-6 font-medium text-sm tracking-wider uppercase">
            <Flame size={16} className="animate-bounce" />
            Brutally Honest Analysis
          </div>
          <h1 className={cn("text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r", isDark ? "from-white via-orange-100 to-red-200" : "from-gray-900 via-orange-600 to-red-600")}>
            Resume Roaster
          </h1>
          <p className={cn("text-xl max-w-2xl mx-auto leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>
            Upload your resume and get roasted by our AI. We&apos;ll tell you exactly why you aren&apos;t getting those interviews.
          </p>
        </m.div>

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
            onSpeak={() => isSpeaking ? stop() : speak(roastData.brutalRoast)}
            completedSuggestions={completedSuggestions}
            onToggleSuggestion={toggleSuggestion}
            onCopy={copyToClipboard}
            copied={copied}
            onReset={reset}
            onClearHistory={clearHistory}
          />
        )}
      </div>
    </div>
  );
}
