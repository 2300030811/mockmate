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
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex flex-col items-center justify-center p-4 pt-24 relative overflow-hidden">

      {/* Navigation Pill */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95 group">
          <Home className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
          <span>Home</span>
        </Link>
        <Link href="/demo/history" className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95 group">
          <History className="w-4 h-4 group-hover:text-purple-500 transition-colors" />
          <span>History</span>
        </Link>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-6xl w-full text-center relative z-10">

        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">AI-Powered Mock Interview</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
            Choose Your Interview Track
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Practice with our advanced AI interviewer. Get real-time feedback and improve your skills.
          </p>
        </m.div>

        {/* Interview Type Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {INTERVIEW_TYPES.map((type, index) => (
            <m.button
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => setSelectedType(type.id as "behavioral" | "technical")}
              className={`group relative p-8 rounded-3xl text-left transition-all duration-300 overflow-hidden ${selectedType === type.id
                  ? "scale-105 shadow-2xl ring-2 ring-blue-500 dark:ring-white/50"
                  : "hover:scale-102 shadow-xl hover:shadow-2xl"
                } bg-white dark:bg-transparent`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedType === type.id ? type.hoverGradient : type.gradient
                } opacity-0 dark:opacity-90 transition-all duration-300 ${selectedType === type.id ? 'opacity-10' : ''}`}></div>

              {/* Light Mode Specific Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-5 group-hover:opacity-10 dark:opacity-0 transition-all duration-300`}></div>

              {/* Glass Effect Overlay (Dark Mode) */}
              <div className="absolute inset-0 dark:bg-white/5 dark:backdrop-blur-sm hidden dark:block"></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <type.Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {type.title}
                </h3>

                <p className="text-gray-600 dark:text-white/80 mb-4 leading-relaxed flex-grow">
                  {type.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 dark:bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 dark:text-white border border-gray-200 dark:border-white/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Check Icon */}
                {selectedType === type.id && (
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6 w-8 h-8 bg-blue-600 dark:bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-5 h-5 text-white dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </m.div>
                )}
              </div>
            </m.button>
          ))}
        </div>

        {/* Customization Options */}
        {selectedType && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="max-w-4xl mx-auto mb-12 overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customize Your Interview</h3>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Experience Level</label>
                <div className="flex gap-3">
                  {(["junior", "mid", "senior"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium capitalize transition-all border ${difficulty === level
                          ? "bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                    >
                      {level === "mid" ? "Mid-Level" : level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Topic Focus <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={selectedType === "technical" ? "e.g., React, System Design, AWS, Algorithms..." : "e.g., Leadership, Conflict Resolution, Teamwork..."}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Collapsible Resume & JD Personalization Section */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mt-6 text-left shadow-lg">
              <button
                type="button"
                onClick={() => setShowTailor(!showTailor)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-55/50 dark:hover:bg-gray-800/40 transition-colors border-none outline-none text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                      Tailor Interview with Resume & Job Description
                      <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold px-2 py-0.5 rounded-full border border-purple-500/20">
                        AI Personalized
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Upload your CV and paste a JD to get tailored, role-specific questions and scenarios.
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showTailor ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {showTailor && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-8"
                  >
                    {/* CV & JD Inputs */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: Resume Upload */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Upload Resume (PDF)
                        </label>
                        <ResumeUpload
                          onUpload={handleResumeUpload}
                          onRemove={handleResumeRemove}
                        />
                        {isParsingResume && (
                          <div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400 py-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Parsing and indexing resume...</span>
                          </div>
                        )}
                        {resumeError && (
                          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{resumeError}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: JD Input */}
                      <div className="space-y-4 flex flex-col">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Target Job Description (JD)
                        </label>
                        <textarea
                          value={jdText}
                          onChange={(e) => setJdText(e.target.value)}
                          placeholder="Paste the target job description here..."
                          rows={6}
                          className="w-full flex-1 min-h-[160px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all resize-none"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={handleDistillJd}
                            disabled={!jdText.trim() || isDistillingJd}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                          >
                            {isDistillingJd ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Distilling Job Requirements...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Analyze Job Description</span>
                              </>
                            )}
                          </Button>
                        </div>
                        {jdError && (
                          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{jdError}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Premium Summary HUD */}
                    {(parsedResume || distilledJd) && (
                      <m.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 border border-purple-500/15 dark:border-purple-500/20 rounded-2xl p-6 space-y-6 relative overflow-hidden backdrop-blur-md"
                      >
                        {/* Background subtle glowing circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                          <h4 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            Personalization Engine HUD
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full font-semibold border border-purple-500/15">
                            Status: Tailoring Active
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 text-sm">
                          {/* Resume Summary Column */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-500" />
                              <h5 className="font-bold text-gray-900 dark:text-white">
                                {parsedResume?.name ? `${parsedResume.name}'s Profile` : "Candidate Profile"}
                              </h5>
                            </div>

                            {parsedResume ? (
                              <div className="space-y-3 pl-6 border-l border-purple-500/20">
                                {parsedResume.summary && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-3">
                                    &ldquo;{parsedResume.summary}&rdquo;
                                  </p>
                                )}

                                {((parsedResume.skills && parsedResume.skills.length > 0) || (parsedResume.technologies && parsedResume.technologies.length > 0)) && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">Detected Skills:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {Array.from(new Set([
                                        ...(parsedResume.skills || []),
                                        ...(parsedResume.technologies || [])
                                      ])).slice(0, 10).map((skill: any, i) => (
                                        <span key={i} className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/10">
                                          {skill}
                                        </span>
                                      ))}
                                      {Array.from(new Set([
                                        ...(parsedResume.skills || []),
                                        ...(parsedResume.technologies || [])
                                      ])).length > 10 && (
                                          <span className="text-xs text-gray-400 font-medium px-2 py-0.5">
                                            +{Array.from(new Set([
                                              ...(parsedResume.skills || []),
                                              ...(parsedResume.technologies || [])
                                            ])).length - 10} more
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                )}

                                {parsedResume.experience && parsedResume.experience.length > 0 && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Recent Role:</span>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                      {parsedResume.experience[0].role}
                                      {parsedResume.experience[0].company && ` at ${parsedResume.experience[0].company}`}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic pl-6">Upload resume to view candidate summary.</p>
                            )}
                          </div>

                          {/* JD Summary Column */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-500" />
                              <h5 className="font-bold text-gray-900 dark:text-white">
                                {distilledJd?.title ? distilledJd.title : "Target Role Requirements"}
                              </h5>
                            </div>

                            {distilledJd ? (
                              <div className="space-y-3 pl-6 border-l border-indigo-500/20">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Seniority:</span>
                                  <span className="text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded capitalize font-medium">
                                    {distilledJd.seniority || "mid"}
                                  </span>
                                </div>

                                {distilledJd.skillsRequired && distilledJd.skillsRequired.length > 0 && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">Required Skills:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {distilledJd.skillsRequired.slice(0, 10).map((skill: string, i: number) => (
                                        <span key={i} className="text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/10">
                                          {skill}
                                        </span>
                                      ))}
                                      {distilledJd.skillsRequired.length > 10 && (
                                        <span className="text-xs text-gray-400 font-medium px-2 py-0.5">
                                          +{distilledJd.skillsRequired.length - 10} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {distilledJd.responsibilities && distilledJd.responsibilities.length > 0 && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Key Focus:</span>
                                    <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                      {distilledJd.responsibilities.slice(0, 3).map((resp: string, i: number) => (
                                        <li key={i} className="truncate max-w-[280px]">{resp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic pl-6">Paste and analyze JD to view role details.</p>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            onClick={handleStart}
            disabled={!selectedType}
            variant="primary"
            size="lg"
            className="px-12 py-5"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Interview
              <ArrowRight className={`w-5 h-5 transition-transform ${selectedType ? 'group-hover:translate-x-1' : ''}`} />
            </span>
          </Button>

          {!selectedType && (
            <p className="mt-4 text-sm text-gray-500">
              Please select an interview type to continue
            </p>
          )}
        </m.div>

        {/* Info Footer */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Real-time AI Feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>~15-20 Minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Voice Enabled</span>
          </div>
        </m.div>
      </div>
    </div>
  );
}