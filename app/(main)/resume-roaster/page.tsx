"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roastResumeAction } from "@/app/actions/resume";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { Flame } from "lucide-react";

import { ResumeUpload } from "./components/ResumeUpload";
import { RoastResults } from "./components/RoastResults";
import { RoastData } from "./types";
import { useSpeech } from "./hooks/useSpeech";
import { useMemeAudio } from "./hooks/useMemeAudio";

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
  "Wondering why you used Comic Sans in 2026..."
];

export default function ResumeRoasterPage() {
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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("last-resume-roast");
    if (saved) {
      try {
        setRoastData(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("last-resume-roast");
      }
    }
    return () => stopAudio(); // Cleanup on unmount
  }, [stopAudio]);

  // Save to localStorage when roastData changes
  useEffect(() => {
    if (roastData) {
      localStorage.setItem("last-resume-roast", JSON.stringify(roastData));
    }
  }, [roastData]);

  // Cycle loading messages
  useEffect(() => {
    let interval: any;
    if (isRoasting) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev: number) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isRoasting]);

  const clearHistory = () => {
    localStorage.removeItem("last-resume-roast");
    setRoastData(null);
    setFile(null);
    setJobDescription("");
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
    playWhileLoading();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await roastResumeAction(formData, jobDescription, selectedTone);
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

Skill Breakdown:
- Clarity: ${roastData.skillBreakdown?.clarity || 0}%
- Impact: ${roastData.skillBreakdown?.impact || 0}%
- Technical: ${roastData.skillBreakdown?.technical || 0}%
- Layout: ${roastData.skillBreakdown?.layout || 0}%

Critical Flaws:
${roastData.criticalFlaws.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Roadmap to Redemption:
${roastData.suggestions.map((s) => `• ${s}`).join("\n")}
    `;
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
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-orange-500/30">
      <NavigationPill className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 scale-75 origin-top-left sm:scale-100" variant="dark" />

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-6 font-medium text-sm tracking-wider uppercase">
            <Flame size={16} className="animate-bounce" />
            Brutally Honest Analysis
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-orange-100 to-red-200 bg-clip-text text-transparent">
            Resume Roaster
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Upload your resume and get roasted by our AI. We&apos;ll tell you exactly why you aren&apos;t getting those interviews.
          </p>
        </motion.div>

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
            onSpeak={() => speak(roastData.brutalRoast)}
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
