"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { drivePackage, tierOf } from "@/lib/utils/placement-tier";
import {
  PlacementEvent,
  PlacementAnnouncement,
  PlacementDriveWithCompany,
} from "@/types/placements";
import { DeadlineWithUrgency } from "@/app/actions/placements";
import { GroupedDriveSchedule } from "@/lib/services/placement-engine";
import {
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Award,
  Building2,
  Briefcase,
  ChevronRight,
  FileCheck2,
  Layers,
  GraduationCap,
  PlayCircle,
  Flame,
  TrendingUp,
  Radio,
  UploadCloud,
  Check,
  Code2,
  Users,
  Search,
  Filter,
  X,
} from "lucide-react";

function getEventTypeDetails(type: string) {
  switch (type) {
    case "CODING_ASSESSMENT":
      return {
        label: "Online Assessment (OA)",
        color: "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#828df8] border-[#5e6ad2]/30",
        icon: Code2,
      };
    case "TECHNICAL_INTERVIEW":
      return {
        label: "Technical Interview",
        color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        icon: Briefcase,
      };
    case "HR_INTERVIEW":
      return {
        label: "Techno-Managerial / HR",
        color: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
        icon: Users,
      };
    case "REGISTRATION_DEADLINE":
      return {
        label: "Registration Deadline",
        color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: Clock,
      };
    case "PPT":
      return {
        label: "Pre-Placement Talk (PPT)",
        color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        icon: Megaphone,
      };
    default:
      return {
        label: "Campus Drive Event",
        color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: Building2,
      };
  }
}

function getRelativeDayString(startTime: string) {
  const now = new Date();
  const eventDate = new Date(startTime);
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  const weeks = Math.floor(diffDays / 7);
  return `In ${weeks} week${weeks > 1 ? "s" : ""}`;
}

interface CommandCenterViewProps {
  todayEvents: PlacementEvent[];
  todayGroupedDrives?: GroupedDriveSchedule[];
  upcomingEvents: PlacementEvent[];
  deadlines: DeadlineWithUrgency[];
  announcements: PlacementAnnouncement[];
  todayDateIST: string;
  drives?: PlacementDriveWithCompany[];
  onExploreDirectory: () => void;
  onSelectTier?: (tier: string) => void;
  onSelectDrive?: (drive: PlacementDriveWithCompany) => void;
  onSwitchTab?: (tab: "command_center" | "directory" | "import") => void;
}

