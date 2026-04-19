import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder - MockMate",
  description:
    "Build and download a polished resume PDF with MockMate's structured resume template generator.",
  openGraph: {
    title: "Resume Builder - MockMate",
    description:
      "Create a clean PDF resume from your summary, skills, and experience in minutes.",
    type: "website",
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}