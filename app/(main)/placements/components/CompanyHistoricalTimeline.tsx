"use client";

import { useState, useEffect } from "react";
import { getCompanyPlacementHistoryAction } from "@/app/actions/placements-history";
import {
  PlacementHistoryRecord,
  getPlacementQualityCategory,
  PlacementDepartment,
} from "@/types/placements";
import {
  History,
  Calendar,
  Users,
  Award,
  AlertTriangle,
  Briefcase,
  Layers,
  Filter,
} from "lucide-react";

interface CompanyHistoricalTimelineProps {
  companyId?: string;
  companyName: string;
}

export function CompanyHistoricalTimeline({
  companyId,
  companyName,
}: CompanyHistoricalTimelineProps) {
  const [history, setHistory] = useState<PlacementHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState<"ALL" | PlacementDepartment>("ALL");

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCompanyPlacementHistoryAction(
          companyId,
          companyName
        );
        if (isMounted) {
          if (res.success && res.data) {
            setHistory(res.data);
          } else {
            setError(res.error || "Unable to load historical records.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load history."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [companyId, companyName]);

  const filteredHistory = history.filter((item) => {
    if (deptFilter === "ALL") return true;
    return item.department === deptFilter;
  });

  if (loading) {
    return (
      <div className="p-5 rounded-2xl border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 animate-pulse">
          <History className="w-4 h-4 text-blue-500 animate-spin" />
          Loading KLU recruitment track record...
        </div>
      </div>
    );
  }

  if (error || history.length === 0) {
    return null; // Don't show clutter if no past records exist for this recruiter
  }

  // Count distinct seasons this company has visited
  const uniqueYears = new Set(history.map((h) => h.academic_year));

  return (
    <div className="mt-5 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50 p-4 sm:p-5">
      {/* Header answering "How has this company historically recruited at KLU?" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/60 dark:border-[#1e1e2a]">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5e6ad2] dark:text-[#828df8]">
            <History className="w-3.5 h-3.5" />
            Historical Campus Track Record
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef] mt-0.5">
            Recruitment History at KLU ({uniqueYears.size}{" "}
            {uniqueYears.size === 1 ? "Season" : "Seasons"} Recorded)
          </h3>
        </div>

        {/* Department filter metadata toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-200/60 dark:bg-white/[0.04] border border-zinc-200/40 dark:border-[#1e1e2a] text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setDeptFilter("ALL")}
            className={`px-2 py-0.5 rounded text-[11px] transition-all ${
              deptFilter === "ALL"
                ? "bg-white dark:bg-[#181824] font-bold text-[#5e6ad2] dark:text-[#828df8] shadow-sm"
                : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
            }`}
          >
            All Tracks ({history.length})
          </button>
          <button
            onClick={() => setDeptFilter("ECE")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              deptFilter === "ECE"
                ? "bg-white dark:bg-[#181824] font-bold text-[#5e6ad2] dark:text-[#828df8] shadow-sm"
                : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
            }`}
          >
            ECE ({history.filter((h) => h.department === "ECE").length})
          </button>
          <button
            onClick={() => setDeptFilter("CSE")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              deptFilter === "CSE"
                ? "bg-white dark:bg-[#181824] font-bold text-[#5e6ad2] dark:text-[#828df8] shadow-sm"
                : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
            }`}
          >
            CSE ({history.filter((h) => h.department === "CSE").length})
          </button>
        </div>
      </div>

      {/* Unified Company Timeline */}
      <div className="mt-3.5 space-y-2.5">
        {filteredHistory.map((rec) => {
          const qualityInfo =
            rec.data_quality_status && rec.data_quality_status.length > 0
              ? getPlacementQualityCategory(rec.data_quality_status[0])
              : null;

          return (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-white/5 bg-zinc-50/60 dark:bg-white/[0.02] hover:bg-zinc-100/50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Academic Year & Track Title */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20">
                    AY {rec.academic_year}
                  </span>

                  {/* Department Metadata Badge */}
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                    {rec.department}
                  </span>

                  {/* Track / Role / Company Name */}
                  <span className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
                    {rec.company_name}
                  </span>

                  {/* Quality Discrepancy or Structural Note Badge */}
                  {qualityInfo && qualityInfo.category !== "clean" && (
                    <span
                      title={qualityInfo.description}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        qualityInfo.badgeVariant === "warning"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20"
                      }`}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {qualityInfo.label}
                    </span>
                  )}
                </div>

                {/* Compensation Package / CTC */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto font-mono">
                  <Award className="w-3.5 h-3.5" />
                  {rec.package_lpa && rec.package_lpa.length > 0 ? (
                    <span>
                      ₹{rec.package_lpa.join(" / ")} LPA
                    </span>
                  ) : rec.ctc_lpa ? (
                    <span>₹{rec.ctc_lpa} LPA</span>
                  ) : (
                    <span className="text-zinc-400 font-normal">Package Unlisted</span>
                  )}
                </div>
              </div>

              {/* Distinct Metrics Strip (Never Mathematically Combined) */}
              <div className="mt-2.5 pt-2 border-t border-zinc-200/40 dark:border-white/5 flex flex-wrap items-center justify-between text-xs text-zinc-600 dark:text-[#8b8b9e] gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* ECE Metric: Headcount Placed */}
                  {rec.department === "ECE" && rec.students_placed !== null && (
                    <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#5e6ad2]" />
                      <span>
                        Students Placed:{" "}
                        <strong className="font-bold text-zinc-900 dark:text-[#ebebef]">
                          {rec.students_placed}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* CSE Metric: Offers Count */}
                  {rec.department === "CSE" && rec.offers_count !== null && (
                    <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>
                        Total Offers:{" "}
                        <strong className="font-bold text-zinc-900 dark:text-[#ebebef]">
                          {rec.offers_count}
                        </strong>
                        {rec.btech_offers !== null && (
                          <span className="text-[11px] text-zinc-400 dark:text-[#5a5a6e] font-normal ml-1">
                            ({rec.btech_offers} B.Tech
                            {rec.mtech_offers ? `, ${rec.mtech_offers} M.Tech` : ""})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Visit Date */}
                  {rec.visit_date && (
                    <div className="flex items-center gap-1 text-zinc-500 dark:text-[#8b8b9e]">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>Date: {rec.visit_date}</span>
                    </div>
                  )}
                </div>

                {/* Source Provenance */}
                <div className="text-[11px] text-zinc-400 dark:text-[#5a5a6e] font-mono">
                  S.No {rec.source_row_serial_no}
                  {rec.page_number ? ` · p. ${rec.page_number}` : ""}
                </div>
              </div>

              {/* Source Note if present */}
              {rec.source_notes && (
                <div className="mt-1.5 text-[11px] text-amber-600/90 dark:text-amber-400/90 bg-amber-500/5 p-1.5 rounded">
                  Note: {rec.source_notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
