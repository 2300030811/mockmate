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
  Loader2 as SpinnerIcon,
  Layers,
} from "lucide-react";
import { m } from "framer-motion";
import React, { useState } from "react";
import { ProjectInsights } from "./ProjectInsights";

interface ProjectWorkspaceProps {
  activeTab: "code" | "preview";
  isInitializing: boolean;
  isValidating: boolean;
  projectDescription: string;
  projectId?: string;
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

  React.useEffect(() => {
    if (sandpack.status === "running") {
      setHasBooted(true);
    }
  }, [sandpack.status]);

  return (
    <div className="flex-1 min-w-0 h-full relative flex flex-col bg-white dark:bg-[#0d0d12] overflow-hidden min-h-0">
      <SandpackLayout className="flex-1 !rounded-none !border-0 flex overflow-hidden !h-full min-h-0 !bg-transparent">
        {/* Collapsible File Explorer */}
        <div
          className={`border-r border-zinc-200 dark:border-[#1e1e2a] flex flex-col transition-all duration-300 bg-zinc-50/50 dark:bg-[#0f0f16] ${
            showExplorer ? "w-56" : "w-0 overflow-hidden"
          }`}
        >
          <div className="h-9 px-3 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between text-[10px] font-mono font-medium text-zinc-500 dark:text-[#6e6e84] uppercase tracking-wider">
            <span>Files</span>
            <button
              onClick={() => setShowExplorer(false)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="Collapse Explorer"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <SandpackFileExplorer className="!h-full !w-full !bg-transparent" />
          </div>
        </div>

        {/* Explorer Open Trigger (When collapsed) */}
        {!showExplorer && (
          <div className="w-10 border-r border-zinc-200 dark:border-[#1e1e2a] flex flex-col items-center py-4 bg-zinc-50/50 dark:bg-[#0f0f16] text-zinc-400">
            <button
              onClick={() => setShowExplorer(true)}
              className="w-7 h-7 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-[#1a1a26] hover:text-[#5e6ad2] rounded transition-colors"
              title="Open File Explorer"
            >
              <PanelLeft size={15} />
            </button>
          </div>
        )}

        {/* Main Code Editor Area */}
        <div
          className={`flex-1 h-full flex flex-col min-w-0 ${
            activeTab === "code" ? "flex" : "hidden lg:flex"
          }`}
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

        {/* Right Panel (Preview / Console / AI Review) */}
        <div
          className={`w-full lg:w-[44%] flex flex-col border-l border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#0d0d12] ${
            activeTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Right Panel Segmented Tab Strip */}
          <div className="h-9 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center bg-zinc-50 dark:bg-[#101018] px-2 gap-1 justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRightPanelTab("preview")}
                className={`px-2.5 h-7 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                  rightPanelTab === "preview"
                    ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                <Play className="w-3 h-3 text-[#5e6ad2]" /> Preview
              </button>
              <button
                onClick={() => setRightPanelTab("console")}
                className={`px-2.5 h-7 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                  rightPanelTab === "console"
                    ? "bg-white dark:bg-[#1e1e2a] text-emerald-600 dark:text-emerald-400 shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                <Terminal className="w-3 h-3 text-emerald-500" /> Console
              </button>
              <button
                onClick={() => setRightPanelTab("insights")}
                className={`px-2.5 h-7 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                  rightPanelTab === "insights"
                    ? "bg-white dark:bg-[#1e1e2a] text-[#5e6ad2] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                <BrainCircuit className="w-3 h-3 text-[#5e6ad2]" /> AI Review
              </button>
            </div>

            {/* Right Action Controls: Reset & Run */}
            <div className="flex items-center gap-1.5 pr-0.5">
              <button
                onClick={() => sandpack.resetAllFiles()}
                className="h-7 px-2 hover:bg-zinc-100 dark:hover:bg-[#1a1a26] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                title="Reset all files to original state"
              >
                <Undo2 size={13} />
                <span>Reset</span>
              </button>

              {sandpack.status === "idle" || sandpack.status === "timeout" ? (
                <button
                  onClick={() => sandpack.runSandpack()}
                  className="h-7 px-3 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded text-[11px] font-medium flex items-center gap-1.5 shadow-subtle transition-colors"
                >
                  <Play size={12} fill="currentColor" /> Run Code
                </button>
              ) : (
                <button
                  onClick={() =>
                    Object.values(sandpack.clients).forEach((client: any) =>
                      client.dispatch({ type: "refresh" })
                    )
                  }
                  className="h-7 px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#14141e] dark:hover:bg-[#1e1e2a] text-zinc-700 dark:text-[#ebebef] rounded text-[11px] font-medium flex items-center gap-1 border border-zinc-200 dark:border-[#1e1e2a] transition-colors"
                  title="Reload preview"
                >
                  <RotateCw size={12} /> Reload
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {/* 1. Preview Tab */}
            <div
              className={`absolute inset-0 flex flex-col ${
                rightPanelTab === "preview" ? "z-10" : "z-0 opacity-0 pointer-events-none"
              }`}
            >
              {isInitializing ? (
                <div className="absolute inset-0 z-20 bg-white/95 dark:bg-[#0d0d12]/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                  <div className="w-8 h-8 border-2 border-[#5e6ad2]/20 border-t-[#5e6ad2] rounded-full animate-spin mb-3" />
                  <p className="text-xs text-zinc-800 dark:text-[#ebebef] font-semibold tracking-wide mb-0.5">
                    Mounting Sandpack Runtime...
                  </p>
                  <p className="text-[10.5px] font-mono text-zinc-500 dark:text-[#6e6e84]">
                    Compiling virtual dependencies
                  </p>
                </div>
              ) : !hasBooted && (sandpack.status === "idle" || sandpack.status === "timeout") && (
                <div
                  className="absolute inset-0 z-20 bg-zinc-50/90 dark:bg-[#0d0d12]/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm group cursor-pointer"
                  onClick={() => sandpack.runSandpack()}
                >
                  <div className="w-12 h-12 bg-[#5e6ad2] text-white rounded-lg flex items-center justify-center mb-4 shadow-subtle group-hover:scale-105 transition-transform">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef] mb-1">
                    Ready to Run
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] max-w-[240px] text-center leading-relaxed">
                    Virtual runtime initialized. Click anywhere or press{" "}
                    <b className="text-[#5e6ad2] font-semibold">Run Code</b> to preview.
                  </p>
                </div>
              )}

              <SandpackPreview
                className="!h-full !bg-white"
                showNavigator
                showRefreshButton
                showOpenInCodeSandbox={false}
              />

              {/* Validation Overlay */}
              {isValidating && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-30 bg-[#0d0d12]/90 backdrop-blur-md flex flex-col items-center justify-center text-white"
                >
                  <div className="relative mb-4">
                    <SpinnerIcon size={48} className="animate-spin text-[#5e6ad2]" />
                    <Sparkles size={20} className="absolute inset-0 m-auto text-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-[#ebebef]">
                    Analyzing Solution
                  </h3>
                  <p className="text-zinc-400 text-xs font-mono animate-pulse">
                    Running automated test assertions...
                  </p>
                </m.div>
              )}
            </div>

            {/* 2. Console Tab */}
            <div
              className={`absolute inset-0 flex flex-col bg-[#0d0d12] ${
                rightPanelTab === "console" ? "z-10" : "z-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="px-3 py-1.5 bg-[#14141e] border-b border-[#1e1e2a] text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                <Terminal size={12} className="text-emerald-500" />
                <span>Virtual Process Console</span>
              </div>
              <SandpackConsole className="flex-1 !bg-[#0d0d12] !h-full" />
            </div>

            {/* 3. AI Code Review Tab */}
            <div
              className={`absolute inset-0 flex flex-col ${
                rightPanelTab === "insights" ? "z-10" : "z-0 opacity-0 pointer-events-none"
              }`}
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

      {/* Mobile Bottom Toolbar */}
      <div className="md:hidden h-11 border-t border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#0d0d12] flex items-center justify-between px-3 gap-2 shrink-0">
        <div className="relative z-30">
          <button
            type="button"
            onClick={() => setShowFilePicker((prev) => !prev)}
            className="h-7 px-2.5 bg-zinc-100 dark:bg-[#14141e] hover:bg-zinc-200 dark:hover:bg-[#1e1e2a] text-zinc-700 dark:text-[#ebebef] border border-zinc-200 dark:border-[#1e1e2a] rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            aria-expanded={showFilePicker}
            aria-haspopup="listbox"
            aria-controls="project-file-picker"
            aria-label="Open file picker"
          >
            📁 Files
          </button>
          {showFilePicker && (
            <>
              <div
                className="fixed inset-0 z-30 bg-transparent"
                aria-hidden="true"
                onClick={() => setShowFilePicker(false)}
              />
              <div
                id="project-file-picker"
                className="absolute bottom-full left-0 mb-1.5 flex flex-col bg-white dark:bg-[#14141e] rounded-md shadow-lg border border-zinc-200 dark:border-[#1e1e2a] z-40 max-h-48 overflow-y-auto min-w-[180px]"
                role="listbox"
                aria-label="Project files"
              >
                {Object.keys(sandpack.files).map((fileName) => (
                  <button
                    key={fileName}
                    type="button"
                    role="option"
                    aria-selected={sandpack.activeFile === fileName}
                    className={`px-3 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] text-zinc-700 dark:text-[#ebebef] border-b border-zinc-100 dark:border-[#1a1a26] last:border-0 whitespace-nowrap font-mono ${
                      sandpack.activeFile === fileName
                        ? "bg-[#5e6ad2]/10 text-[#5e6ad2] font-semibold"
                        : ""
                    }`}
                    onClick={() => {
                      sandpack.openFile(fileName);
                      setShowFilePicker(false);
                    }}
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

        <div className="flex items-center gap-1.5">
          {sandpack.status === "idle" || sandpack.status === "timeout" ? (
            <button
              onClick={() => sandpack.runSandpack()}
              className="h-7 px-2.5 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
              aria-label="Run code"
            >
              <Play size={11} fill="currentColor" /> Run
            </button>
          ) : (
            <button
              onClick={() =>
                Object.values(sandpack.clients).forEach((client: any) =>
                  client.dispatch({ type: "refresh" })
                )
              }
              className="h-7 px-2.5 bg-zinc-100 dark:bg-[#14141e] hover:bg-zinc-200 dark:hover:bg-[#1e1e2a] text-zinc-700 dark:text-[#ebebef] border border-zinc-200 dark:border-[#1e1e2a] rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
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
