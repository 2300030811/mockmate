import Link from "next/link";
import { Shield, Lock, Eye, FileText, Database, Cpu, UserCheck, AlertTriangle, ArrowLeft, Mail, Building } from "lucide-react";
import { HomeBackground } from "@/components/home/HomeBackground";

export const metadata = {
  title: "Privacy Policy - MockMate",
  description: "Data lifecycle disclosures, AI model routing policies, and DPDP Act (2023) compliance information for MockMate.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden transition-colors selection:bg-[#5e6ad2]/20 font-sans">
      <HomeBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
          <Link
            href="/"
            className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> MockMate Home
          </Link>
          <span>/</span>
          <span className="text-[#5e6ad2] font-semibold">Legal & Compliance</span>
          <span>/</span>
          <span>Privacy Policy</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] text-xs font-mono font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>INDIA DPDP ACT (2023) & GLOBAL COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Privacy Policy & Data Lifecycle Disclosures
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] max-w-2xl leading-relaxed">
            Effective Date: September 27, 2026 • Document Version: 2.4.0
          </p>
        </div>

        {/* Executive Summary Callout */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#5e6ad2]" />
            Core Privacy Commitment
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            MockMate (&quot;MockMate Technologies&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to transparent data stewardship. We process technical assessments, resume documents, and audio streams strictly to deliver autonomous AI mock interviews, career roadmaps, and certification diagnostics. We <strong>never sell your personal data</strong> and contractually mandate that external AI providers <strong>do not train foundational models</strong> on your candidate submissions.
          </p>
        </div>

        {/* Section 1: Ingestion & Processing Lifecycles */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-[#5e6ad2]" />
            1. Ingestion & Processing Lifecycles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resume Uploads */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-900 dark:text-white">
                <FileText className="w-4 h-4 text-emerald-500" />
                Resume & Document Parsing (PDF / DOCX)
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
                When you submit a resume for ATS optimization or skill-gap extraction, the file is parsed in-memory using <strong>Azure AI Document Intelligence</strong> (prebuilt-read API) with a local pdf-parse fallback.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/60 dark:border-[#222232] text-[11px] font-mono text-zinc-500 dark:text-[#6e6e84]">
                <strong>TTL & Purge Policy:</strong> Buffers are processed transiently in volatile RAM. Ephemeral blob backups in Azure Blob Storage are subject to an automated 24-hour time-to-live (TTL) lifecycle purge rule.
              </div>
            </div>

            {/* Audio & Voice */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-900 dark:text-white">
                <Cpu className="w-4 h-4 text-violet-500" />
                Audio & Speech Input
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
                During interactive interview sessions, microphone input is streamed through the <strong>Microsoft Azure Cognitive Services Speech SDK</strong> or browser Web Speech API for real-time speech-to-text synthesis.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/60 dark:border-[#222232] text-[11px] font-mono text-zinc-500 dark:text-[#6e6e84]">
                <strong>Acoustic Policy:</strong> Raw audio waveforms are never permanently archived. Transcripts are converted to text tokens, evaluated for competency, and stored only within your private session report.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: External AI Model Routing */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-amber-500" />
            2. Third-Party AI Model Routing & Training Opt-Out
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            MockMate utilizes a multi-tier AI gateway to generate challenge problems, evaluate coding complexity, and generate dynamic interview questions. We route prompts to the following enterprise endpoints:
          </p>

          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-4">
            <div className="divide-y divide-zinc-100 dark:divide-[#1e1e2a] text-xs">
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-zinc-800 dark:text-white">Google Gemini 2.0 (Gemini 2.0 Flash / Pro)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Zero Customer Data Retention for Training</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-zinc-800 dark:text-white">Groq Cloud (Llama 3.3 70B Versatile)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Stateless Fast-Inference API</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-zinc-800 dark:text-white">Microsoft Azure AI Document Intelligence</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">SOC2 Type II / ISO 27001 Certified Processing</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
              Under our commercial API licensing terms, your prompts, source code, and extracted resume entities are processed in isolated transient sessions and are <strong>explicitly excluded from training future public LLMs</strong>.
            </p>
          </div>
        </div>

        {/* Section 3: Data Storage, RLS & Infrastructure */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-500" />
            3. Storage, Cryptography & Row Level Security (RLS)
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              Your candidate profile, certification scores, and career roadmaps are stored in a managed <strong>Supabase (PostgreSQL)</strong> cluster hosted with enterprise-grade encryption at rest (AES-256) and in transit (TLS 1.3).
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs font-mono">
              <li><strong>Row Level Security (RLS):</strong> Enforced at the database engine level. Only authenticated sessions matching your unique `auth.uid()` can query or modify private profile entries.</li>
              <li><strong>Upstash Redis:</strong> Utilized strictly for distributed rate limiting and transient session token validation. IP addresses are hashed using SHA-256 before storage and expire automatically.</li>
              <li><strong>Leaderboard Visibility:</strong> Global leaderboards display only your self-configured public nickname, score, and certification domain. Your registered email address is never exposed publicly.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Rights under India DPDP Act (2023) & Global Regimes */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#5e6ad2]" />
            4. India DPDP Act (2023) & Global Data Principal Rights
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              Under the Digital Personal Data Protection Act, 2023 (India) and applicable global regulations (GDPR / CCPA), you are granted specific rights regarding your personal data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232]">
                <strong className="text-zinc-900 dark:text-white block mb-1">Right to Access & Portability</strong>
                Download an export of your profile, quiz metrics, and saved interview reports from your Settings console.
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232]">
                <strong className="text-zinc-900 dark:text-white block mb-1">Right to Complete Erasure</strong>
                Trigger an instantaneous cascading delete via <Link href="/settings?tab=danger" className="text-[#5e6ad2] underline">Settings → Danger Zone</Link>, which purges profile records and auth credentials.
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232]">
                <strong className="text-zinc-900 dark:text-white block mb-1">Right to Rectification</strong>
                Update inaccurate nicknames, avatars, or credentials anytime directly within your account settings.
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232]">
                <strong className="text-zinc-900 dark:text-white block mb-1">Right to Grievance Redressal</strong>
                Escalate any privacy, processing, or consent queries to our designated Grievance Officer.
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Grievance Officer & Entity Details */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Building className="w-5 h-5 text-zinc-400" />
            5. Entity Identification & Grievance Redressal
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs text-zinc-600 dark:text-[#8b8b9e]">
            <p>
              In compliance with Section 10 of the India Digital Personal Data Protection Act, 2023, the details of the designated Data Protection Grievance Officer are set forth below:
            </p>
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-[#161622] border border-zinc-200 dark:border-[#222232] font-mono text-xs space-y-1">
              <div><strong>Entity:</strong> MockMate Technologies Private Limited</div>
              <div><strong>Designated Grievance Officer:</strong> Mahesh Sai (Lead Legal & Privacy Counsel)</div>
              <div><strong>Email:</strong> <a href="mailto:grievance@mockmate.dev" className="text-[#5e6ad2] underline">grievance@mockmate.dev</a></div>
              <div><strong>Support Desk:</strong> <a href="mailto:support@mockmate.dev" className="text-[#5e6ad2] underline">support@mockmate.dev</a></div>
              <div><strong>Jurisdiction:</strong> Andhra Pradesh / Hyderabad, India</div>
              <div><strong>Resolution SLA:</strong> Acknowledgment within 24 hours; resolution within 7 business days.</div>
            </div>
          </div>
        </div>

        {/* Quick Links Footer Strip */}
        <div className="border-t border-zinc-200 dark:border-[#1e1e2a] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-[#8b8b9e]">
          <div>© {new Date().getFullYear()} MockMate Technologies. All rights reserved.</div>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cookie Policy</Link>
            <Link href="/refund" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
