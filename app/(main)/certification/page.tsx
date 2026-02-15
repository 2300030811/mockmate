"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, 
  Database, 
  Zap, 
  Terminal, 
  Code, 
  Sparkles, 
  Map, 
  ChevronDown 
} from "lucide-react";
import { generateRoadmapAction } from "@/app/actions/roadmap";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@/components/providers/providers";
import { BobAssistant } from "@/components/quiz/BobAssistant";
import { NavigationPill } from "@/components/ui/NavigationPill";

// --- Icons ---
const AWSIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
    </svg>
);

const AzureIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
        <path d="M4.2 2h15.6C21 2 22 3 22 4.2v15.6c0 1.2-1 2.2-2.2 2.2H4.2C3 22 2 21 2 19.8V4.2C2 3 3 2 4.2 2zm7.1 14.8L15.6 7l-4.3 8.3-2.1-4-2.1 4L11.3 16.8z" />
    </svg>
);

const SalesforceIcon = () => (
    <Zap className="w-12 h-12" />
);

const OracleIcon = () => (
    <Terminal className="w-12 h-12" />
);

export default function CertificationSelect() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [roadmapGoal, setRoadmapGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapResult, setRoadmapResult] = useState<string | null>(null);

  const handleGenerateRoadmap = async () => {
    if (!roadmapGoal || roadmapGoal.length < 5) return;
    setIsGenerating(true);
    setRoadmapResult(null);
    try {
      const result = await generateRoadmapAction(roadmapGoal, "Beginner to Intermediate");
      setRoadmapResult(result.markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-20 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50"
      }`}
    >
      <NavigationPill className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 scale-75 origin-top-left sm:scale-100" />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-500/20"
          }`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-orange-500/10" : "bg-orange-500/20"
          }`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-5xl md:text-7xl font-extrabold mb-6 text-center ${
            isDark
              ? "bg-gradient-to-r from-white via-cyan-100 to-orange-100 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-gray-900 via-cyan-900 to-orange-900 bg-clip-text text-transparent"
          }`}
        >
          Select Certification
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-center ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Choose a certification path to begin practicing
        </motion.p>

        {/* Certification Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-7xl w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
        >
          {/* AWS Card */}
          <Link
            href="/aws-quiz/mode"
            className="group relative"
            aria-label="Select AWS Certified Cloud Practitioner"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                  }`}
                >
                  <AWSIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  AWS Certified Cloud Practitioner
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Prepare for the foundational AWS certification with comprehensive practice questions.
                </p>

                <span className="inline-flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start AWS Quiz
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Azure Card */}
          <Link
            href="/azure-quiz/mode"
            className="group relative"
            aria-label="Select Azure Fundamentals AZ-900"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                  }`}
                >
                  <AzureIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Azure Fundamentals (AZ-900)
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Microsoft Azure basics and cloud concepts with practice exams.
                </p>

                <span className="inline-flex items-center gap-2 text-cyan-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Azure Quiz
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                </div>
            </div>
          </Link>


          {/* Salesforce Card */}
          <Link
            href="/salesforce-quiz/mode"
            className="group relative"
            aria-label="Select Salesforce Agentforce Specialist"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <SalesforceIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Salesforce Agentforce Specialist
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Salesforce AI agents, prompt building, and Copilot actions.
                </p>

                <span className="inline-flex items-center gap-2 text-blue-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Salesforce Quiz
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* MongoDB Card */}
          <Link
            href="/mongodb-quiz/mode"
            className="group relative"
            aria-label="Select MongoDB Certification"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                  }`}
                >
                  <Database className="w-12 h-12" />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  MongoDB Certification
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Prepare for MongoDB Associate exams with targeted practice questions.
                </p>

                <span className="inline-flex items-center gap-2 text-green-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start MongoDB Quiz
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* PCAP Card */}
          <Link
            href="/pcap-quiz/mode"
            className="group relative"
            aria-label="Select PCAP Python Certification"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Code className="w-12 h-12" />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  PCAP Python Certified Associate
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Python programming with code-centric questions and real-world scenarios.
                </p>

                <span className="inline-flex items-center gap-2 text-blue-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Python Quiz
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Oracle Card */}
          <Link
            href="/oracle-quiz/mode"
            className="group relative"
            aria-label="Select Oracle Certified Associate"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
                  }`}
                >
                  <OracleIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Oracle Certified Associate
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Java and SQL concepts for Oracle certifications.
                </p>

                <span className="inline-flex items-center gap-2 text-red-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Oracle Quiz
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* AI Roadmap Tool */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-4xl w-full mt-32 px-4"
        >
           <div className={`relative p-8 md:p-12 rounded-[3rem] overflow-hidden border ${
             isDark ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
           }`}>
              <div className="absolute -right-20 -top-20 opacity-5">
                 <Map size={300} className="text-indigo-500" />
              </div>
              
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 font-bold text-xs tracking-widest uppercase">
                    <Sparkles size={14} /> AI Powered
                 </div>
                 <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Build Your Custom Learning Path
                 </h2>
                 <p className={`text-lg mb-8 max-w-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tell us your career goal, and our AI will build a personalized certification roadmap just for you.
                 </p>

                 <div className="flex flex-col md:flex-row gap-4">
                    <input 
                       type="text" 
                       placeholder="e.g., I want to become a Senior DevOps Engineer"
                       value={roadmapGoal}
                       onChange={(e) => setRoadmapGoal(e.target.value)}
                       className={`flex-1 px-6 py-4 rounded-2xl border transition-all outline-none text-lg ${
                         isDark 
                          ? 'bg-gray-900/50 border-gray-800 focus:border-indigo-500 text-white' 
                          : 'bg-white border-gray-200 focus:border-indigo-500 text-gray-900'
                       }`}
                    />
                    <button 
                       onClick={handleGenerateRoadmap}
                       disabled={isGenerating || roadmapGoal.length < 5}
                       className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 whitespace-nowrap"
                    >
                       {isGenerating ? <Sparkles className="animate-spin" /> : <Map size={20} />}
                       {isGenerating ? 'Mapping Path...' : 'Generate Roadmap'}
                    </button>
                 </div>

                 <AnimatePresence>
                    {roadmapResult && (
                       <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-12 p-8 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl relative group"
                       >
                          <div className="absolute top-4 right-4 text-gray-700">
                             <Map size={24} />
                          </div>
                          <div className={`prose prose-sm md:prose-base max-w-none ${isDark ? 'prose-invert prose-indigo' : 'prose-indigo'} prose-headings:font-black prose-p:text-gray-300`}>
                             <ReactMarkdown>{roadmapResult}</ReactMarkdown>
                          </div>
                          <button 
                            onClick={() => setRoadmapResult(null)}
                            className="mt-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                          >
                             <ChevronDown className="rotate-180" size={14} /> Clear Result
                          </button>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </motion.div>

        <BobAssistant
          key="career-guide-bob"
          customContext="You are Bob, a helpful career counselor and certification guide for MockMate. Help the user choose the right certification based on their interests. AWS is great for cloud infrastructure, Azure for Microsoft enterprise, Salesforce for CRM/AI integration, MongoDB for databases, and PCAP for programming. Be encouraging!"
          initialMessage="Hi there! Need help choosing a certification? I can help you decide which path is right for your career goals! 🚀"
        />
      </div>
    </div>
  );
}
