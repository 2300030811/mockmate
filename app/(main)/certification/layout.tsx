import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certification Hub | MockMate",
  description: "Master AWS, Azure, Salesforce, MongoDB, PCAP Python, and Oracle certifications with AI-powered practice quizzes. Choose from MCQs, hotspots, drag-drop challenges, code-based questions, case studies, and more.",
  keywords: [
    "AWS certification",
    "Azure certification",
    "Salesforce certification",
    "MongoDB certification",
    "PCAP certification",
    "Oracle certification",
    "practice exam",
    "quiz platform",
  ],
  openGraph: {
    title: "Certification Hub | MockMate",
    description: "Practice for multiple cloud and tech certifications with diverse question types.",
    type: "website",
  },
};

export default function CertificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