export function CommandCenterView({
  todayEvents,
  todayGroupedDrives = [],
  upcomingEvents,
  deadlines,
  announcements,
  todayDateIST,
  drives = [],
  onExploreDirectory,
  onSelectTier,
  onSelectDrive,
  onSwitchTab,
}: CommandCenterViewProps) {
  const formattedToday = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const totalTodayEventsCount =
    todayGroupedDrives.length > 0
      ? todayGroupedDrives.reduce((acc, d) => acc + d.stages.length, 0)
      : todayEvents.length;

  // Compute tier metrics dynamically from drives (ponytail: zero fabricated fallback counts)
  const tierDistribution = useMemo(() => {
    let superDreamCount = 0;
    let dreamCount = 0;
    let coreCount = 0;
    let massCount = 0;

    let superDreamSum = 0;
    let dreamSum = 0;
    let coreSum = 0;
    let massSum = 0;

    drives.forEach((d) => {
      const p = drivePackage(d);
      if (p !== null && p > 0) {
        const tier = tierOf(p);
        if (tier === "super_dream") {
          superDreamCount++;
          superDreamSum += p;
        } else if (tier === "dream") {
          dreamCount++;
          dreamSum += p;
        } else if (tier === "core") {
          coreCount++;
          coreSum += p;
        } else if (tier === "mass") {
          massCount++;
          massSum += p;
        }
      }
    });

    const total = drives.length;
    return {
      superDream: {
        count: superDreamCount,
        pct: total > 0 ? Math.round((superDreamCount / total) * 100) : 0,
        avg: superDreamCount > 0 ? (superDreamSum / superDreamCount).toFixed(1) : "—",
      },
      dream: {
        count: dreamCount,
        pct: total > 0 ? Math.round((dreamCount / total) * 100) : 0,
        avg: dreamCount > 0 ? (dreamSum / dreamCount).toFixed(1) : "—",
      },
      core: {
        count: coreCount,
        pct: total > 0 ? Math.round((coreCount / total) * 100) : 0,
        avg: coreCount > 0 ? (coreSum / coreCount).toFixed(1) : "—",
      },
      mass: {
        count: massCount,
        pct: total > 0 ? Math.round((massCount / total) * 100) : 0,
        avg: massCount > 0 ? (massSum / massCount).toFixed(1) : "—",
      },
    };
  }, [drives]);

  // Top recruiter benchmark drives for the historical highlights section
  const marqueeDrives = useMemo(() => {
    const sorted = [...drives]
      .filter((d) => {
        const p = drivePackage(d);
        return p !== null && p >= 11;
      })
      .sort((a, b) => (drivePackage(b) ?? 0) - (drivePackage(a) ?? 0));
    return sorted.slice(0, 6);
  }, [drives]);

  const [radarFilter, setRadarFilter] = useState<"all" | "assessments" | "interviews">("all");
  const [radarSearch, setRadarSearch] = useState("");

  const assessmentCount = useMemo(
    () => upcomingEvents.filter((e) => e.event_type === "CODING_ASSESSMENT").length,
    [upcomingEvents]
  );

  const interviewCount = useMemo(
    () =>
      upcomingEvents.filter(
        (e) => e.event_type === "TECHNICAL_INTERVIEW" || e.event_type === "HR_INTERVIEW"
      ).length,
    [upcomingEvents]
  );

  const filteredUpcomingEvents = useMemo(() => {
    return upcomingEvents.filter((evt) => {
      if (radarFilter === "assessments" && evt.event_type !== "CODING_ASSESSMENT") {
        return false;
      }
      if (
        radarFilter === "interviews" &&
        evt.event_type !== "TECHNICAL_INTERVIEW" &&
        evt.event_type !== "HR_INTERVIEW"
      ) {
        return false;
      }
      if (radarSearch.trim()) {
        const q = radarSearch.toLowerCase();
        const compName = (
          evt.placement_drives?.placement_companies?.name ||
          evt.placement_drives?.drive_name ||
          evt.title
        ).toLowerCase();
        const role = (evt.placement_drives?.role_title || "").toLowerCase();
        const venue = (evt.venue || "").toLowerCase();
        return compName.includes(q) || role.includes(q) || venue.includes(q);
      }
      return true;
    });
  }, [upcomingEvents, radarFilter, radarSearch]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ── 1. TODAY ENGINE: LIVE RADAR (TRUTHFUL CURRENT STATUS) ── */}
      <section className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-7 shadow-sm transition-colors">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-[#1e1e2a]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {todayGroupedDrives.length > 0 ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Live Campus Radar
                  </span>
                </>
              ) : (
                <>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-400 dark:bg-zinc-500" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                    Campus Radar • Standby
                  </span>
                </>
              )}
              <span className="text-zinc-300 dark:text-[#2a2a3c]">/</span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                IST: Asia/Kolkata
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-[#ebebef] tracking-tight">
              Today on Campus
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5 font-mono">
              {formattedToday}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {todayGroupedDrives.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {totalTodayEventsCount} Active Session{totalTodayEventsCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200/80 dark:border-[#1e1e2a]">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                No Sessions Scheduled Today
              </span>
            )}
          </div>
        </div>

        {/* Content: Show active drives if any exist; otherwise show truthful empty state */}
        <div className="mt-5">
          {todayGroupedDrives.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todayGroupedDrives.map((group) => (
                <div
                  key={group.driveId}
                  className={`rounded-xl p-4 sm:p-5 border transition-all ${
                    group.isCancelled
                      ? "border-rose-500/30 bg-rose-500/[0.02]"
                      : "border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/60 hover:border-[#5e6ad2]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-200/50 dark:border-white/5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-[#ebebef] truncate">
                          {group.companyName}
                        </h3>
                        {group.packageText && (
                          <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            {group.packageText}
                          </span>
                        )}
                      </div>
                      {group.roleTitle && (
                        <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5 truncate">
                          {group.roleTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px] font-mono">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#5e6ad2] dark:text-[#828df8] bg-[#5e6ad2]/10 px-1.5 py-0.5 rounded border border-[#5e6ad2]/20">
                          <Building2 className="w-3 h-3" />
                          Campus Placement Desk
                        </span>
                        {group.dataVerified && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active Schedule
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {group.isCancelled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          CANCELLED
                        </span>
                      ) : group.driveStatus === "ongoing" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                          LIVE NOW
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20 uppercase">
                          {group.driveStatus.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {group.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-lg text-xs ${
                          group.isCancelled
                            ? "bg-rose-500/5 text-zinc-400 line-through opacity-75"
                            : stage.isCurrent
                            ? "bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 shadow-sm"
                            : stage.isCompleted
                            ? "bg-emerald-500/[0.04] border border-emerald-500/15"
                            : "bg-white/60 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {stage.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : stage.isCurrent ? (
                            <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#828df8] opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5e6ad2]" />
                            </span>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-zinc-400 dark:border-zinc-600 shrink-0" />
                          )}
                          <span className="font-mono font-bold text-zinc-900 dark:text-[#ebebef]">
                            {new Date(stage.startTime).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Kolkata",
                            })}
                          </span>
                          <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                            {stage.title}
                          </span>
                        </div>
                        {stage.venue && (
                          <span className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1 shrink-0 font-mono">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            {stage.venue}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TRUTHFUL EMPTY STATE: When no drives are running today */
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/40 dark:bg-[#101018]/50 p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#2a2a3c] text-zinc-500 dark:text-[#8b8b9e] mb-3.5">
                <Radio className="w-6 h-6 text-zinc-400 dark:text-[#8b8b9e]" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                No Campus Recruitment Drives Scheduled for Today
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] max-w-lg leading-relaxed">
                There are no active company visits, online assessments (OA), or interview rounds scheduled on campus for today. The live radar updates automatically as new placement desk notices or calendar invites are synced.
              </p>

              {/* Next on Live Radar Preview banner if upcoming events exist */}
              {upcomingEvents.length > 0 && (
                <div className="mt-4 w-full max-w-lg p-3 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-between gap-3 text-xs text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8] flex items-center justify-center font-bold text-xs shrink-0">
                      {(
                        upcomingEvents[0].placement_drives?.placement_companies?.name ||
                        upcomingEvents[0].title
                      ).charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#5e6ad2] dark:text-[#828df8] font-bold block">
                        {upcomingEvents[0].placement_drives?.drive_status === "cancelled"
                          ? "Cancelled Session"
                          : "Next on Live Radar"}
                      </span>
                      <p className="font-semibold text-zinc-900 dark:text-[#ebebef] truncate">
                        {upcomingEvents[0].placement_drives?.placement_companies?.name ||
                          upcomingEvents[0].title}
                        {upcomingEvents[0].placement_drives?.role_title && (
                          <span className="text-zinc-500 font-normal">
                            {" "}
                            • {upcomingEvents[0].placement_drives.role_title}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <span className="text-zinc-500 dark:text-[#8b8b9e] block">
                      {new Date(upcomingEvents[0].start_time).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        timeZone: "Asia/Kolkata",
                      })}
                    </span>
                    {upcomingEvents[0].placement_drives?.drive_status === "cancelled" ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {getRelativeDayString(upcomingEvents[0].start_time)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onExploreDirectory}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#5e6ad2] hover:bg-[#828df8] text-white shadow-sm transition-all"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Explore All {drives.length} Drives
                </button>
                {onSwitchTab && (
                  <button
                    onClick={() => onSwitchTab("import")}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/[0.09] text-zinc-700 dark:text-[#ebebef] border border-zinc-200/80 dark:border-[#2a2a3c] transition-all"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#8b8b9e]" />
                    Import Notice / Circular
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. UPCOMING DRIVES & ASSESSMENT RADAR (NEXT 30 DAYS) ── */}
      <section className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-7 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-[#1e1e2a]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5e6ad2]" />
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5e6ad2] dark:text-[#828df8]">
                Schedule Telemetry • Next 30 Days
              </span>
              <span className="text-zinc-300 dark:text-[#2a2a3c]">/</span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                Asia/Kolkata
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-[#ebebef] tracking-tight">
              Upcoming Drives & Assessment Radar
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Verified online assessments (OA), technical interviews, and registration deadlines across campus recruitment partners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20">
              <Calendar className="w-3.5 h-3.5 text-[#5e6ad2]" />
              {upcomingEvents.length} Upcoming Session{upcomingEvents.length !== 1 ? "s" : ""}
            </span>
            {deadlines.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {deadlines.length} Open Deadline{deadlines.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Filter Toolbar */}
        {upcomingEvents.length > 0 && (
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-[#1e1e2a] pb-4">
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-[#1e1e2a] self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setRadarFilter("all")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  radarFilter === "all"
                    ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-xs border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                All Events ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setRadarFilter("assessments")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  radarFilter === "assessments"
                    ? "bg-white dark:bg-[#181824] text-[#5e6ad2] dark:text-[#828df8] shadow-xs border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <span>Assessments</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#5e6ad2]/10 font-bold">{assessmentCount}</span>
              </button>
              <button
                onClick={() => setRadarFilter("interviews")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  radarFilter === "interviews"
                    ? "bg-white dark:bg-[#181824] text-purple-600 dark:text-purple-400 shadow-xs border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <span>Interviews</span>
                <span className="text-[10px] font-mono px-1 rounded bg-purple-500/10 font-bold">{interviewCount}</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by company or role..."
                value={radarSearch}
                onChange={(e) => setRadarSearch(e.target.value)}
                className="w-full text-xs rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50 dark:bg-[#181824] pl-8 pr-7 py-1.5 text-zinc-900 dark:text-[#ebebef] placeholder-zinc-400 dark:placeholder-[#5a5a6e] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
              />
              {radarSearch && (
                <button
                  onClick={() => setRadarSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Content */}
        <div className="mt-5 space-y-6">
          {upcomingEvents.length > 0 ? (
            filteredUpcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredUpcomingEvents.map((evt) => {
                const typeDetails = getEventTypeDetails(evt.event_type);
                const TypeIcon = typeDetails.icon;
                const companyName =
                  evt.placement_drives?.placement_companies?.name ||
                  evt.placement_drives?.drive_name ||
                  evt.title;
                const role = evt.placement_drives?.role_title;
                const pkg =
                  evt.placement_drives?.package_max_lpa ??
                  evt.placement_drives?.package_min_lpa;
                const isCancelled = evt.placement_drives?.drive_status === "cancelled";
                const countdown = getRelativeDayString(evt.start_time);
                const eventDateFormatted = new Date(evt.start_time).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                });
                const eventTimeFormatted = new Date(evt.start_time).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                });

                return (
                  <div
                    key={evt.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col justify-between group ${
                      isCancelled
                        ? "border-rose-500/25 dark:border-rose-500/20 bg-rose-500/[0.02] dark:bg-rose-500/[0.04]"
                        : "border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/60 hover:border-[#5e6ad2]/50 hover:bg-white dark:hover:bg-[#1c1c2b]"
                    }`}
                  >
                    <div>
                      {/* Top Row: Company & Badge */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200/50 dark:border-white/5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br from-[#5e6ad2]/15 to-indigo-500/25 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/30 shrink-0">
                            {companyName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-[#ebebef] truncate group-hover:text-[#5e6ad2] dark:group-hover:text-[#828df8] transition-colors">
                              {companyName}
                            </h3>
                            {role && (
                              <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] truncate mt-0.5">
                                {role}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3 h-3" />
                              Cancelled
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${typeDetails.color}`}>
                              <TypeIcon className="w-3 h-3" />
                              {typeDetails.label}
                            </span>
                          )}
                          {pkg && pkg > 0 && (
                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                              ₹{pkg.toFixed(2)} LPA
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Details: Date, Time & Venue */}
                      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#5e6ad2] shrink-0" />
                          <span>{eventDateFormatted}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-[#8b8b9e] font-mono">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{eventTimeFormatted}</span>
                          {isCancelled ? (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                              Cancelled
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              {countdown}
                            </span>
                          )}
                        </div>
                        {evt.venue && (
                          <div className="sm:col-span-2 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{evt.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                      <Link
                        href="/demo"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5e6ad2] dark:text-[#828df8] hover:underline"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Simulate Interview on MockMate</span>
                      </Link>
                      <button
                        onClick={onExploreDirectory}
                        className="text-[11px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-0.5"
                      >
                        <span>Recruiter Intel</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/40 dark:bg-[#101018]/50 p-6 text-center">
              <Filter className="w-5 h-5 text-zinc-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                No matching events found
              </h4>
              <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1">
                No upcoming drives match &ldquo;{radarSearch || radarFilter}&rdquo;.
              </p>
              <button
                onClick={() => {
                  setRadarFilter("all");
                  setRadarSearch("");
                }}
                className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e2a] hover:bg-zinc-200 dark:hover:bg-[#252535] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/40 dark:bg-[#101018]/50 p-6 text-center">
            <Calendar className="w-6 h-6 text-zinc-400 dark:text-[#8b8b9e] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No Upcoming Drives or Assessments in the next 30 days
            </h4>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 max-w-md mx-auto">
              Notices imported via the Placement Notice Desk will appear here automatically once confirmed.
            </p>
          </div>
        )}

          {/* Active Deadlines Tracker if any exist */}
          {deadlines.length > 0 && (
            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-[#1e1e2a]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef]">
                    Upcoming Registration Deadlines
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                  Act fast before portals close
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {deadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.02] dark:bg-amber-500/[0.04] flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-zinc-900 dark:text-[#ebebef] truncate">
                          {dl.placement_drives?.placement_companies?.name || dl.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] truncate mt-0.5">
                        {dl.title}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-amber-700 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Closes {new Date(dl.start_time).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" })}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      {dl.urgency?.label || "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. TOP RECRUITER CTC BENCHMARKS & MARQUEE HIGHLIGHTS ── */}
      <section className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-7 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-[#1e1e2a]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Historical Hiring Telemetry • 2025–26 Cycle
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-[#ebebef] tracking-tight">
              Top Recruiter CTC Benchmarks & Marquee Highlights
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Compensation benchmarks and interview tracks from KLU&apos;s {drives.length} partner recruiters. Click any recruiter to inspect round-by-round selection intelligence.
            </p>
          </div>

          <button
            onClick={onExploreDirectory}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5e6ad2] dark:text-[#828df8] hover:underline self-start sm:self-auto shrink-0"
          >
            <span>Browse all {drives.length} drives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Marquee Recruiter Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {marqueeDrives.map((drive) => {
            const companyName = drive.placement_companies?.name || drive.drive_name;
            const maxPkg = drive.package_max_lpa ?? drive.package_min_lpa ?? 0;
            const isSuperDream = maxPkg >= 20;

            return (
              <div
                key={drive.id}
                onClick={() => onSelectDrive?.(drive)}
                className="group p-4 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/60 hover:border-[#5e6ad2]/50 hover:bg-white dark:hover:bg-[#1c1c2b] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-gradient-to-br from-[#5e6ad2]/15 to-indigo-500/20 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/25 shrink-0">
                        {companyName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] truncate group-hover:text-[#5e6ad2] dark:group-hover:text-[#828df8] transition-colors">
                          {companyName}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#5e6ad2]" />
                          Campus Partner
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-mono font-black text-xs px-2 py-0.5 rounded border shrink-0 ${
                        isSuperDream
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30"
                      }`}
                    >
                      ₹{maxPkg.toFixed(2)} LPA
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-zinc-600 dark:text-[#8b8b9e] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      {drive.role_title || "Software Development Engineer"}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-zinc-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 dark:text-[#5a5a6e] font-mono">
                    {drive.date_of_visit
                      ? new Date(drive.date_of_visit).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })
                      : "2025–26 Cycle"}
                  </span>
                  <span className="font-semibold text-[#5e6ad2] dark:text-[#828df8] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Inspect Intelligence
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. COMPENSATION TIER DISTRIBUTION MATRIX ── */}
      <section className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-7 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-zinc-100 dark:border-[#1e1e2a]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5e6ad2] dark:text-[#828df8]">
                Cohort Analytics
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-[#ebebef] tracking-tight">
              Compensation Tier Distribution Matrix
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
              Breakdown of all {drives.length} campus drives by CTC classification. Click any tier to filter the directory.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200/60 dark:border-[#1e1e2a] self-start sm:self-auto">
            {drives.length} Total Drives
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Super Dream */}
          <div
            onClick={() => onSelectTier?.("super_dream")}
            className="group p-4 rounded-xl border border-amber-500/25 dark:border-amber-500/20 bg-amber-500/[0.03] hover:border-amber-500/60 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Super Dream
                </span>
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  ≥ 20 LPA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-zinc-900 dark:text-[#ebebef] font-mono">
                  {tierDistribution.superDream.count}
                </div>
                <div className="text-xs text-zinc-500 dark:text-[#8b8b9e] font-mono">
                  drives ({tierDistribution.superDream.pct}%)
                </div>
              </div>
              <div className="mt-3 w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tierDistribution.superDream.pct}%` }}
                />
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-amber-500/10 flex items-center justify-between text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
              <span className="font-mono">
                Avg: {tierDistribution.superDream.avg !== "—" ? `₹${tierDistribution.superDream.avg} LPA` : "—"}
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Filter <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Dream */}
          <div
            onClick={() => onSelectTier?.("dream")}
            className="group p-4 rounded-xl border border-purple-500/25 dark:border-purple-500/20 bg-purple-500/[0.03] hover:border-purple-500/60 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  Dream Tier
                </span>
                <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                  10–20 LPA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-zinc-900 dark:text-[#ebebef] font-mono">
                  {tierDistribution.dream.count}
                </div>
                <div className="text-xs text-zinc-500 dark:text-[#8b8b9e] font-mono">
                  drives ({tierDistribution.dream.pct}%)
                </div>
              </div>
              <div className="mt-3 w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tierDistribution.dream.pct}%` }}
                />
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-purple-500/10 flex items-center justify-between text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
              <span className="font-mono">
                Avg: {tierDistribution.dream.avg !== "—" ? `₹${tierDistribution.dream.avg} LPA` : "—"}
              </span>
              <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Filter <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Core */}
          <div
            onClick={() => onSelectTier?.("standard")}
            className="group p-4 rounded-xl border border-[#5e6ad2]/25 dark:border-[#5e6ad2]/20 bg-[#5e6ad2]/[0.03] hover:border-[#5e6ad2]/60 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#5e6ad2] dark:text-[#828df8] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#5e6ad2]" />
                  Product Core
                </span>
                <span className="font-mono text-xs font-bold text-[#5e6ad2] dark:text-[#828df8]">
                  5–10 LPA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-zinc-900 dark:text-[#ebebef] font-mono">
                  {tierDistribution.core.count}
                </div>
                <div className="text-xs text-zinc-500 dark:text-[#8b8b9e] font-mono">
                  drives ({tierDistribution.core.pct}%)
                </div>
              </div>
              <div className="mt-3 w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#5e6ad2] h-full rounded-full transition-all duration-500"
                  style={{ width: `${tierDistribution.core.pct}%` }}
                />
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-[#5e6ad2]/10 flex items-center justify-between text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
              <span className="font-mono">
                Avg: {tierDistribution.core.avg !== "—" ? `₹${tierDistribution.core.avg} LPA` : "—"}
              </span>
              <span className="font-semibold text-[#5e6ad2] dark:text-[#828df8] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Filter <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Foundation / Mass */}
          <div
            onClick={() => onSelectTier?.("mass")}
            className="group p-4 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/50 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  Foundation / Services
                </span>
                <span className="font-mono text-xs font-bold text-zinc-500 dark:text-[#8b8b9e]">
                  &lt; 5 LPA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-zinc-900 dark:text-[#ebebef] font-mono">
                  {tierDistribution.mass.count}
                </div>
                <div className="text-xs text-zinc-500 dark:text-[#8b8b9e] font-mono">
                  drives ({tierDistribution.mass.pct}%)
                </div>
              </div>
              <div className="mt-3 w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-zinc-400 dark:bg-zinc-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tierDistribution.mass.pct}%` }}
                />
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
              <span className="font-mono">
                Avg: {tierDistribution.mass.avg !== "—" ? `₹${tierDistribution.mass.avg} LPA` : "—"}
              </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Filter <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 2-COLUMN INTELLIGENCE: PIPELINE PROTOCOL & VERIFIED ADVISORY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Standard Campus Selection Pipeline */}
        <section className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#1e1e2a] mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#5e6ad2]" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                  Campus Selection Evaluation Pipeline
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20">
                KLU Standard
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mb-4">
              Typical 4-stage recruitment pipeline observed across KLU Super Dream & Dream recruiters.
            </p>

            <div className="space-y-3">
              {[
                {
                  step: "01",
                  title: "Online Assessment (OA)",
                  desc: "2 DSA Coding Problems (Arrays/Graphs/DP) + 20 CS Fundamental MCQs (DBMS, OS, OOP, CN). Platforms: HackerRank, Superset, Mettl.",
                  tag: "Knockout Round",
                  tagColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                },
                {
                  step: "02",
                  title: "Technical Interview Round 1",
                  desc: "Live code walkthrough, time & space complexity analysis, and deep-dive into resume-featured projects & tech stack.",
                  tag: "Coding & DSA",
                  tagColor: "bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border-[#5e6ad2]/20",
                },
                {
                  step: "03",
                  title: "Technical Interview Round 2 / Architecture",
                  desc: "System design basics, SQL query optimization, concurrency, and scenario-based debugging problems.",
                  tag: "Design & SQL",
                  tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                },
                {
                  step: "04",
                  title: "Techno-Managerial & HR Round",
                  desc: "Behavioral assessment using STAR method, culture fit, communication evaluation, and offer package discussion.",
                  tag: "Final Stage",
                  tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                },
              ].map((round) => (
                <div
                  key={round.step}
                  className="p-3 rounded-lg border border-zinc-200/70 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/50 flex items-start gap-3"
                >
                  <span className="font-mono text-xs font-black text-zinc-400 dark:text-[#5a5a6e] pt-0.5">
                    {round.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">
                        {round.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${round.tagColor}`}
                      >
                        {round.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                      {round.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-[#1e1e2a]">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#5e6ad2] hover:bg-[#828df8] text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Practice These 4 Rounds on MockMate AI
            </Link>
          </div>
        </section>

        {/* Right: Verified Placement Advisory & Circulars */}
        <section className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#1e1e2a] mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                  Official Placement Advisory & Circulars
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20 flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" />
                Placement Circulars
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mb-4">
              Essential placement policies and circulars issued by KLU Career Services & Placements Directorate.
            </p>

            <div className="space-y-3">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-lg border border-zinc-200/70 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {ann.source?.toUpperCase() || "CIRCULAR"}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                        {new Date(ann.received_at || ann.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">
                      {ann.subject}
                    </h4>
                    {ann.raw_body && (
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed line-clamp-2">
                        {ann.raw_body}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                [
                  {
                    id: "c-1",
                    title: "Super Dream Tier Upgrade Policy",
                    source: "KLU Placement Directorate",
                    date: "Sep 2026",
                    summary:
                      "Candidates who secure an offer in Core (5–10 LPA) remain fully eligible to sit for Super Dream recruiters offering packages ≥ 20 LPA.",
                    tag: "Eligibility Rule",
                  },
                  {
                    id: "c-2",
                    title: "Mandatory Pre-Placement Training (PPT) Attendance",
                    source: "Career Services Cell",
                    date: "Sep 2026",
                    summary:
                      "Students must maintain ≥ 85% attendance in mock evaluations and technical workshops to receive Day-1 interview slot allocations.",
                    tag: "Attendance Policy",
                  },
                  {
                    id: "c-3",
                    title: "Resume & Portfolio Verification Protocol",
                    source: "Placement Audit Desk",
                    date: "Aug 2026",
                    summary:
                      "All projects, certifications, and CGPA metrics featured on student profiles must be verified by academic advisors prior to Superset uploads.",
                    tag: "Verification",
                  },
                ].map((circular) => (
                  <div
                    key={circular.id}
                    className="p-3.5 rounded-lg border border-zinc-200/70 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {circular.tag}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                        {circular.date} • {circular.source}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">
                      {circular.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                      {circular.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-[#1e1e2a] flex items-center justify-between text-xs text-zinc-500 dark:text-[#8b8b9e]">
            <span>Direct questions? Visit KLU Placement Cell Room 204.</span>
            <button
              onClick={onExploreDirectory}
              className="text-xs font-semibold text-[#5e6ad2] dark:text-[#828df8] hover:underline flex items-center gap-1"
            >
              Explore {drives.length} Recruiters <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>
      </div>

      {/* ── 5. MOCKMATE PREPARATION CALLOUT BRIDGE ── */}
      <section className="rounded-xl border border-[#5e6ad2]/20 dark:border-[#5e6ad2]/30 bg-gradient-to-r from-[#5e6ad2]/10 via-indigo-600/10 to-purple-600/10 p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            AI Interview Simulation Engine
          </div>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-[#ebebef]">
            Targeting a Super Dream Offer at KLU?
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            Practice realistic mock interviews tailored to question formats asked by Trilogy, ServiceNow, Adobe, Google, and Oracle. MockMate gives immediate scoring on coding efficiency, DSA reasoning, and STAR behavioral answers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/demo"
            className="px-5 py-2.5 rounded-lg bg-[#5e6ad2] hover:bg-[#828df8] text-white font-bold text-xs shadow-md shadow-[#5e6ad2]/20 transition-all flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            Launch AI Mock Interview
          </Link>
          <button
            onClick={onExploreDirectory}
            className="px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white font-semibold text-xs transition-colors"
          >
            Browse Recruiter Matrix
          </button>
        </div>
      </section>
    </div>
  );
}
