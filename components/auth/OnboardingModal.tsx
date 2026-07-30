"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { m, AnimatePresence } from "framer-motion";
import { Trophy, Mic, Swords, Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const CERTS = [
  { id: "aws", name: "AWS Cloud", desc: "Solutions Architect & Cloud Practitioner", icon: "☁️" },
  { id: "azure", name: "Azure Cloud", desc: "AZ-900 & Developer Associate", icon: "🔷" },
  { id: "salesforce", name: "Salesforce", desc: "Administrator & AI Associate", icon: "⚡" },
  { id: "mongodb", name: "MongoDB", desc: "Developer & Database Admin", icon: "🍃" },
] as const;

const MODES = [
  { id: "quizzes", name: "Certification Quizzes", desc: "Practice with 2,400+ real-world questions", icon: Trophy, route: "/certification" },
  { id: "interview", name: "AI Mock Interview", desc: "Simulate real tech interviews with AI feedback", icon: Mic, route: "/demo" },
  { id: "arena", name: "1v1 Technical Arena", desc: "High-speed duels and live leaderboard tracking", icon: Swords, route: "/arena" },
] as const;

export function OnboardingModal({ isOpen: externalIsOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCert, setSelectedCert] = useState("aws");
  const [selectedMode, setSelectedMode] = useState("quizzes");
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show onboarding if user hasn't completed or skipped it before
    const isDone = localStorage.getItem("mockmate_onboarding_completed");
    if (!isDone && externalIsOpen === undefined) {
      const timer = setTimeout(() => setInternalIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [externalIsOpen]);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleFinish = (route?: string) => {
    localStorage.setItem("mockmate_onboarding_completed", "true");
    setInternalIsOpen(false);
    if (onClose) onClose();
    if (route) router.push(route);
  };

  const handleSkip = () => {
    localStorage.setItem("mockmate_onboarding_completed", "true");
    setInternalIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title=""
      description=""
    >
      <div className="py-2 space-y-6">
        {/* Header with Step Dots & Skip */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Welcome to MockMate
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Step {step} of 2
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <m.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                  Which certification are you preparing for?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We&apos;ll tailor your recommendations and daily challenges.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CERTS.map((cert) => {
                  const isSelected = selectedCert === cert.id;
                  return (
                    <button
                      key={cert.id}
                      onClick={() => setSelectedCert(cert.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between relative ${
                        isSelected
                          ? "border-blue-600 bg-blue-500/10 shadow-md"
                          : "border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/10"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-2xl mb-2">{cert.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {cert.name}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                          {cert.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="primary"
                  className="w-full gap-2 h-12 rounded-xl"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </m.div>
          ) : (
            <m.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                  How do you want to start?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pick your primary practice experience. You can switch anytime.
                </p>
              </div>

              <div className="space-y-3">
                {MODES.map((mode) => {
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${
                        isSelected
                          ? "border-blue-600 bg-blue-500/10 shadow-md"
                          : "border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0">
                        <mode.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {mode.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {mode.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="glass"
                  className="gap-2 h-12 rounded-xl px-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    const target = MODES.find((m) => m.id === selectedMode);
                    handleFinish(target?.route);
                  }}
                  variant="primary"
                  className="flex-1 gap-2 h-12 rounded-xl"
                >
                  Get Started <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
