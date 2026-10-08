"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlacementHubData, getPlacementHubData } from "@/app/actions/placements";
import { PlacementDriveWithCompany } from "@/types/placements";
import { CommandCenterView } from "./CommandCenterView";
import { DrivesDirectoryView } from "./DrivesDirectoryView";
import { DriveDetailModal } from "./DriveDetailModal";
import { PlacementImportView } from "./PlacementImportView";
import { HomeBackground } from "@/components/home/HomeBackground";
import {
  Building2,
  Layers,
  Award,
  TrendingUp,
  LayoutDashboard,
  UploadCloud,
  ShieldCheck,
  ChevronRight,
  Database,
  Radio,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";

interface PlacementsClientProps {
  initialData: PlacementHubData;
  initialTab?: "command_center" | "directory" | "import";
}

export function PlacementsClient({
  initialData,
  initialTab = "command_center",
}: PlacementsClientProps) {
  const router = useRouter();
  const [hubData, setHubData] = useState<PlacementHubData>(initialData);
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "command_center" | "directory" | "import"
  >(initialTab);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDriveWithCompany | null>(null);
  const [directoryTierFilter, setDirectoryTierFilter] = useState<string>("all");

  useEffect(() => {
    setHubData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSwitch = (tab: "command_center" | "directory" | "import") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = tab === "command_center" ? "/placements" : `/placements?tab=${tab}`;
      window.history.replaceState(null, "", url);
    }
  };

  const refreshData = async () => {
    try {
      const fresh = await getPlacementHubData();
      if (fresh) {
        setHubData(fresh);
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Failed to refresh placement data:", err);
    }
  };

  const {
    todayEvents,
    todayGroupedDrives,
    upcomingEvents,
    deadlines,
    announcements,
    academicYears,
    drives,
    stats,
    todayDateIST,
  } = hubData;

  const activeYear = useMemo(() => {
    return (
      academicYears.find((y) => y.is_current) ||
      academicYears[0] ||
      null
    );
  }, [academicYears]);

  const topRecruiterDrive = useMemo(() => {
    if (!drives || drives.length === 0) return null;
    return [...drives].sort((a, b) => {
      const pkgA = a.package_max_lpa ?? a.package_min_lpa ?? 0;
      const pkgB = b.package_max_lpa ?? b.package_min_lpa ?? 0;
      return pkgB - pkgA;
    })[0];
  }, [drives]);

  const medianPackageLpa = useMemo(() => {
    if (!drives || drives.length === 0) return null;
    const pkgs = drives
      .map((d) => d.package_max_lpa ?? d.package_min_lpa)
      .filter((p): p is number => typeof p === "number" && p > 0)
      .sort((a, b) => a - b);
    if (pkgs.length === 0) return null;
    const mid = Math.floor(pkgs.length / 2);
    return pkgs.length % 2 !== 0 ? pkgs[mid] : (pkgs[mid - 1] + pkgs[mid]) / 2;
  }, [drives]);

  const handleSelectTierFromCommandCenter = (tier: string) => {
    setDirectoryTierFilter(tier);
    setActiveTab("directory");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 selection:bg-[#5e6ad2]/20 transition-colors">
      {/* ── 1. ASYMMETRIC HERO SECTION (Matching Homepage Aesthetic) ── */}
      <section className="relative border-b border-zinc-200 dark:border-[#1e1e2a] overflow-hidden">
        <HomeBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          {/* Precision Status Pill */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[11px] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">
              KLU Placement Radar
            </span>
            <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
            <span>{activeYear ? `Academic Year ${activeYear.year_label}` : "Academic Radar"}</span>
            <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
            <span className="text-[#5e6ad2] dark:text-[#828df8] font-mono font-bold">
              {stats.totalDrives} Campus Drives
            </span>
          </div>

          {/* Main Headline & Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-zinc-900 dark:text-[#ebebef] leading-[1.08] max-w-3xl">
              Placement Intelligence Hub
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed max-w-2xl font-normal">
              Real-time campus drive radar, compensation tier distributions, structured recruiter selection rounds, and historical hiring telemetry across {stats.totalCompanies} partner companies.
            </p>
          </div>

          {/* Telemetry Proof Strip */}
          <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500 dark:text-[#5a5a6e]">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span>KLU Campus Placement Directory</span>
            </div>
            <span>•</span>
            <span>Recruiter Hiring Benchmarks</span>
            <span>•</span>
            <span>Super Dream Tier Matrix</span>
          </div>

          {/* Segmented Engineering Control Tabs */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-[#1e1e2a] self-start shrink-0">
              <button
                onClick={() => handleTabSwitch("command_center")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  activeTab === "command_center"
                    ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-sm border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>Command Center</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </button>

              <button
                onClick={() => handleTabSwitch("directory")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  activeTab === "directory"
                    ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-sm border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Companies & Drives</span>
                <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {drives.length}
                </span>
              </button>

              <button
                onClick={() => handleTabSwitch("import")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  activeTab === "import"
                    ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-sm border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Placement / OA</span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Manual
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#5a5a6e]">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>IST Timezone: Asia/Kolkata</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN PLATFORM CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 4-KPI Candidate Telemetry Bento Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1: Hiring Partners */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-[#8b8b9e] mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Hiring Partners</span>
              <Building2 className="w-4 h-4 text-[#5e6ad2]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-[#ebebef] font-mono tracking-tight">
              {stats.totalCompanies}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
              <span>Campus recruitment partners</span>
            </div>
          </div>

          {/* KPI 2: Campus Drives */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-[#8b8b9e] mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Campus Drives</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-[#ebebef] font-mono tracking-tight">
              {stats.totalDrives}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>{activeYear ? `${activeYear.year_label} recruitment cycle` : "Active recruitment cycle"}</span>
            </div>
          </div>

          {/* KPI 3: Super Dream Top CTC */}
          <div className="p-4 sm:p-5 rounded-xl border border-amber-500/25 dark:border-amber-500/20 bg-amber-50/20 dark:bg-amber-500/[0.03] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Super Dream CTC</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {stats.highestPackageLpa > 0 ? (
                <>
                  ₹{stats.highestPackageLpa.toFixed(2)}{" "}
                  <span className="text-xs font-semibold">LPA</span>
                </>
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="mt-2 text-[11px] text-amber-700/80 dark:text-amber-400/80 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="truncate">
                {topRecruiterDrive
                  ? topRecruiterDrive.placement_companies?.name || topRecruiterDrive.drive_name
                  : "Super Dream category"}
              </span>
            </div>
          </div>

          {/* KPI 4: Cohort Average CTC */}
          <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/25 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/[0.03] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Cohort Avg CTC</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {stats.averagePackageLpa > 0 ? (
                <>
                  ₹{stats.averagePackageLpa.toFixed(2)}{" "}
                  <span className="text-xs font-semibold">LPA</span>
                </>
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="mt-2 text-[11px] text-emerald-700/80 dark:text-emerald-400/80 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">
                {medianPackageLpa
                  ? `Median package: ₹${medianPackageLpa.toFixed(2)} LPA`
                  : "Verified campus recruitment"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. ACTIVE TAB VIEW ── */}
        {activeTab === "command_center" ? (
          <CommandCenterView
            todayEvents={todayEvents}
            todayGroupedDrives={todayGroupedDrives}
            upcomingEvents={upcomingEvents}
            deadlines={deadlines}
            announcements={announcements}
            todayDateIST={todayDateIST}
            drives={drives}
            onExploreDirectory={() => handleTabSwitch("directory")}
            onSelectTier={handleSelectTierFromCommandCenter}
            onSelectDrive={(drive) => setSelectedDrive(drive)}
            onSwitchTab={handleTabSwitch}
          />
        ) : activeTab === "directory" ? (
          <DrivesDirectoryView
            drives={drives}
            academicYears={academicYears}
            initialTier={directoryTierFilter}
            onSelectDrive={(drive) => setSelectedDrive(drive)}
          />
        ) : (
          <PlacementImportView
            onSuccessNavigateToRadar={async () => {
              await refreshData();
              handleTabSwitch("command_center");
            }}
          />
        )}
      </main>

      {/* ── 4. DRIVE DETAIL MODAL ── */}
      <DriveDetailModal
        drive={selectedDrive}
        onClose={() => setSelectedDrive(null)}
      />
    </div>
  );
}
