"use client";

import { motion } from "framer-motion";
import { Gavel, Scale, AlertCircle, CheckCircle } from "lucide-react";
import { useTheme } from "@/app/providers";

export default function TermsOfService() {
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
            <Scale size={20} />
            <span className="text-sm font-bold tracking-wider uppercase">Terms of Service</span>
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Platform Terms & Conditions
          </h1>
          <p className="text-xl opacity-70">
            Effective Date: February 13, 2026
          </p>
        </motion.div>

        <div className={`prose prose-lg max-w-none ${isDark ? "prose-invert" : ""}`}>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Gavel className="text-blue-500" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using MockMate, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="text-purple-500" />
              2. Use of the Service
            </h2>
            <p>
              MockMate provides AI-powered tools for educational purposes. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for lawful purposes only.</li>
              <li>Provide accurate information when creating an account.</li>
              <li>Maintain the security of your account and credentials.</li>
              <li>Not attempt to reverse engineer or bypass our AI filters or rate limits.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="text-orange-500" />
              3. AI Disclaimer
            </h2>
            <p>
              MockMate uses advanced Artificial Intelligence (including Gemini, Groq, and OpenAI) to generate quiz content and provide interview feedback.
            </p>
            <div className={`p-4 rounded-xl border ${isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-200"}`}>
              <p className="m-0 font-medium">
                <strong>Important:</strong> AI-generated content can occasionally contain inaccuracies. While we strive for high precision, MockMate is a study aid and should not be the sole source for official certification preparation.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              4. Content Ownership
            </h2>
            <p>
              You retain ownership of the documents you upload. MockMate owns the proprietary AI models, source code, design elements, and the generated content structure provided within the platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              5. User Moderation
            </h2>
            <p>
              We reserve the right to remove any content or nicknames that violate our Community Guidelines, including offensive, racist, or hateful language.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              6. Limitation of Liability
            </h2>
            <p>
              MockMate is provided "as is". We are not liable for any damages resulting from your use of the platform or your performance in official certification exams.
            </p>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
            <p className="text-sm opacity-60">
               मॉकMate is built for growth. Let's learn together.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
