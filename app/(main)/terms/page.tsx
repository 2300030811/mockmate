import Link from "next/link";
import { Scale, Gavel, AlertCircle, ShieldAlert, Code2, ArrowLeft, Building2 } from "lucide-react";
import { HomeBackground } from "@/components/home/HomeBackground";

export const metadata = {
  title: "Terms & Conditions - MockMate",
  description: "Platform terms of service, acceptable use policies for Monaco/Sandpack virtual sandboxes, and AI assessment disclaimers.",
};

export default function TermsOfServicePage() {
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
          <span>Terms of Service</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] text-xs font-mono font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>PLATFORM USER AGREEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Terms & Conditions of Service
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] max-w-2xl leading-relaxed">
            Effective Date: September 27, 2026 • Document Version: 2.4.0
          </p>
        </div>

        {/* Section 1: Acceptance & Educational Scope */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Gavel className="w-5 h-5 text-[#5e6ad2]" />
            1. Acceptance of Terms & Educational Scope
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              By creating an account, browsing, or executing any assessments on MockMate (&quot;MockMate Technologies&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-[#5e6ad2] underline">Privacy Policy</Link>. If you do not agree to these terms, you must discontinue use immediately.
            </p>
            <p>
              MockMate is an educational technology and career diagnostic platform providing automated programming simulations, certification quiz evaluations, and AI-driven interview practice.
            </p>
          </div>
        </div>

        {/* Section 2: CRITICAL DISCLAIMER ON ATS SCORES & SALARIES */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>2. Essential Disclaimers: ATS Scoring, Salary Benchmarks & AI Simulations</span>
          </div>
          <div className="text-xs sm:text-sm text-zinc-700 dark:text-[#d1d1dc] leading-relaxed space-y-2">
            <p>
              <strong>Guidance & Educational Purpose Only:</strong> MockMate&apos;s ATS Resume Scores, Keyword Match Rates, and AI Mock Interview feedback reports are derived via heuristic algorithms and large language model evaluations. They constitute <strong>advisory career guidance tools only</strong> and are not guaranteed to reflect official applicant tracking systems used by specific employers.
            </p>
            <p>
              <strong>Salary Figures are Statistical Benchmarks:</strong> All compensation data presented across the platform (including values derived from <code>data/salaries.india.json</code>) represent non-binding statistical medians collected from industry public surveys and alumni reports. <strong>They are not guaranteed offers of employment, binding appraisals, or promises of compensation</strong> from any recruiting organization or partner entity.
            </p>
            <p>
              <strong>No Guarantee of Employment:</strong> Completion of mock interviews, coding challenges, or achieving a high Elo rating on MockMate does not guarantee job placement, interview offers, or hiring outcomes with any third-party employer or campus placement cell.
            </p>
          </div>
        </div>

        {/* Section 3: Acceptable Use & Sandbox Security */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-violet-500" />
            3. Acceptable Use & Developer Sandbox Security
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              MockMate provides virtual execution environments (Monaco Code Editor and CodeSandbox Sandpack). You agree to adhere strictly to the following acceptable use boundaries:
            </p>
            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232]">
                <strong className="text-red-600 dark:text-red-400">Prohibited Code:</strong> You may not write, compile, or execute code designed to perform Denial of Service (DoS), port scanning, network penetration, unauthorized data scraping, crypto-mining, or escape from virtual container sandboxes.
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232]">
                <strong className="text-red-600 dark:text-red-400">Rate Limits & Automation:</strong> You shall not use bots, spiders, or automated scripts to systematically harvest quizzes, solve challenges, or artificially inflate leaderboard scores.
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232]">
                <strong className="text-red-600 dark:text-red-400">Prompt Injection & Model Abuse:</strong> Prompt manipulation, jailbreaking, or attempts to extract system instructions from Bob or our underlying AI gateways are strictly prohibited.
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] pt-1">
              Violation of these acceptable use policies will result in immediate account termination, leaderboard score revocation, and IP-level bans.
            </p>
          </div>
        </div>

        {/* Section 4: Intellectual Property & Ownership */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-emerald-500" />
            4. Intellectual Property & Document Ownership
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              <strong>Your Content:</strong> You retain full copyright and ownership of any resume files, code solutions, or architectural diagrams you author and upload to MockMate. You grant MockMate an irrevocable, royalty-free, limited license solely to parse, analyze, and format your content for the execution of platform services.
            </p>
            <p>
              <strong>MockMate IP:</strong> The MockMate brand, platform architecture, system design canvas software, proprietary scoring weights, curated challenge repositories, and Bob persona assets remain the exclusive intellectual property of MockMate Technologies.
            </p>
          </div>
        </div>

        {/* Section 5: Subscription Billing & Refund Policy Reference */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-zinc-400" />
            5. Payment Terms & Refund Policy
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              Access to core campus placement trackers, standard certification quizzes, and daily challenges is free. Premium services, including unmetered AI voice interview simulations and detailed ATS tailoring diagnostics, are subject to transparent usage credit pricing.
            </p>
            <p>
              For comprehensive terms regarding cancellations, credit expirations, and our 7-day guarantee on unconsumed service bundles, please refer to our dedicated <Link href="/refund" className="text-[#5e6ad2] underline font-semibold">Cancellation & Refund Policy</Link>.
            </p>
          </div>
        </div>

        {/* Section 6: Limitation of Liability & Dispute Jurisdiction */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#5e6ad2]" />
            6. Limitation of Liability & Governing Law
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOCKMATE AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR CAREER OPPORTUNITIES ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE. MOCKMATE&apos;S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU IN THE THREE (3) MONTHS PRECEDING THE CLAIM.
            </p>
            <p>
              <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad / Vijayawada, India.
            </p>
          </div>
        </div>

        {/* Quick Links Footer Strip */}
        <div className="border-t border-zinc-200 dark:border-[#1e1e2a] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-[#8b8b9e]">
          <div>© {new Date().getFullYear()} MockMate Technologies. All rights reserved.</div>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cookie Policy</Link>
            <Link href="/refund" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
