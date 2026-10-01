"use client";

import { useState, useEffect } from "react";
import { 
  Moon, 
  Sun, 
  Laptop, 
  Type, 
  Minimize2, 
  MonitorSpeaker, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAudio } from "@/components/providers/AudioProvider";
import { toast } from "sonner";

interface AppearanceTabProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

type FontSize = "small" | "medium" | "large";

export function AppearanceTab({ theme, setTheme }: AppearanceTabProps) {
  const { isAudioEnabled, toggleAudio } = useAudio();
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("mockmate_font_size") as FontSize | null;
    const savedReducedMotion = localStorage.getItem("mockmate_reduced_motion");
    const savedCompactMode = localStorage.getItem("mockmate_compact_mode");

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedReducedMotion === "true") setReducedMotion(true);
    if (savedCompactMode === "true") setCompactMode(true);
  }, []);

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem("mockmate_font_size", size);
    document.documentElement.dataset.fontSize = size;
  };

  const handleReducedMotion = () => {
    const newVal = !reducedMotion;
    setReducedMotion(newVal);
    localStorage.setItem("mockmate_reduced_motion", String(newVal));
    document.documentElement.dataset.reducedMotion = String(newVal);
    toast.success(newVal ? "Reduced motion enabled" : "Full animation motion enabled");
  };

  const handleCompactMode = () => {
    const newVal = !compactMode;
    setCompactMode(newVal);
    localStorage.setItem("mockmate_compact_mode", String(newVal));
    document.documentElement.dataset.compactMode = String(newVal);
    toast.success(newVal ? "Compact density enabled" : "Standard spacing enabled");
  };

  const playTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
      toast.success("Audio test chime played");
    } catch {
      toast.info("Audio test: Sound effects are active");
    }
  };

  const themeOptions = [
    {
      id: "system",
      name: "System Auto",
      description: "Sync with OS theme",
      icon: Laptop,
    },
    {
      id: "light",
      name: "Crisp Light",
      description: "Clean paper white",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Obsidian Dark",
      description: "OLED black & indigo",
      icon: Moon,
    },
  ];

  return (
    <Card className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-subtle overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-[#1e1e2a]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5e6ad2]" />
              Appearance & Environment
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Customize visual color schemes, audio feedback, text scale, and motion preferences.
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-xs font-mono">
            <span>Current: {theme || "system"}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Theme Visual Selectors */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] uppercase tracking-wide">
            Color Palette & Interface Theme
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id || (!theme && opt.id === "system");

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-150 relative ${
                    isSelected
                      ? "border-[#5e6ad2] bg-[#5e6ad2]/5 dark:bg-[#5e6ad2]/10 ring-1 ring-[#5e6ad2] shadow-xs"
                      : "border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] hover:border-zinc-300 dark:hover:border-[#28283a] text-zinc-600 dark:text-[#8b8b9e]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? "bg-[#5e6ad2] text-white shadow-xs"
                          : "bg-zinc-200/60 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#5e6ad2] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] leading-tight">
                    {opt.name}
                  </div>
                  <div className="text-[10.5px] text-zinc-500 dark:text-[#5a5a6e] mt-0.5">
                    {opt.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio & Sound Feedback Card */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/60 dark:bg-[#11111a] p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isAudioEnabled
                  ? "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#7f8cf8]"
                  : "bg-zinc-200/60 dark:bg-[#181824] text-zinc-400"
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
                <span>Sound Effects & Audio Feedback</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono ${
                    isAudioEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-200/60 dark:bg-[#1e1e2a] text-zinc-500"
                  }`}
                >
                  {isAudioEnabled ? "ON" : "MUTED"}
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                Play responsive sound cues for quiz answers, interview coach feedback, and milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isAudioEnabled && (
              <button
                type="button"
                onClick={playTestChime}
                className="px-2 py-0.5 text-[10.5px] font-mono rounded border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#161622] hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] text-zinc-700 dark:text-[#ebebef] transition-colors"
              >
                Test Sound
              </button>
            )}

            <button
              type="button"
              role="switch"
              aria-checked={isAudioEnabled}
              aria-label="Toggle Sound Effects"
              onClick={toggleAudio}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAudioEnabled ? "bg-[#5e6ad2]" : "bg-zinc-300 dark:bg-[#28283a]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAudioEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Font Scale Control with Live Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] uppercase tracking-wide flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-[#5e6ad2]" />
              Typography Scale
            </label>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
              Active: {fontSize}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["small", "medium", "large"] as FontSize[]).map((size) => {
              const isSelected = fontSize === size;
              const labels = {
                small: "Compact (14px)",
                medium: "Default (16px)",
                large: "Spacious (18px)",
              };

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleFontSizeChange(size)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all border ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-[#ebebef] dark:text-[#0d0d12] border-transparent shadow-xs"
                      : "bg-zinc-50 dark:bg-[#11111a] border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-100 dark:hover:bg-[#161622] hover:text-zinc-900 dark:hover:text-white"
                  }`}
                  aria-pressed={isSelected}
                >
                  {labels[size]}
                </button>
              );
            })}
          </div>

          {/* Real-time typography preview */}
          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] font-mono text-xs text-zinc-600 dark:text-[#8b8b9e]">
            <span className="text-zinc-400 dark:text-[#5a5a6e] mr-2 text-[10px] uppercase">
              Render Preview:
            </span>
            <span
              className={
                fontSize === "small"
                  ? "text-[12px]"
                  : fontSize === "large"
                  ? "text-[15px]"
                  : "text-[13px]"
              }
            >
              The quick brown fox jumps over the lazy dog. // MockMate Engine
            </span>
          </div>
        </div>

        {/* Accessibility & Density Controls */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] uppercase tracking-wide">
            Accessibility & Layout Density
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Reduced Motion */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                  <MonitorSpeaker className="w-3.5 h-3.5 text-[#5e6ad2]" />
                  <span>Reduced Motion</span>
                </div>
                <p className="text-[10.5px] text-zinc-500 dark:text-[#8b8b9e] leading-snug">
                  Minimizes transitions and floating particles.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={reducedMotion}
                aria-label="Toggle Reduced Motion"
                onClick={handleReducedMotion}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  reducedMotion ? "bg-[#5e6ad2]" : "bg-zinc-300 dark:bg-[#28283a]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    reducedMotion ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Compact Mode */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Compact Density</span>
                </div>
                <p className="text-[10.5px] text-zinc-500 dark:text-[#8b8b9e] leading-snug">
                  Condenses spacing for multi-window focus.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={compactMode}
                aria-label="Toggle Compact Mode"
                onClick={handleCompactMode}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  compactMode ? "bg-[#5e6ad2]" : "bg-zinc-300 dark:bg-[#28283a]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    compactMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

