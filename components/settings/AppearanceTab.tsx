"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Type, Minimize2, MonitorSpeaker } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

interface AppearanceTabProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

type FontSize = "small" | "medium" | "large";

export function AppearanceTab({ theme, setTheme }: AppearanceTabProps) {
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
    // Apply to root element
    document.documentElement.dataset.fontSize = size;
  };

  const handleReducedMotion = () => {
    const newVal = !reducedMotion;
    setReducedMotion(newVal);
    localStorage.setItem("mockmate_reduced_motion", String(newVal));
    document.documentElement.dataset.reducedMotion = String(newVal);
  };

  const handleCompactMode = () => {
    const newVal = !compactMode;
    setCompactMode(newVal);
    localStorage.setItem("mockmate_compact_mode", String(newVal));
    document.documentElement.dataset.compactMode = String(newVal);
  };

  return (
    <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Appearance Preferences</CardTitle>
        <CardDescription>
          Customize how MockMate looks on your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-xl dark:bg-gray-800">
              {theme === "dark" ? <Moon className="w-6 h-6 text-indigo-400" /> : <Sun className="w-6 h-6 text-amber-500" />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark themes.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </div>

        {/* Font Size */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-100 p-3 rounded-xl dark:bg-gray-800">
              <Type className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Font Size</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Adjust the text size across the app.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                  fontSize === size
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                aria-pressed={fontSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-xl dark:bg-gray-800">
              <MonitorSpeaker className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Reduced Motion</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Minimize animations for accessibility or preference.
              </p>
            </div>
          </div>
          <button
            onClick={handleReducedMotion}
            role="switch"
            aria-checked={reducedMotion}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              reducedMotion ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                reducedMotion ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Compact Mode */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-xl dark:bg-gray-800">
              <Minimize2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Compact Mode</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reduce spacing for a denser layout.
              </p>
            </div>
          </div>
          <button
            onClick={handleCompactMode}
            role="switch"
            aria-checked={compactMode}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              compactMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                compactMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
