import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Roaster — AI-Powered Resume Review | MockMate",
  description:
    "Get a brutally honest AI review of your resume. Our Resume Roaster analyzes ATS compatibility, identifies critical flaws, highlights strengths, and gives actionable improvement tips.",
  openGraph: {
    title: "Resume Roaster — AI-Powered Resume Review",
    description:
      "Upload your resume and get roasted by AI. ATS survival analysis, keyword matching, and actionable tips included.",
    type: "website",
  },
};

export default function ResumeRoasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
