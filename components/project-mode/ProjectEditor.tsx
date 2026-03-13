"use client";

import { useTheme } from "@/components/providers/providers";
import { SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import { ProjectChallenge } from "@/lib/projects/data";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { saveProjectProgress } from "@/app/actions/project-progress";

import { ProjectHeader } from "./ProjectHeader";
import { ProjectInstructions } from "./ProjectInstructions";
import { MobileInstructionsDrawer } from "./MobileInstructionsDrawer";
import { useProjectKeyboardShortcuts } from "@/hooks/useProjectKeyboardShortcuts";
import dynamic from "next/dynamic";
const ProjectWorkspace = dynamic(
  () => import("./ProjectWorkspace").then((mod) => mod.ProjectWorkspace),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 border-l border-gray-800">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-medium">Mounting Workspace...</p>
      </div>
    )
  },
);
import { SuccessModal } from "./SuccessModal";

interface ProjectEditorProps {
  project: ProjectChallenge;
}

const normalizeCode = (code: string) => {
  return code
    .replace(/\/\/.*$/gm, "") // Remove single line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/\s*([\{\}\(\)\;\,\=\+\-\*\/])\s*/g, "$1") // Remove spaces around syntax boundaries
    .trim();
};

export function ProjectEditor({ project }: ProjectEditorProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  // Transform files to inject readOnly property
  const sandpackFiles = useMemo(() => {
    return Object.entries(project.files).reduce((acc: any, [path, content]) => {
      acc[path] = {
        code: content,
        readOnly: project.readOnlyFiles?.includes(path) || false,
      };
      return acc;
    }, {});
  }, [project.files, project.readOnlyFiles]);

  const sandpackOptions = useMemo(
    () => ({
      autorun: true, // Always auto-run for immediate feedback
      autoReload: true, // Auto-reload preview when code changes
      visibleFiles: [
        project.activeFile,
        ...Object.keys(project.files)
          .filter((f) => f !== project.activeFile)
          .slice(0, 2),
      ],
      activeFile: project.activeFile,
    }),
    [project.activeFile, project.files],
  );

  const customSetup = useMemo(
    () => ({
      dependencies: {
        ...(project.dependencies || {}),
      },
    }),
    [project.dependencies],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sandpackTheme = theme === "dark" ? "dark" : "light";

  return (
    <SandpackProvider
      template={project.template || "nextjs"}
      theme={sandpackTheme}
      files={sandpackFiles}
      options={sandpackOptions}
      customSetup={customSetup}
    >
      <ProjectEditorContent
        project={project}
        setTheme={setTheme}
        isDark={isDark}
      />
    </SandpackProvider>
  );
}

function ProjectEditorContent({
  project,
  setTheme,
  isDark,
}: {
  project: ProjectChallenge;
  setTheme: (theme: string) => void;
  isDark: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const { sandpack } = useSandpack();
  const [hintIndex, setHintIndex] = useState(-1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<
    "preview" | "console" | "insights"
  >("preview");
  const [autoTriggerAnalysis, setAutoTriggerAnalysis] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [lastSavedState, setLastSavedState] = useState<Record<string, string> | null>(null);

  // Session Stats
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Define callbacks first (before any hooks that use them)
  const captureCodeSnapshot = useCallback(() => {
    // Capture current code state for undo
    const snapshot: Record<string, string> = {};
    Object.entries(sandpack.files).forEach(([name, file]) => {
      snapshot[name] = file.code;
    });
    setLastSavedState(snapshot);
  }, [sandpack.files]);

  const restoreCodeSnapshot = useCallback(() => {
    if (lastSavedState) {
      Object.entries(lastSavedState).forEach(([name, code]) => {
        sandpack.updateFile(name, code);
      });
      toast.success("Code restored");
    }
  }, [lastSavedState, sandpack]);

  const handleVerify = useCallback(() => {
    if (!project.validationRegex && !project.validationTests) {
      toast.info(
        "No automated validation for this challenge. If it looks right, you passed!",
      );
      return;
    }

    setIsValidating(true);

    // Artificial delay for "premium" feel
    setTimeout(async () => {
      let passed = true;

      // Step 1: Check regex validation (fast path)
      if (project.validationRegex) {
        Object.entries(project.validationRegex).forEach(([file, regexStr]) => {
          const content = sandpack.files[file]?.code || "";
          const regex = new RegExp(regexStr);
          if (!regex.test(content)) {
            const normalizedContent = normalizeCode(content);
            if (!regex.test(normalizedContent)) {
              passed = false;
            }
          }
        });
      }

      // Step 2: Run programmatic tests (secondary layer)
      if (passed && project.validationTests && project.validationTests.length > 0) {
        for (const test of project.validationTests) {
          try {
            // Create a function that tests the code
            // The test function receives the files object
            const testFn = new Function('files', test.test);
            const result = testFn(sandpack.files);
            if (!result) {
              passed = false;
              break;
            }
          } catch (e) {
            console.error(`Validation test "${test.description}" failed:`, e);
            // If test throws, consider it failed
            passed = false;
            break;
          }
        }
      }

      setIsValidating(false);

      if (passed) {
        setIsSolved(true);

        // Save progress to localStorage (for all users)
        try {
          const completed = JSON.parse(
            localStorage.getItem("completedProjects") || "[]",
          );
          if (!completed.includes(project.id)) {
            localStorage.setItem(
              "completedProjects",
              JSON.stringify([...completed, project.id]),
            );
          }
        } catch (e) {
          console.error("Failed to save progress to localStorage", e);
        }

        // Save progress to database (for logged-in users only)
        try {
          await saveProjectProgress({
            projectId: project.id,
            timeTaken: timeElapsed,
            hintsUsed: hintIndex + 1,
          });
        } catch (e) {
          // Silently fail — project completion should not be blocked by DB errors
          console.error("Failed to save progress to database", e);
        }

        setShowSuccessModal(true);
      } else {
        toast.error("Code verification failed. Keep debugging!");
      }
    }, 1500);
  }, [project, sandpack.files, timeElapsed, hintIndex]);

  const handleReviewSolution = useCallback(() => {
    setShowSuccessModal(false);
    setRightPanelTab("insights");
    setActiveTab("preview"); // Ensure on mobile the right panel is visible
    setAutoTriggerAnalysis(true); // Auto-trigger analysis when coming from success modal
  }, []);

  const revealHint = useCallback(() => {
    if (!project.hints) return;
    if (hintIndex < project.hints.length - 1) {
      setHintIndex((prev) => prev + 1);
    } else {
      toast.info("No more hints available!");
    }
  }, [project.hints, hintIndex]);

  const closeSuccessModal = useCallback(() => setShowSuccessModal(false), []);

  // Keyboard shortcuts
  useProjectKeyboardShortcuts({
    onVerify: handleVerify,
    onReset: () => {
      // This will be triggered by keyboard shortcut - ideally show confirmation
      // For now, just reset directly (users can use button for confirmation UI)
      captureCodeSnapshot();
      sandpack.resetAllFiles();
    },
    onRevealHint: revealHint,
    enabled: !isSolved && !isValidating, // Disable shortcuts when already solved or validating
  });

  // Timer Effect
  useEffect(() => {
    if (isSolved || isInitializing || showSuccessModal || !isPageVisible) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSolved, isInitializing, showSuccessModal, isPageVisible]);

  // Monitor Sandpack status - unblock UI as soon as it's ready
  useEffect(() => {
    if (sandpack.status === "running" || sandpack.status === "idle") {
      setIsInitializing(false);
    }
  }, [sandpack.status]);

  // Listen to page visibility changes (pause timer when user tabs away)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-white dark:bg-gray-950">
      <ProjectHeader
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setTheme={setTheme}
        isDark={isDark}
        timeElapsed={timeElapsed}
        onShowMobileInstructions={() => setShowMobileInstructions(true)}
        onVerify={handleVerify}
        onResetRequested={captureCodeSnapshot}
        onUndoReset={restoreCodeSnapshot}
      />

      <div className="flex-1 flex overflow-hidden">
        <ProjectInstructions
          project={project}
          hintIndex={hintIndex}
          onRevealHint={revealHint}
          sandpackStatus={sandpack.status}
        />

        <ProjectWorkspace
          activeTab={activeTab}
          isInitializing={isInitializing}
          isValidating={isValidating}
          projectDescription={project.description}
          projectId={project.id}
          rightPanelTab={rightPanelTab}
          setRightPanelTab={setRightPanelTab}
          autoTriggerAnalysis={autoTriggerAnalysis}
          onAnalysisTriggered={() => setAutoTriggerAnalysis(false)}
          challengeContext={{
            difficulty: project.difficulty,
            hints: project.hints,
            expertSolution: project.expertSolution,
            validationRegex: project.validationRegex,
            readOnlyFiles: project.readOnlyFiles,
          }}
        />
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        onReviewSolution={handleReviewSolution}
        project={project}
        stats={{
          timeTaken: timeElapsed,
          hintsUsed: hintIndex + 1,
        }}
      />

      <MobileInstructionsDrawer
        isOpen={showMobileInstructions}
        onClose={() => setShowMobileInstructions(false)}
        project={project}
        hintIndex={hintIndex}
        onRevealHint={revealHint}
        sandpackStatus={sandpack.status}
      />
    </div>
  );
}
