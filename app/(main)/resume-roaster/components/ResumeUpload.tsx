"use client";

import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Briefcase, ArrowRight, Flame, Sparkles } from "lucide-react";

const JOB_PRESETS = [
  { label: "Frontend Dev", value: "Senior Frontend Engineer with expertise in React, Next.js, and CSS animations. Focus on UI/UX and performance." },
  { label: "Backend Dev", value: "Backend Engineer specialized in Node.js, PostgreSQL, and system design. Scale-heavy experience required." },
  { label: "Product Manager", value: "Product Manager with 5+ years experience in SaaS, user research, and data-driven roadmapping." },
  { label: "Data Scientist", value: "Data Scientist proficient in Python, PyTorch, and large-scale data modeling. PhD preferred." }
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
  loadingMessage
}: ResumeUploadProps) {
  return (
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
              onChange={onFileChange}
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

      {/* Job Description */}
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

      {/* Action Button */}
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
          onClick={onRoast}
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
        
        {isRoasting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-orange-400 font-medium italic h-6"
          >
            {loadingMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
}
