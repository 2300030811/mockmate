import Link from "next/link";
import { CreditCard, CheckCircle2, AlertCircle, Clock, ArrowLeft, Mail, ShieldCheck, RefreshCw } from "lucide-react";
import { HomeBackground } from "@/components/home/HomeBackground";

export const metadata = {
  title: "Cancellation & Refund Policy - MockMate",
  description: "Official cancellation terms, refund eligibility windows, and payment processing procedures for MockMate subscriptions and assessment credits.",
};

export default function RefundPolicyPage() {
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
          <span>Cancellation & Refund Policy</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] text-xs font-mono font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>BILLING & CONSUMER PROTECTION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Cancellation & Refund Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] max-w-2xl leading-relaxed">
            Effective Date: September 27, 2026 • Policy Version: 2.1.0
          </p>
        </div>

        {/* 7-Day Guarantee Callout */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            7-Day Fair Refund Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            We want every candidate to be confident in their preparation. If you purchase an assessment credit package or premium interview tier and are dissatisfied, you may request a <strong>100% full refund within 7 days</strong> of purchase, provided the credits have not been consumed.
          </p>
        </div>

        {/* Section 1: Eligibility Matrix */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#5e6ad2]" />
            1. Refund Eligibility Criteria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Eligible Items */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-2.5">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                ✓ Eligible for Refund
              </span>
              <ul className="text-xs text-zinc-600 dark:text-[#8b8b9e] space-y-2 list-disc list-inside">
                <li>Unconsumed mock interview credit bundles requested within 7 calendar days of transaction.</li>
                <li>Documented platform technical failures (e.g. system disconnect or AI gateway outage during an interview session).</li>
                <li>Accidental duplicate transactions or duplicate billing charges.</li>
                <li>Unused premium certification question bank access within the initial 7-day trial period.</li>
              </ul>
            </div>

            {/* Ineligible Items */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-2.5">
              <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                ✗ Non-Refundable Conditions
              </span>
              <ul className="text-xs text-zinc-600 dark:text-[#8b8b9e] space-y-2 list-disc list-inside">
                <li>Interview sessions that have been fully completed with generated candidate diagnostic reports.</li>
                <li>Consumed ATS resume tailoring tokens (due to real-time LLM computational expense).</li>
                <li>Refund requests submitted past the 7-day statutory guarantee window.</li>
                <li>Accounts terminated due to violations of our Acceptable Use Policy (e.g. prompt injection, bots, abuse).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Cancellation of Subscriptions */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-500" />
            2. Subscription Cancellation
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              You can cancel recurring subscriptions anytime with zero cancellation fees directly from <Link href="/settings" className="text-[#5e6ad2] underline">Settings → Billing</Link>. Upon cancellation:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs font-mono">
              <li>Your subscription will remain active until the end of your current billing period.</li>
              <li>You will not be billed for subsequent billing cycles.</li>
              <li>All historical interview reports, certification results, and badge achievements remain accessible.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Processing Timeframes & Payment Gateways */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
            3. Processing Timelines & Disbursement
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <p>
              Once your refund request is verified by our finance team:
            </p>
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#161622] border border-zinc-200 dark:border-[#222232] font-mono text-xs space-y-1">
              <div><strong>Approval Window:</strong> 24 to 48 business hours.</div>
              <div><strong>Settlement Time:</strong> 5 to 7 business days to reflect in your original payment method (Bank / UPI / Credit Card).</div>
              <div><strong>Gateway Fees:</strong> Any statutory banking interchange charges are absorbed by MockMate.</div>
            </div>
          </div>
        </div>

        {/* Section 4: How to Initiate a Refund */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-[#5e6ad2]" />
            4. How to Request a Refund
          </h2>
          <div className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 text-xs text-zinc-600 dark:text-[#8b8b9e]">
            <p>
              To initiate a cancellation or refund, email our billing desk at <a href="mailto:billing@mockmate.dev" className="text-[#5e6ad2] underline font-semibold">billing@mockmate.dev</a> with the following details:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
              <li>Registered MockMate Email Address</li>
              <li>Transaction / Payment Reference ID</li>
              <li>Date of Purchase</li>
              <li>Brief reason for cancellation (helps our team improve simulation quality)</li>
            </ul>
          </div>
        </div>

        {/* Quick Links Footer Strip */}
        <div className="border-t border-zinc-200 dark:border-[#1e1e2a] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-[#8b8b9e]">
          <div>© {new Date().getFullYear()} MockMate Technologies. All rights reserved.</div>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
