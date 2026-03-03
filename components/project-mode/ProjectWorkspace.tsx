"use client";

import {
  SandpackLayout,
  SandpackFileExplorer,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import {
  Terminal,
  ChevronLeft,
  PanelLeft,
  Play,
  BrainCircuit,
  RotateCw,
  Undo2,
  Sparkles,
  Loader2 as SpinnerIcon
} from "lucide-react";
import { m } from "framer-motion";
import React, { useState, useCallback } from "react";
import { ProjectInsights } from "./ProjectInsights";

interface ProjectWorkspaceProps {
  activeTab: "code" | "preview";
  isInitializing: boolean;
  isValidating: boolean;
  projectDescription: string;
  projectId?: string; // For localStorage persistence
  rightPanelTab: "preview" | "console" | "insights";
  setRightPanelTab: (tab: "preview" | "console" | "insights") => void;
  challengeContext?: {
    difficulty?: "Easy" | "Medium" | "Hard";
    hints?: string[];
    expertSolution?: string;
    validationRegex?: Record<string, string>;
    readOnlyFiles?: string[];
  };
  autoTriggerAnalysis?: boolean;
  onAnalysisTriggered?: () => void;
}

export const ProjectWorkspace = React.memo(function ProjectWorkspace({
  activeTab,
  isInitializing,
  isValidating,
  projectDescription,
  projectId,
  rightPanelTab,
  setRightPanelTab,
  challengeContext,
  autoTriggerAnalysis,
  onAnalysisTriggered,
}: ProjectWorkspaceProps) {
  const { sandpack } = useSandpack();
  const [showExplorer, setShowExplorer] = useState(true);
  const [hasBooted, setHasBooted] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Once the sandbox has run at least once, mark it as booted
  // so the idle overlay never blocks the preview again
  React.useEffect(() => {
    if (sandpack.status === "running") {
      setHasBooted(true);
    }
  }, [sandpack.status]);

  return (
    <div className="flex-1 min-w-0 h-full relative flex flex-col bg-white dark:bg-gray-950 overflow-hidden min-h-0">
      <SandpackLayout className="flex-1 !rounded-none !border-0 flex overflow-hidden !h-full min-h-0">
        {/* Collapsible File Explorer */}
        <div
          className={`border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 bg-gray-50/50 dark:bg-gray-900/50 ${showExplorer ? "w-60" : "w-0 overflow-hidden"}`}
        >
          <div className="h-10 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <span>File Explorer</span>
            <button
              onClick={() => setShowExplorer(false)}
              className="hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <SandpackFileExplorer className="!h-full !w-full" />
          </div>
        </div>

        {/* Toggle Button (When closed) */}
        {!showExplorer && (
          <div className="w-12 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-6 gap-6 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-400">
            <button
              onClick={() => setShowExplorer(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 hover:text-blue-500 rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              title="Open Explorer"
            >
              <PanelLeft size={18} />
            </button>
          </div>
        )}

        {/* Main Code Editor Area */}
        <div
          className={`flex-1 h-full flex flex-col min-w-0 ${activeTab === "code" ? "flex" : "hidden lg:flex"}`}
        >
          <SandpackCodeEditor
            showLineNumbers={true}
            showTabs={true}
            closableTabs={true}
            showInlineErrors={true}
            showRunButton={false}
            wrapContent={true}
            className="flex-1 !h-full"
          />
        </div>

        {/* Right Panel (Preview / Console / Insights) */}
        <div
          className={`w-full lg:w-[40%] flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 ${activeTab === "preview" ? "flex" : "hidden lg:flex"}`}
        >
          {/* Right Panel Tabs */}
          <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center bg-gray-50 dark:bg-gray-900 px-2 gap-2">
            <button
              onClick={() => setRightPanelTab("preview")}
              className={`px-3 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${rightPanelTab === "preview" ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <Play size={14} /> Preview
            </button>
            <button
              onClick={() => setRightPanelTab("console")}
              className={`px-3 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${rightPanelTab === "console" ? "bg-white dark:bg-gray-800 shadow text-green-600 dark:text-green-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <Terminal size={14} /> Console
            </button>
            <button
              onClick={() => setRightPanelTab("insights")}
              className={`px-3 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${rightPanelTab === "insights" ? "bg-white dark:bg-gray-800 shadow text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <BrainCircuit size={14} /> AI Review
            </button>

            <div className="flex-1" />

            {/* Permanent Custom Run/Restart Button */}
            <div className="flex items-center gap-2 pr-1">
              <button
                onClick={() => sandpack.resetAllFiles()}
                className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all"
                title="Reset all files to original state"
              >
                <Undo2 size={14} /> Reset
              </button>

              {sandpack.status === "idle" || sandpack.status === "timeout" ? (
                <button
                  onClick={() => sandpack.runSandpack()}
                  className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center gap-2 shadow-sm transition-all animate-pulse hover:animate-none"
                >
                  <Play size={14} fill="currentColor" /> Run Code
                </button>
              ) : (
                <button
                  onClick={() => Object.values(sandpack.clients).forEach((client: any) => client.dispatch({ type: 'refresh' }))}
                  className="h-8 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs font-bold flex items-center gap-2 transition-all border border-gray-200 dark:border-gray-700"
                  title="Reload the preview"
                >
                  <RotateCw size={14} /> Reload
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {/* 1. Preview Tab */}
            <div
              className={`absolute inset-0 flex flex-col ${rightPanelTab === "preview" ? "z-10" : "z-0 opacity-0 pointer-events-none"}`}
            >
              {isInitializing ? (
                <div className="absolute inset-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-xs text-gray-900 dark:text-white font-bold uppercase tracking-wider mb-1">
                    Booting DevCube...
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Initializing project environment
                  </p>
                </div>
              ) : !hasBooted && (sandpack.status === "idle" || sandpack.status === "timeout") && (
                <div className="absolute inset-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm group cursor-pointer" onClick={() => sandpack.runSandpack()}>
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform animate-pulse group-hover:animate-none">
                    <Play size={32} fill="currentColor" className="ml-1" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Ready to Run</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] text-center font-medium">
                    The environment is ready. Click anywhere or press the <b className="text-blue-500">Run Code</b> button to start.
                  </p>
                </div>
              )}
              <SandpackPreview
                className="!h-full"
                showNavigator
                showRefreshButton
                showOpenInCodeSandbox={false}
              />

              {/* Validation Overlay */}
              {isValidating && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-30 bg-blue-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white"
                >
                  <div className="relative mb-6">
                    <SpinnerIcon size={64} className="animate-spin opacity-20" />
                    <Sparkles size={32} className="absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Analyzing Solution</h3>
                  <p className="text-blue-100 text-sm font-medium animate-pulse">Running engineering heuristics...</p>
                </m.div>
              )}
            </div>

            {/* 2. Console Tab */}
            <div
              className={`absolute inset-0 flex flex-col bg-black ${rightPanelTab === "console" ? "z-10" : "z-0 opacity-0 pointer-events-none"}`}
            >
              <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs font-mono text-gray-400 flex items-center gap-2">
                <Terminal size={12} className="text-green-500" />
                <span>Terminal Output</span>
              </div>
              <SandpackConsole className="flex-1 !bg-black !h-full" />
            </div>

            {/* 3. AI Code Review Tab */}
            <div
              className={`absolute inset-0 flex flex-col ${rightPanelTab === "insights" ? "z-10" : "z-0 opacity-0 pointer-events-none"}`}
            >
              <ProjectInsights
                files={sandpack.files}
                description={projectDescription}
                projectId={projectId}
                challengeContext={challengeContext}
                autoTrigger={autoTriggerAnalysis}
                onTriggered={onAnalysisTriggered}
              />
            </div>
          </div>
        </div>
      </SandpackLayout>

      {/* Mobile Bottom Toolbar (only visible on mobile) */}
      <div className="md:hidden h-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-3 gap-2 overflow-x-auto">
        {/* File Picker Dropdown - click-based for touch devices */}
        <div className="relative">
          <button
            onClick={() => setShowFilePicker((prev) => !prev)}
            className="h-8 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap"
            aria-expanded={showFilePicker}
            aria-haspopup="listbox"
            aria-label="Open file picker"
          >
            📁 Files
          </button>
          {showFilePicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilePicker(false)} />
              <div
                className="absolute bottom-full left-0 mb-2 flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50 max-h-48 overflow-y-auto min-w-[180px]"
                role="listbox"
              >
                {Object.keys(sandpack.files).map((fileName) => (
                  <button
                    key={fileName}
                    role="option"
                    aria-selected={sandpack.activeFile === fileName}
                    className={`px-3 py-2 text-xs text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 last:border-0 whitespace-nowrap ${sandpack.activeFile === fileName ? 'bg-blue-50 dark:bg-blue-500/10 font-semibold' : ''}`}
                    onClick={() => { sandpack.openFile(fileName); setShowFilePicker(false); }}
                    title={fileName}
                  >
                    {fileName}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* Mobile Quick Actions */}
        <div className="flex items-center gap-2">
          {sandpack.status === "idle" || sandpack.status === "timeout" ? (
            <button
              onClick={() => sandpack.runSandpack()}
              className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold flex items-center gap-1 transition-all"
              aria-label="Run code"
            >
              <Play size={12} fill="currentColor" /> Run
            </button>
          ) : (
            <button
              onClick={() => Object.values(sandpack.clients).forEach((client: any) => client.dispatch({ type: 'refresh' }))}
              className="h-8 px-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-bold flex items-center gap-1 transition-all"
              aria-label="Reload preview"
            >
              ⟳ Reload
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
