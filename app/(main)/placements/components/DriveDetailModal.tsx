"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PlacementDriveWithCompany } from "@/types/placements";
import { CompanyHistoricalTimeline } from "./CompanyHistoricalTimeline";
import {
  X,
  Calendar,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Award,
  PlayCircle,
  FileCheck2,
  Clock,
  Sparkles,
} from "lucide-react";

interface DriveDetailModalProps {
  drive: PlacementDriveWithCompany | null;
  onClose: () => void;
}

export function DriveDetailModal({ drive, onClose }: DriveDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (drive) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drive, onClose]);

  if (!drive) return null;

  const company = drive.placement_companies;
  const companyName = company?.name || drive.drive_name;
  const academicYear = drive.placement_academic_years?.year_label || "2025-26";

  const isHighPackage = (drive.package_max_lpa ?? 0) >= 20;
  const isDreamPackage =
    (drive.package_max_lpa ?? 0) >= 10 && !isHighPackage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#0d0d12] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. DOCKED FIXED HEADER ── */}
        <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-[#1e1e2a] flex items-center justify-between shrink-0 bg-zinc-50/80 dark:bg-[#14141e]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base bg-gradient-to-br from-[#5e6ad2]/15 to-indigo-500/20 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/25 shrink-0">
              {companyName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono mb-0.5">
                <span className="px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20">
                  Cohort {academicYear}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {drive.drive_status.toUpperCase()}
                </span>
              </div>
              <h2
                id="drive-modal-title"
                className="text-lg sm:text-xl font-black text-zinc-900 dark:text-[#ebebef] truncate"
              >
                {companyName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          {/* Target Role Pill */}
          {drive.role_title && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5e6ad2] dark:text-[#828df8] p-2.5 rounded-lg bg-[#5e6ad2]/[0.05] border border-[#5e6ad2]/15">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Target Role: <strong className="font-bold">{drive.role_title}</strong></span>
            </div>
          )}

          {/* Compensation Highlight Card */}
          <div
            className={`p-4 rounded-xl border ${
              isHighPackage
                ? "bg-amber-500/[0.04] border-amber-500/30"
                : isDreamPackage
                ? "bg-purple-500/[0.04] border-purple-500/30"
                : "bg-[#5e6ad2]/[0.04] border-[#5e6ad2]/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                Compensation Package (CTC)
              </span>
              {isHighPackage ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  Super Dream Tier
                </span>
              ) : isDreamPackage ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Dream Tier
                </span>
              ) : (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20">
                  Product Core Tier
                </span>
              )}
            </div>

            <div className="mt-2 text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono">
              {drive.raw_package_text ||
                (drive.package_min_lpa === drive.package_max_lpa
                  ? `₹${drive.package_min_lpa} LPA`
                  : `₹${drive.package_min_lpa} - ${drive.package_max_lpa} LPA`)}
            </div>

            {drive.package_values && drive.package_values.length > 1 && (
              <div className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 flex-wrap font-mono">
                <span>Specific Package Tiers:</span>
                {drive.package_values.map((v, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/10 font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    ₹{v} LPA
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#14141e]/70 border border-zinc-200/80 dark:border-[#1e1e2a]">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#5e6ad2]" />
                Date of Campus Visit
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 font-mono">
                {drive.date_of_visit
                  ? new Date(drive.date_of_visit).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Scheduled (2025–26 Cycle)"}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#14141e]/70 border border-zinc-200/80 dark:border-[#1e1e2a]">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <Tag className="w-3.5 h-3.5 text-[#5e6ad2]" />
                Drive Identification
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                {drive.drive_name}
              </div>
            </div>
          </div>

          {/* Typical Selection Rounds */}
          <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-[#ebebef] mb-3">
              <FileCheck2 className="w-4 h-4 text-[#5e6ad2]" />
              Campus Recruitment Rounds
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#181824] border border-zinc-200/80 dark:border-white/5">
                <span className="font-mono text-[10px] text-zinc-400 block font-semibold">Round 1</span>
                <strong className="text-xs text-zinc-800 dark:text-zinc-200 block mt-0.5">Coding OA</strong>
                <span className="text-[10px] text-zinc-400 block mt-0.5">DSA + MCQs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#181824] border border-zinc-200/80 dark:border-white/5">
                <span className="font-mono text-[10px] text-zinc-400 block font-semibold">Round 2</span>
                <strong className="text-xs text-zinc-800 dark:text-zinc-200 block mt-0.5">Technical DSA</strong>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Live Solving</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#181824] border border-zinc-200/80 dark:border-white/5">
                <span className="font-mono text-[10px] text-zinc-400 block font-semibold">Round 3</span>
                <strong className="text-xs text-zinc-800 dark:text-zinc-200 block mt-0.5">Architecture</strong>
                <span className="text-[10px] text-zinc-400 block mt-0.5">System & SQL</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#181824] border border-zinc-200/80 dark:border-white/5">
                <span className="font-mono text-[10px] text-zinc-400 block font-semibold">Round 4</span>
                <strong className="text-xs text-zinc-800 dark:text-zinc-200 block mt-0.5">Techno-HR</strong>
                <span className="text-[10px] text-zinc-400 block mt-0.5">STAR Behavioral</span>
              </div>
            </div>
          </div>

          {/* Source & Provenance */}
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#14141e]/50 border border-zinc-200/70 dark:border-[#1e1e2a] text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 font-mono">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Source Verification Provenance
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Campus Record
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Verification Channel:</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
                {drive.source_type === "outlook_email"
                  ? "Outlook Campus Sync Desk"
                  : drive.source_reference || "2025_2026_KLU_PLACEMENTS_REPORT.pdf"}
              </span>
            </div>
            {drive.notes && (
              <div className="flex items-center justify-between text-[11px]">
                <span>Audit Note:</span>
                <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-[280px]">
                  {drive.notes}
                </span>
              </div>
            )}
          </div>

          {/* Historical Track Record (Clean full display without inner scroll lock) */}
          <CompanyHistoricalTimeline
            companyId={company?.id}
            companyName={companyName}
          />
        </div>

        {/* ── 3. DOCKED STICKY FOOTER (ALWAYS VISIBLE) ── */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-50/90 dark:bg-[#14141e]/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#5e6ad2] hover:bg-[#828df8] text-white font-semibold text-xs shadow-md shadow-[#5e6ad2]/20 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            Practice Mock Interview for {companyName}
          </Link>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium text-xs bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-white/15 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
