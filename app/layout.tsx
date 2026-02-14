import "../styles/globals.css";
import { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Mockmate - AI-Powered Certification Quizzes & Mock Interviews",
  description:
    "Master AWS, Azure, Salesforce, and MongoDB exams with Mockmate. Get AI-powered mock interviews, personalized career path roadmaps, and instant feedback. The ultimate platform for certification success.",
  keywords: ["AWS certification", "Azure exam prep", "Salesforce quiz", "MongoDB professional", "Oracle Java quiz", "AI Mock Interview", "Career Roadmap", "Resume Analyzer"],
  authors: [{ name: "Mockmate Team" }],
  creator: "Mockmate",
  publisher: "Mockmate",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Mockmate",
    title: "Mockmate - AI Certification Prep & Career Tools",
    description:
      "AI-powered platform to help you ace Cloud & IT certifications. Practice with 2,400+ real-world questions and realistic AI mock interviews.",
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Mockmate - AI-Powered Certification Success",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mockmate - Ace Your Next IT Certification",
    description:
      "Interactive AI quizzes for AWS, Azure, & more. Plus, an AI Interviewer to get you job-ready.",
    images: [`${baseUrl}/opengraph-image`],
  },
  metadataBase: new URL(baseUrl),
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${outfit.variable} font-sans scroll-smooth antialiased [font-feature-settings:'ss01'] bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
