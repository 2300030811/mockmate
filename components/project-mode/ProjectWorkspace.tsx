
"use client";

import { SandpackLayout, SandpackFileExplorer, SandpackCodeEditor, SandpackPreview, SandpackConsole, useSandpack } from "@codesandbox/sandpack-react";
import { Terminal, Copy, ChevronLeft, ChevronRight, PanelLeft, Code2, Play, BrainCircuit } from "lucide-react";
import { useState } from "react";
import { ProjectInsights } from "./ProjectInsights";

interface ProjectWorkspaceProps {
  activeTab: "code" | "preview";
  isInitializing: boolean;
  projectDescription: string;
}

export function ProjectWorkspace({ 
  activeTab, 
  isInitializing,
  projectDescription
}: ProjectWorkspaceProps) {
  const { sandpack } = useSandpack();
  const [showExplorer, setShowExplorer] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<"preview" | "console" | "insights">("preview");

  return (
    <div className="flex-1 min-w-0 h-full relative flex flex-col bg-white dark:bg-gray-950 overflow-hidden min-h-0">
      <SandpackLayout className="flex-1 !rounded-none !border-0 flex overflow-hidden !h-full min-h-0">
        
        {/* Collapsible File Explorer */}
        <div className={`border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ${showExplorer ? 'w-60' : 'w-0 overflow-hidden'}`}>
             <div className="h-10 px-4 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-900/50">
                <span>Explorer</span>
                <button onClick={() => setShowExplorer(false)} className="hover:text-gray-900 dark:hover:text-white">
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
        <div className={`flex-1 h-full flex flex-col min-w-0 ${activeTab === 'code' ? 'flex' : 'hidden lg:flex'}`}>
          <SandpackCodeEditor 
            showLineNumbers 
            showTabs 
            closableTabs 
            className="flex-1 !h-full"
          />
        </div>

        {/* Right Panel (Preview / Console / Insights) */}
        <div className={`w-full lg:w-[40%] flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Right Panel Tabs */}
          <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center bg-gray-50 dark:bg-gray-900 px-1 gap-1">
             <button
                onClick={() => setRightPanelTab("preview")}
                className={`flex-1 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${rightPanelTab === "preview" ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
             >
                <Play size={12} /> Preview
             </button>
             <button
                onClick={() => setRightPanelTab("console")}
                className={`flex-1 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${rightPanelTab === "console" ? "bg-white dark:bg-gray-800 shadow text-green-600 dark:text-green-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
             >
                <Terminal size={12} /> Console
             </button>
             <button
                onClick={() => setRightPanelTab("insights")}
                className={`flex-1 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${rightPanelTab === "insights" ? "bg-white dark:bg-gray-800 shadow text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
             >
                <BrainCircuit size={12} /> AI Review
             </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {/* 1. Preview Tab */}
            <div className={`absolute inset-0 flex flex-col ${rightPanelTab === 'preview' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
                 {isInitializing && (
                  <div className="absolute inset-0 z-20 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-xs text-gray-500 animate-pulse font-medium">Booting DevCube...</p>
                  </div>
                )}
                <SandpackPreview 
                  className="!h-full" 
                  showNavigator
                  showOpenInCodeSandbox={false}
                />
            </div>

            {/* 2. Console Tab */}
            <div className={`absolute inset-0 flex flex-col bg-black ${rightPanelTab === 'console' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
                <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs font-mono text-gray-400 flex items-center gap-2">
                  <Terminal size={12} className="text-green-500" />
                  <span>Terminal Output</span>
                </div>
                <SandpackConsole className="flex-1 !bg-black !h-full" />
            </div>

            {/* 3. AI Code Review Tab */}
            <div className={`absolute inset-0 flex flex-col ${rightPanelTab === 'insights' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
                 <ProjectInsights 
                    files={sandpack.files} 
                    description={projectDescription} 
                 />
            </div>
          </div>
          
        </div>
      </SandpackLayout>
    </div>
  );
}
