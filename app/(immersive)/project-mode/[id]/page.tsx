import { notFound } from "next/navigation";
import { projects } from "@/lib/projects/data";
import { ProjectEditor } from "@/components/project-mode/ProjectEditor";

interface PageProps {
  params: {
    id: string;
  };
}

// Ensure static params for potential static generation
export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default function ProjectEditorPage({ params }: PageProps) {
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="h-screen w-full bg-gray-900 text-white overflow-hidden">
      <ProjectEditor project={project} />
    </div>
  );
}
