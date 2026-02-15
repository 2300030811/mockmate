"use client";

import { useState } from "react";
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
  Star
} from "lucide-react";

export default function ResumeRoasterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastData, setRoastData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await roastResumeAction(formData, jobDescription);
      setRoastData(result.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong during the roast.");
    } finally {
      setIsRoasting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setRoastData(null);
    setError(null);
    setJobDescription("");
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
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Briefcase className="text-blue-500" /> 2. Target Job (Optional)
                </h2>
                <textarea
                  placeholder="Paste the job description here to get a tailored roast. We'll check if you're actually a match..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="flex-1 w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                />
              </div>
            </motion.div>

            {/* Action Button */}
            <div className="lg:col-span-2 text-center pt-8">
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
              
              <AnimatePresence>
                {isRoasting && (
                  <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mt-6 text-orange-400 font-medium animate-pulse"
                  >
                    Our AI is currently judging your life choices...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Structured Results View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top Score & Verdict Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-gray-900/80 border border-gray-800 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Flame size={120} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                    <Flame size={14} /> The Brutal Verdict
                  </h2>
                  <div className="text-2xl md:text-3xl font-black italic text-white leading-relaxed">
                    &quot;{roastData.brutalRoast}&quot;
                  </div>
               </div>

               <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl shadow-orange-600/20">
                  <span className="text-xs font-black uppercase tracking-widest text-orange-200 mb-2">Professional Score</span>
                  <div className="text-7xl font-black text-white mb-2">{roastData.professionalScore}</div>
                  <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${roastData.professionalScore}%` }}
                      className="h-full bg-white shadow-[0_0_10px_white]"
                    />
                  </div>
                  <p className="mt-4 text-xs font-bold text-orange-100 uppercase italic">Judge Level: Brutal</p>
               </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* Flaws Card */}
               <div className="bg-gray-900/50 border border-red-500/10 rounded-3xl p-6 hover:border-red-500/30 transition-all">
                  <h3 className="text-lg font-bold text-red-400 mb-6 flex items-center gap-3">
                    <AlertCircle size={20} /> 5 Critical Flaws
                  </h3>
                  <ul className="space-y-4">
                    {roastData.criticalFlaws.map((flaw: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300">
                        <span className="text-red-500 shrink-0 font-mono font-bold">{i+1}.</span>
                        {flaw}
                      </li>
                    ))}
                  </ul>
               </div>

               {/* Wins Card */}
               <div className="bg-gray-900/50 border border-emerald-500/10 rounded-3xl p-6 hover:border-emerald-500/30 transition-all">
                  <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-3">
                    <Trophy size={20} /> 5 Winning Points
                  </h3>
                  <ul className="space-y-4">
                    {roastData.winningPoints.map((win: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300">
                        <span className="text-emerald-500 shrink-0 font-mono font-bold">{i+1}.</span>
                        {win}
                      </li>
                    ))}
                  </ul>
               </div>

               {/* ATS Analysis */}
               <div className="bg-gray-900/50 border border-blue-500/10 rounded-3xl p-6 hover:border-blue-500/30 transition-all">
                  <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-3">
                    <Target size={20} /> ATS Survival Check
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-500 block mb-2">Match Probability</span>
                      <div className={`text-sm font-bold uppercase ${
                        roastData.atsAnalysis.matchRating === 'High' ? 'text-emerald-400' : 
                        roastData.atsAnalysis.matchRating === 'Medium' ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {roastData.atsAnalysis.matchRating}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-500 block mb-2">Missing Keywords</span>
                      <div className="flex flex-wrap gap-2">
                        {roastData.atsAnalysis.missingKeywords.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Suggestions Table-like View */}
            <div className="bg-gray-900/80 border border-white/5 rounded-[2.5rem] p-8">
               <h3 className="text-xl font-bold text-indigo-400 mb-8 flex items-center gap-3">
                  <Hammer size={24} /> Roadmap to Redemption
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {roastData.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0 text-indigo-400">
                        <Sparkles size={18} />
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{s}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
               <button 
                 onClick={reset}
                 className="w-full md:w-auto px-10 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all"
               >
                 <RotateCcw size={18} /> ROAST ANOTHER
               </button>
               <Link 
                 href="/arena"
                 className="w-full md:w-auto px-10 py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all"
               >
                 GO TO INTERVIEW ARENA <ArrowRight size={18} />
               </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
