"use client";

import { useTheme } from "@/components/providers/providers";
import { SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import { ProjectChallenge } from "@/lib/projects/data";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";

import { ProjectHeader } from "./ProjectHeader";
import { ProjectInstructions } from "./ProjectInstructions";
import dynamic from "next/dynamic";
const ProjectWorkspace = dynamic(
  () => import("./ProjectWorkspace").then((mod) => mod.ProjectWorkspace),
  { ssr: false },
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
  const { theme, toggleTheme } = useTheme();
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
        toggleTheme={toggleTheme}
        isDark={isDark}
      />
    </SandpackProvider>
  );
}

function ProjectEditorContent({
  project,
  toggleTheme,
  isDark,
}: {
  project: ProjectChallenge;
  toggleTheme: () => void;
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

  // Session Stats
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (isSolved || isInitializing) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSolved, isInitializing]);

  // Monitor Sandpack status - unblock UI as soon as it's ready
  useEffect(() => {
    if (sandpack.status === "running" || sandpack.status === "idle") {
      setIsInitializing(false);
    }
  }, [sandpack.status]);

  const handleVerify = useCallback(() => {
    if (!project.validationRegex) {
      toast.info(
        "No automated validation for this challenge. If it looks right, you passed!",
      );
      return;
    }

    setIsValidating(true);

    // Artificial delay for "premium" feel
    setTimeout(() => {
      let passed = true;

      Object.entries(project.validationRegex!).forEach(([file, regexStr]) => {
        const content = sandpack.files[file]?.code || "";
        const regex = new RegExp(regexStr);
        if (!regex.test(content)) {
          const normalizedContent = normalizeCode(content);
          if (!regex.test(normalizedContent)) {
            passed = false;
          }
        }
      });

      setIsValidating(false);

      if (passed) {
        setIsSolved(true);

        // Save progress
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
          console.error("Failed to save progress", e);
        }

        setShowSuccessModal(true);
      } else {
        toast.error("Code verification failed. Keep debugging!");
      }
    }, 1500);
  }, [project, sandpack.files]);

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

  return (
    <div className="h-screen w-full flex flex-col bg-white dark:bg-gray-950">
      <ProjectHeader
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleTheme={toggleTheme}
        isDark={isDark}
        timeElapsed={timeElapsed}
        onVerify={handleVerify}
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
    </div>
  );
}
