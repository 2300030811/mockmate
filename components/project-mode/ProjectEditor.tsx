"use client";

import { useTheme } from "@/components/providers/providers";
import { SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import { ProjectChallenge } from "@/lib/projects/data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

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

export function ProjectEditor({ project }: ProjectEditorProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sandpackTheme = theme === "dark" ? "dark" : "light";

  // Transform files to inject readOnly property
  const sandpackFiles = Object.entries(project.files).reduce(
    (acc: any, [path, content]) => {
      acc[path] = {
        code: content,
        readOnly: project.readOnlyFiles?.includes(path) || false,
      };
      return acc;
    },
    {},
  );

  return (
    <SandpackProvider
      template="nextjs"
      theme={sandpackTheme}
      files={sandpackFiles}
      options={{
        visibleFiles: [
          project.activeFile,
          ...Object.keys(project.files)
            .filter((f) => f !== project.activeFile)
            .slice(0, 2),
        ],
        activeFile: project.activeFile,
      }}
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

  // Session Stats
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (isSolved || isInitializing) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSolved, isInitializing]);

  // Monitor Sandpack status
  useEffect(() => {
    if (sandpack.status === "running") {
      setIsInitializing(false);
    }
  }, [sandpack.status]);

  const normalizeCode = (code: string) => {
    return code
      .replace(/\/\/.*$/gm, "") // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .replace(/\s*([\{\}\(\)\;\,\=\+\-\*\/])\s*/g, "$1") // Remove spaces around syntax boundaries
      .trim();
  };

  const handleVerify = () => {
    if (!project.validationRegex) {
      toast.info(
        "No automated validation for this challenge. If it looks right, you passed!",
      );
      return;
    }

    let passed = true;

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

    if (passed) {
      setIsSolved(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });

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
  };

  const revealHint = () => {
    if (!project.hints) return;
    if (hintIndex < project.hints.length - 1) {
      setHintIndex((prev) => prev + 1);
    } else {
      toast.info("No more hints available!");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white dark:bg-gray-950">
      <ProjectHeader
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleTheme={toggleTheme}
        isDark={isDark}
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
          projectDescription={project.description}
        />
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        project={project}
        stats={{
          timeTaken: timeElapsed,
          hintsUsed: hintIndex + 1,
        }}
      />
    </div>
  );
}
