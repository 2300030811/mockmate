"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on full-screen interactive tools
  const hiddenPaths = ["/system-design", "/arena", "/career-path"];
  if (hiddenPaths.some((p) => pathname?.startsWith(p))) return null;

  return (
    <footer className="border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#0d0d12] text-left transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-[22px] h-[22px] rounded-[5px] bg-[#5e6ad2] flex items-center justify-center text-[10px] font-bold text-white leading-none">
                M
              </div>
              <span className="text-[13px] font-semibold text-zinc-900 dark:text-[#ebebef] tracking-[-0.01em]">
                MockMate
              </span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] max-w-sm leading-relaxed">
              Technical career intelligence, campus placement analytics, and autonomous AI interview simulations designed for high-stakes engineering preparation.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400 dark:text-[#5a5a6e]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span>All platform engines nominal</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#5a5a6e] mb-3">
              Placement Hub
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/placements" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Live Drive Radar
                </Link>
              </li>
              <li>
                <Link href="/placements" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Company Directory
                </Link>
              </li>
              <li>
                <Link href="/placements" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Historical Packages
                </Link>
              </li>
              <li>
                <Link href="/career-path" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Career CRM
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#5a5a6e] mb-3">
              Engineering Tools
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/system-design" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  System Design Studio
                </Link>
              </li>
              <li>
                <Link href="/arena" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  1v1 Coding Arena
                </Link>
              </li>
              <li>
                <Link href="/ats-optimizer" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  ATS Resume Optimizer
                </Link>
              </li>
              <li>
                <Link href="/resume-roaster" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Resume Diagnostic
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#5a5a6e] mb-3">
              Legal & Compliance
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Cookie Governance
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Grievance Contact */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-[#1a1a26] text-[11px] text-zinc-500 dark:text-[#717182] space-y-2">
          <p className="leading-relaxed">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Statutory Notice:</span> MockMate interview scores, ATS compatibility ratings, and salary figures (derived from aggregated engineering benchmarks) are heuristic guidance instruments and do not constitute employment guarantees or contractual hiring appraisals.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-400 dark:text-[#5a5a6e]">
            <span>Entity: <strong className="text-zinc-600 dark:text-zinc-300 font-medium">MockMate Technologies Pvt. Ltd.</strong></span>
            <span>•</span>
            <span>Compliance: <strong className="text-zinc-600 dark:text-zinc-300 font-medium">India DPDP Act (2023)</strong></span>
            <span>•</span>
            <span>Grievance Officer: <a href="mailto:grievance@mockmate.dev" className="text-[#5e6ad2] hover:underline">grievance@mockmate.dev</a></span>
            <span>•</span>
            <span>Support: <a href="mailto:support@mockmate.dev" className="text-[#5e6ad2] hover:underline">support@mockmate.dev</a></span>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-4 pt-4 border-t border-zinc-200/60 dark:border-[#161622] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 dark:text-[#5a5a6e]">
          <div>
            © {currentYear} MockMate Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              Cookies
            </Link>
            <Link href="/refund" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              Refund
            </Link>
            <Link href="/about" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
