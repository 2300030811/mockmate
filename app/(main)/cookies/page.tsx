import Link from "next/link";
import { Cookie, ShieldCheck, Settings, Info, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { HomeBackground } from "@/components/home/HomeBackground";

export const metadata = {
  title: "Cookie Governance Policy - MockMate",
  description: "Comprehensive inventory of cookies, local storage tokens, and telemetry governance implemented across the MockMate platform.",
};

export default function CookiePolicyPage() {
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
          <span>Cookie Policy</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] text-xs font-mono font-semibold">
            <Cookie className="w-3.5 h-3.5" />
            <span>COOKIE GOVERNANCE & LOCAL STORAGE AUDIT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Cookie Policy & Storage Telemetry
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] max-w-2xl leading-relaxed">
            Effective Date: September 27, 2026 • Policy Version: 2.1.0
          </p>
        </div>

        {/* Executive Summary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Zero Third-Party Advertising Trackers
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            MockMate maintains a strict privacy-first architecture. <strong>We do not embed third-party advertising cookies, cross-site behavioral tracking scripts, or data broker pixels.</strong> All cookies and browser storage keys are strictly dedicated to user authentication, security rate-limiting, and functional development preferences.
          </p>
        </div>

        {/* Section 1: Detailed Storage Inventory Table */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#5e6ad2]" />
            1. Comprehensive Cookie & Storage Inventory
          </h2>

          <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-[#161622] text-zinc-400 dark:text-[#8b8b9e] border-b border-zinc-200 dark:border-[#1e1e2a] font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 px-4">Identifier / Key</th>
                    <th className="p-3.5 px-4">Category</th>
                    <th className="p-3.5 px-4">Purpose</th>
                    <th className="p-3.5 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-[#1e1e2a]/80 font-mono text-[11px]">
                  {/* Auth */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-[#181824] transition-colors">
                    <td className="p-3.5 px-4 font-bold text-zinc-900 dark:text-white">sb-*-auth-token</td>
                    <td className="p-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                        Strictly Necessary
                      </span>
                    </td>
                    <td className="p-3.5 px-4 font-sans text-zinc-600 dark:text-[#8b8b9e]">
                      Maintains encrypted Supabase user authentication sessions and refresh tokens across pages.
                    </td>
                    <td className="p-3.5 px-4 text-zinc-500">Session / 14 Days</td>
                  </tr>

                  {/* Theme */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-[#181824] transition-colors">
                    <td className="p-3.5 px-4 font-bold text-zinc-900 dark:text-white">theme</td>
                    <td className="p-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                        Functional
                      </span>
                    </td>
                    <td className="p-3.5 px-4 font-sans text-zinc-600 dark:text-[#8b8b9e]">
                      Remembers your dark/light interface preference in NextThemes to prevent visual flashes.
                    </td>
                    <td className="p-3.5 px-4 text-zinc-500">1 Year</td>
                  </tr>

                  {/* Challenge Code */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-[#181824] transition-colors">
                    <td className="p-3.5 px-4 font-bold text-zinc-900 dark:text-white">mockmate_dc_*</td>
                    <td className="p-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                        Functional
                      </span>
                    </td>
                    <td className="p-3.5 px-4 font-sans text-zinc-600 dark:text-[#8b8b9e]">
                      Stores your in-progress Monaco code for daily challenges so work is never lost on refresh.
                    </td>
                    <td className="p-3.5 px-4 text-zinc-500">Persistent LocalStorage</td>
                  </tr>

                  {/* Cookie Consent */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-[#181824] transition-colors">
                    <td className="p-3.5 px-4 font-bold text-zinc-900 dark:text-white">mockmate_cookie_consent</td>
                    <td className="p-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                        Strictly Necessary
                      </span>
                    </td>
                    <td className="p-3.5 px-4 font-sans text-zinc-600 dark:text-[#8b8b9e]">
                      Records your consent decision for non-essential cookies.
                    </td>
                    <td className="p-3.5 px-4 text-zinc-500">1 Year</td>
                  </tr>

                  {/* Upstash Hash */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-[#181824] transition-colors">
                    <td className="p-3.5 px-4 font-bold text-zinc-900 dark:text-white">Upstash Redis Hash</td>
                    <td className="p-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[10px]">
                        Security
                      </span>
                    </td>
                    <td className="p-3.5 px-4 font-sans text-zinc-600 dark:text-[#8b8b9e]">
                      Server-side sliding window counter used to prevent abuse and DDoS attacks on our AI execution gateways.
                    </td>
                    <td className="p-3.5 px-4 text-zinc-500">1 Hour Rolling TTL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2: Cookie Governance & Management */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Info className="w-5 h-5 text-amber-500" />
            2. Managing & Clearing Your Browser Preferences
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              You can control and configure cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs font-mono">
              <li><strong>Chrome / Edge:</strong> Settings → Privacy and Security → Third-party cookies.</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection.</li>
              <li><strong>Safari:</strong> Settings → Privacy → Prevent cross-site tracking.</li>
            </ul>
            <p className="text-xs pt-1">
              Note: Blocking strictly necessary cookies (`sb-*-auth-token`) will disable authentication and prevent you from accessing your saved quizzes and private mock interview reports.
            </p>
          </div>
        </div>

        {/* Quick Links Footer Strip */}
        <div className="border-t border-zinc-200 dark:border-[#1e1e2a] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-[#8b8b9e]">
          <div>© {new Date().getFullYear()} MockMate Technologies. All rights reserved.</div>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
