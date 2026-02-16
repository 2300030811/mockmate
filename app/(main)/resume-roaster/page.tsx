"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roastResumeAction } from "@/app/actions/resume";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { 
  FileText, 
  Flame, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Sparkles,
  ArrowRight,
  RotateCcw,
  Target,
  Trophy,
  Hammer,
  Layout,
  Star,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Zap,
  Trash2
} from "lucide-react";

const JOB_PRESETS = [
  { label: "Frontend Dev", value: "Senior Frontend Engineer with expertise in React, Next.js, and CSS animations. Focus on UI/UX and performance." },
  { label: "Backend Dev", value: "Backend Engineer specialized in Node.js, PostgreSQL, and system design. Scale-heavy experience required." },
  { label: "Product Manager", value: "Product Manager with 5+ years experience in SaaS, user research, and data-driven roadmapping." },
  { label: "Data Scientist", value: "Data Scientist proficient in Python, PyTorch, and large-scale data modeling. PhD preferred." }
];

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

// Utility to cache voices
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined") {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// Sub-component for Score visualization to reduce main component complexity
const ScoreCard = ({ score, isSpeaking, onSpeak }: { score: number, isSpeaking: boolean, onSpeak: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="lg:col-span-4 bg-gradient-to-br from-orange-600 via-red-600 to-red-700 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative group overflow-hidden"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-30 animate-pulse" />
    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-orange-100/70 mb-2">Hireability Score</span>
    <div className="relative z-10 text-8xl font-black text-white mb-6 tabular-nums">{score}</div>
    
    <div className="relative z-10 w-full px-4 mb-6">
      <div className="w-full h-3 bg-black/30 rounded-full p-1 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
          className="h-full bg-white rounded-full shadow-[0_0_20px_white]"
        />
      </div>
    </div>
    <p className="relative z-10 text-[10px] font-black text-orange-100 uppercase italic tracking-widest bg-black/10 px-4 py-1.5 rounded-full mb-4">
      Judge Level: {score > 80 ? 'Elite' : score > 50 ? 'Average Joe' : 'Unemployed Behavior'}
    </p>
    <button 
      onClick={onSpeak}
      className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full transition-all text-xs font-bold ${isSpeaking ? 'bg-white text-orange-600' : 'bg-black/20 text-white hover:bg-black/40'}`}
    >
      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      {isSpeaking ? "STOP ROASTING" : "LISTEN TO ROAST"}
    </button>
  </motion.div>
);

export default function ResumeRoasterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastData, setRoastData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState("Brutal");
  const [completedSuggestions, setCompletedSuggestions] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
  }, []);

  // Save to localStorage when roastData changes
  useEffect(() => {
    if (roastData) {
      localStorage.setItem("last-resume-roast", JSON.stringify(roastData));
    }
  }, [roastData]);

  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRoasting) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isRoasting]);

  const speakRoast = () => {
    if (!roastData?.brutalRoast) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(roastData.brutalRoast);
    
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Male") || v.name.includes("Premium"))) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 0.9; // Slightly lower pitch for more gravity
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const clearHistory = () => {
    localStorage.removeItem("last-resume-roast");
    setRoastData(null);
    setFile(null);
    setJobDescription("");
  };

  const toggleSuggestion = (idx: number) => {
    setCompletedSuggestions(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
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
    }
  };

  const handleRoast = async () => {
    if (!file) return;
    
    setIsRoasting(true);
    setError(null);
    setRoastData(null);
    setLoadingMessageIndex(0);
    setCompletedSuggestions([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await roastResumeAction(formData, jobDescription, selectedTone);
      setRoastData(result.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong during the roast.");
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
${roastData.criticalFlaws.map((f: string, i: number) => `${i + 1}. ${f}`).join("\n")}

Roadmap to Redemption:
${roastData.suggestions.map((s: string, i: number) => `• ${s}`).join("\n")}
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
      <NavigationPill className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 scale-75 origin-top-left sm:scale-100" />
      
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Zone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl group hover:border-orange-500/30 transition-all">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Upload className="text-orange-500" /> 1. Upload Resume
                </h2>
                
                <div className={`relative border-2 border-dashed rounded-2xl p-10 transition-all ${
                  file ? 'border-orange-500 bg-orange-500/5' : 'border-gray-800 hover:border-orange-500/50'
                }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center text-center">
                    {file ? (
                      <>
                        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="text-orange-500" size={32} />
                        </div>
                        <p className="font-bold text-lg mb-1 truncate max-w-xs">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="text-gray-400" size={32} />
                        </div>
                        <p className="font-bold text-lg mb-1">Click or drag PDF</p>
                        <p className="text-sm text-gray-500 italic">Select your &quot;standard&quot; resume</p>
                      </>
                    )}
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Job Description (Optional) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl h-full flex flex-col group hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <Briefcase className="text-blue-500" /> 2. Target Job (Optional)
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {JOB_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setJobDescription(p.value)}
                        className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-lg transition-all"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Paste the job description here to get a tailored roast..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="flex-1 w-full min-h-[160px] bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all mb-4 font-mono text-sm leading-relaxed"
                />
                <button 
                  onClick={() => setJobDescription("")}
                  className="text-[10px] font-black text-gray-600 hover:text-gray-400 self-end uppercase tracking-widest transition-colors"
                >
                  Clear Description
                </button>
              </div>
            </motion.div>

            {/* Roast Settings / Action Button */}
            <div className="lg:col-span-2 space-y-8 pt-8 flex flex-col items-center">
              <div className="bg-gray-900/50 border border-gray-800 p-2 rounded-2xl inline-flex gap-1 backdrop-blur-xl">
                {["Brutal", "Constructive", "Sarcastic"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTone(t)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedTone === t 
                        ? 'bg-orange-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRoast}
                disabled={!file || isRoasting}
                className={`
                  relative group px-12 py-5 rounded-full font-black text-xl transition-all overflow-hidden
                  ${!file ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:scale-105 active:scale-95 shadow-2xl shadow-orange-600/20'}
                `}
              >
                <div className="relative z-10 flex items-center gap-3">
                  {isRoasting ? (
                    <><Sparkles className="animate-spin" /> Roasting...</>
                  ) : (
                    <><Flame size={20} /> FIRE AWAY <ArrowRight /></>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <AnimatePresence mode="wait">
                {isRoasting && (
                  <motion.div
                    key={loadingMessageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 text-orange-400 font-medium italic h-6"
                  >
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Structured Results View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-20"
          >
            {/* Top Score & Verdict Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="lg:col-span-8 bg-gray-900/80 border border-gray-800 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden group hover:border-orange-500/20 transition-colors flex flex-col justify-between"
               >
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Flame size={200} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2">
                        <Flame size={14} className="animate-pulse" /> The Brutal Verdict ({selectedTone})
                      </h2>
                      <button 
                        onClick={speakRoast}
                        className={`p-2 rounded-xl transition-all ${isSpeaking ? 'bg-orange-500 text-white animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                        title={isSpeaking ? "Stop Speaking" : "Listen to Roast"}
                      >
                        {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                    </div>
                    <div className="text-3xl md:text-4xl font-black italic text-white leading-[1.3] drop-shadow-sm mb-12">
                      &quot;{roastData.brutalRoast}&quot;
                    </div>
                  </div>

                  {/* Skill Breakdown Chart */}
                  <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                    {Object.entries(roastData.skillBreakdown || {}).map(([skill, score]: [string, any], idx) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">{skill}</span>
                          <span className="text-sm font-black text-white">{score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ delay: 0.8 + (idx * 0.1) }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
               </motion.div>

               <ScoreCard 
                 score={roastData.professionalScore} 
                 isSpeaking={isSpeaking} 
                 onSpeak={speakRoast} 
               />
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Flaws Card */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="bg-gray-900/50 border border-red-500/10 rounded-[2.5rem] p-8 hover:border-red-500/30 transition-all flex flex-col"
               >
                  <h3 className="text-xl font-bold text-red-400 mb-8 flex items-center gap-3">
                    <AlertCircle size={24} className="text-red-500" /> Critical Flaws
                  </h3>
                  <ul className="space-y-6 flex-1">
                    {roastData.criticalFlaws.map((flaw: string, i: number) => (
                      <li key={i} className="flex gap-4 group/item">
                        <span className="text-red-500/50 shrink-0 font-black text-lg group-hover/item:text-red-500 transition-colors">{i+1}</span>
                        <p className="text-base text-gray-300 leading-relaxed font-medium">{flaw}</p>
                      </li>
                    ))}
                  </ul>
               </motion.div>

               {/* Wins Card */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="bg-gray-900/50 border border-emerald-500/10 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all flex flex-col"
               >
                  <h3 className="text-xl font-bold text-emerald-400 mb-8 flex items-center gap-3">
                    <Trophy size={24} className="text-emerald-500" /> Winning Points
                  </h3>
                  <ul className="space-y-6 flex-1">
                    {roastData.winningPoints.map((win: string, i: number) => (
                      <li key={i} className="flex gap-4 group/item">
                        <span className="text-emerald-500/50 shrink-0 font-black text-lg group-hover/item:text-emerald-500 transition-colors">{i+1}</span>
                        <p className="text-base text-gray-300 leading-relaxed font-medium">{win}</p>
                      </li>
                    ))}
                  </ul>
               </motion.div>

               {/* ATS Analysis */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="bg-gray-900/50 border border-blue-500/10 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all"
               >
                  <h3 className="text-xl font-bold text-blue-400 mb-8 flex items-center gap-3">
                    <Target size={24} className="text-blue-500" /> ATS Survival
                  </h3>
                  <div className="space-y-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black uppercase text-gray-500 block mb-3 tracking-[0.2em]">Suitability Check</span>
                      <div className={`text-2xl font-black uppercase italic ${
                        roastData.atsAnalysis.matchRating === 'High' ? 'text-emerald-400' : 
                        roastData.atsAnalysis.matchRating === 'Medium' ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {roastData.atsAnalysis.matchRating}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase text-gray-400 block tracking-[0.2em]">Hard Skills Missing</span>
                      <div className="flex flex-wrap gap-2">
                        {roastData.atsAnalysis.missingKeywords.map((tag: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold rounded-xl hover:bg-blue-500/20 transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                       <span className="text-[10px] font-black uppercase text-gray-500 block mb-2 tracking-[0.2em]">Formatting Notes</span>
                       <p className="text-xs text-gray-400 leading-relaxed">{roastData.atsAnalysis.formattingIssues}</p>
                    </div>
                  </div>
               </motion.div>
            </div>

            {/* Suggestions Table-like View */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/80 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl"
            >
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                 <h3 className="text-2xl font-black text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Hammer size={24} className="text-white" />
                    </div>
                    Roadmap to Redemption
                 </h3>
                 <div className="flex items-center gap-4">
                   <div className="text-xs font-bold text-gray-500 uppercase">
                     {completedSuggestions.length} / {roastData.suggestions.length} Fixed
                   </div>
                   <button 
                     onClick={copyToClipboard}
                     className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-sm"
                   >
                     {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                     {copied ? 'COPIED!' : 'COPY ROAST'}
                   </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roastData.suggestions.map((s: string, i: number) => {
                    const isDone = completedSuggestions.includes(i);
                    return (
                      <motion.div 
                        key={i} 
                        onClick={() => toggleSuggestion(i)}
                        whileHover={{ x: 5 }}
                        className={`flex gap-5 p-6 rounded-3xl border transition-all cursor-pointer group select-none ${
                          isDone 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-white/5 border-white/5 hover:border-indigo-500/30'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          isDone ? 'bg-emerald-500 text-white' : 'bg-indigo-500/10 text-indigo-400 group-hover:scale-110'
                        }`}>
                          {isDone ? <Check size={24} strokeWidth={3} /> : <Sparkles size={20} />}
                        </div>
                        <p className={`text-base leading-relaxed font-medium transition-all ${
                          isDone ? 'text-gray-400 line-through opacity-50' : 'text-gray-300'
                        }`}>{s}</p>
                      </motion.div>
                    );
                  })}
               </div>
            </motion.div>

            {/* Footer Actions */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10"
            >
               <button 
                 onClick={reset}
                 className="w-full md:w-auto px-12 py-5 bg-gray-900 border border-gray-800 hover:border-white/20 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-105"
               >
                 <RotateCcw size={20} /> ROAST ANOTHER
               </button>
               <Link 
                 href="/arena"
                 className="w-full md:w-auto px-12 py-5 bg-white text-black hover:bg-gray-200 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shadow-white/10"
               >
                 GO TO INTERVIEW ARENA <ArrowRight size={20} />
               </Link>
               <button 
                 onClick={clearHistory}
                 className="w-full md:w-auto px-8 py-5 text-gray-500 hover:text-red-500 rounded-[2rem] font-black text-[10px] flex items-center justify-center gap-3 transition-all uppercase tracking-widest"
               >
                 <Trash2 size={16} /> Clear History
               </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
