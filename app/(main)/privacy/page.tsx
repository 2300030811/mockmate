"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { useTheme } from "@/app/providers";

export default function PrivacyPolicy() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen pt-32 pb-20 px-4 transition-colors duration-500 ${
      isDark ? "bg-gray-950 text-gray-300" : "bg-gray-50 text-gray-700"
    }`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 mb-6">
            <Shield size={20} />
            <span className="text-sm font-bold tracking-wider uppercase">Privacy Policy</span>
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Your Privacy Matters
          </h1>
          <p className="text-xl opacity-70">
            Last updated: February 13, 2026
          </p>
        </motion.div>

        <div className={`prose prose-lg max-w-none ${isDark ? "prose-invert" : ""}`}>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="text-blue-500" />
              1. Information We Collect
            </h2>
            <p>
              At MockMate, we collect information to provide a better experience for our users. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> When you register, we collect your email address and nickname.</li>
              <li><strong>Uploaded Content:</strong> When you use our AI Quiz Generator or Career Pathfinder, we process the documents (PDFs, Resumes) you upload. These are used only for analysis and quiz generation.</li>
              <li><strong>Usage Data:</strong> We track quiz results, progress, and interview performance to provide you with insights and leaderboard rankings.</li>
              <li><strong>Voice Data:</strong> During AI Mock Interviews, we process voice input via the Web Speech API or Microsoft Azure Speech SDK to provide real-time feedback.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="text-purple-500" />
              2. How We Use Your Data
            </h2>
            <p>
              Your data is used strictly for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our Service.</li>
              <li>To generate personalized quizzes and career recommendations.</li>
              <li>To facilitate realistic AI-driven mock interviews.</li>
              <li>To manage your account and provide customer support.</li>
              <li>To display rankings on our global leaderboard (using your chosen nickname).</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="text-green-500" />
              3. Data Sharing & Security
            </h2>
            <p>
              We do not sell your personal information. We only share data with third-party providers necessary for our service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>AI Providers:</strong> We use OpenAI, Google Gemini, and Groq to process text and generate content.</li>
              <li><strong>Cloud Infrastructure:</strong> We use Supabase for authentication/database and Azure for speech and file processing.</li>
            </ul>
            <p className="mt-4">
              We implement industry-standard security measures to protect your data, including encryption at rest and in transit.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-blue-500">
              4. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal data. You can manage your profile settings directly through the MockMate dashboard or contact us for assistance.
            </p>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
            <p className="text-sm opacity-60">
              If you have any questions about this Privacy Policy, please contact us through our social channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
