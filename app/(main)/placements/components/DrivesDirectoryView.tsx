"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PlacementDriveWithCompany, AcademicYear } from "@/types/placements";
import {
  Search,
  Filter,
  Building2,
  Calendar,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  List,
  PlayCircle,
  X,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";

interface DrivesDirectoryViewProps {
  drives: PlacementDriveWithCompany[];
  academicYears: AcademicYear[];
  initialTier?: string;
  onSelectDrive: (drive: PlacementDriveWithCompany) => void;
}

export function DrivesDirectoryView({
  drives,
  academicYears,
  initialTier = "all",
  onSelectDrive,
}: DrivesDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>(initialTier);
  const [sortBy, setSortBy] = useState<string>("package_desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Keep selectedTier synced if initialTier prop changes
  useEffect(() => {
    if (initialTier && initialTier !== "all") {
      setSelectedTier(initialTier);
    }
  }, [initialTier]);

  // Compute live tier counts for filter pills
  const tierCounts = useMemo(() => {
    let superDream = 0;
    let dream = 0;
    let core = 0;
    let mass = 0;
    drives.forEach((d) => {
      const p = d.package_max_lpa ?? d.package_min_lpa ?? 0;
      if (p >= 20) superDream++;
      else if (p >= 10) dream++;
      else if (p >= 5) core++;
      else mass++;
    });
    return { all: drives.length, superDream, dream, core, mass };
  }, [drives]);

  // Filtering and Sorting
  const filteredDrives = useMemo(() => {
    return drives
      .filter((d) => {
        const companyName = d.placement_companies?.name || d.drive_name;
        const role = d.role_title || "";
        const searchTarget = `${companyName} ${d.drive_name} ${role}`.toLowerCase();

        // Text search
        if (
          searchQuery &&
          !searchTarget.includes(searchQuery.toLowerCase().trim())
        ) {
          return false;
        }

        // Academic year filter
        if (selectedYear !== "all") {
          const yearLabel = d.placement_academic_years?.year_label;
          if (yearLabel !== selectedYear) return false;
        }

        // Package Tier filter
        const maxPkg = d.package_max_lpa ?? d.package_min_lpa ?? 0;
        if (selectedTier === "super_dream" && maxPkg < 20) return false;
        if (selectedTier === "dream" && (maxPkg < 10 || maxPkg >= 20))
          return false;
        if (selectedTier === "standard" && (maxPkg < 5 || maxPkg >= 10))
          return false;
        if (selectedTier === "mass" && (maxPkg <= 0 || maxPkg >= 5))
          return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "package_desc") {
          return (b.package_max_lpa ?? 0) - (a.package_max_lpa ?? 0);
        }
        if (sortBy === "package_asc") {
          return (a.package_min_lpa ?? 0) - (b.package_min_lpa ?? 0);
        }
        if (sortBy === "name_asc") {
          const nameA = a.placement_companies?.name || a.drive_name;
          const nameB = b.placement_companies?.name || b.drive_name;
          return nameA.localeCompare(nameB);
        }
        if (sortBy === "date_asc") {
          return (a.date_of_visit || "").localeCompare(b.date_of_visit || "");
        }
        // default: date_desc
        return (b.date_of_visit || "").localeCompare(a.date_of_visit || "");
      });
  }, [drives, searchQuery, selectedYear, selectedTier, sortBy]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-sm space-y-3.5 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-[#5a5a6e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies or roles (e.g. Trilogy, ServiceNow, Adobe, Google, Oracle)..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824] text-xs sm:text-sm text-zinc-900 dark:text-[#ebebef] placeholder-zinc-400 dark:placeholder-[#5a5a6e] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] focus:border-[#5e6ad2] transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-[#ebebef] p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824] text-xs font-mono font-medium text-zinc-700 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
              aria-label="Sort placement drives"
            >
              <option value="package_desc">Package: High to Low</option>
              <option value="package_asc">Package: Low to High</option>
              <option value="date_desc">Latest Visit First</option>
              <option value="date_asc">Earliest Visit First</option>
              <option value="name_asc">Company: A to Z</option>
            </select>

            {/* View Mode Toggle: Table vs Grid */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-[#1e1e2a]">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-sm border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-[#ebebef]"
                }`}
                title="Table View (High Density)"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-sm border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-[#ebebef]"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-zinc-400 dark:text-[#5a5a6e] uppercase tracking-wider mr-1">
            <Filter className="w-3 h-3" />
            <span>Tier:</span>
          </div>

          {[
            { id: "all", label: `All Drives (${tierCounts.all})` },
            {
              id: "super_dream",
              label: `⭐ Super Dream ≥20 LPA (${tierCounts.superDream})`,
              badgeColor: "text-amber-600 dark:text-amber-400",
            },
            {
              id: "dream",
              label: `🚀 Dream 10–20 LPA (${tierCounts.dream})`,
              badgeColor: "text-purple-600 dark:text-purple-400",
            },
            {
              id: "standard",
              label: `⚡ Core 5–10 LPA (${tierCounts.core})`,
              badgeColor: "text-[#5e6ad2] dark:text-[#828df8]",
            },
            {
              id: "mass",
              label: `🏢 Foundation <5 LPA (${tierCounts.mass})`,
              badgeColor: "text-zinc-600 dark:text-[#8b8b9e]",
            },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all ${
                selectedTier === tier.id
                  ? "bg-[#5e6ad2] text-white font-bold shadow-sm shadow-[#5e6ad2]/20"
                  : "bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-200 dark:hover:bg-white/10"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS HEADER & COUNT ── */}
      <div className="flex items-center justify-between px-1 text-xs">
        <p className="font-mono text-zinc-500 dark:text-[#8b8b9e]">
          Showing <span className="font-bold text-zinc-900 dark:text-[#ebebef]">{filteredDrives.length}</span> campus placement {filteredDrives.length === 1 ? "drive" : "drives"}
        </p>
        {selectedTier !== "all" && (
          <button
            onClick={() => setSelectedTier("all")}
            className="text-[#5e6ad2] dark:text-[#828df8] hover:underline font-mono text-[11px]"
          >
            Clear Tier Filter
          </button>
        )}
      </div>

      {/* ── DRIVES CONTENT ── */}
      {filteredDrives.length > 0 ? (
        viewMode === "table" ? (
          /* HIGH-DENSITY TABLE VIEW */
          <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/80 dark:bg-[#181824]/80 text-[11px] font-mono font-semibold uppercase text-zinc-500 dark:text-[#8b8b9e]">
                    <th className="py-3 px-4">Recruiter</th>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Compensation (CTC)</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Visit Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-[#1e1e2a]">
                  {filteredDrives.map((drive) => {
                    const companyName =
                      drive.placement_companies?.name || drive.drive_name;
                    const maxPkg =
                      drive.package_max_lpa ?? drive.package_min_lpa ?? 0;
                    const isSuperDream = maxPkg >= 20;
                    const isDream = maxPkg >= 10 && !isSuperDream;
                    const isCore = maxPkg >= 5 && maxPkg < 10;

                    return (
                      <tr
                        key={drive.id}
                        onClick={() => onSelectDrive(drive)}
                        className="hover:bg-zinc-50/70 dark:hover:bg-[#181824]/60 transition-colors cursor-pointer group"
                      >
                        {/* Company */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-gradient-to-br from-[#5e6ad2]/15 to-indigo-500/20 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/25 shrink-0">
                              {companyName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] dark:group-hover:text-[#828df8] transition-colors block truncate">
                                {companyName}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-[#5e6ad2]" />
                                Campus Partner
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4 text-zinc-600 dark:text-[#8b8b9e]">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {drive.role_title || "Software Development Engineer"}
                            </span>
                          </div>
                        </td>

                        {/* Package */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-black text-xs text-zinc-900 dark:text-[#ebebef]">
                            {drive.raw_package_text ||
                              (drive.package_min_lpa === drive.package_max_lpa
                                ? `₹${drive.package_min_lpa} LPA`
                                : `₹${drive.package_min_lpa} - ${drive.package_max_lpa} LPA`)}
                          </span>
                        </td>

                        {/* Classification */}
                        <td className="py-3 px-4">
                          {isSuperDream ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              <Award className="w-3 h-3 text-amber-500" />
                              Super Dream
                            </span>
                          ) : isDream ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30">
                              <Sparkles className="w-3 h-3 text-purple-500" />
                              Dream Tier
                            </span>
                          ) : isCore ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/30">
                              <Layers className="w-3 h-3 text-[#5e6ad2]" />
                              Core Product
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200/60 dark:border-white/10">
                              Foundation
                            </span>
                          )}
                        </td>

                        {/* Visit Date */}
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                          {drive.date_of_visit
                            ? new Date(drive.date_of_visit).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Scheduled"}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href="/demo"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#5e6ad2] hover:bg-[#828df8] text-white transition-colors"
                              title="Start Mock Interview tailored to this company"
                            >
                              <PlayCircle className="w-3 h-3" />
                              Practice Mock
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectDrive(drive);
                              }}
                              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                              title="Inspect Drive Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredDrives.map((drive) => {
              const companyName =
                drive.placement_companies?.name || drive.drive_name;
              const maxPkg = drive.package_max_lpa ?? drive.package_min_lpa ?? 0;
              const isSuperDream = maxPkg >= 20;
              const isDream = maxPkg >= 10 && !isSuperDream;

              return (
                <div
                  key={drive.id}
                  onClick={() => onSelectDrive(drive)}
                  className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isSuperDream
                      ? "border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] to-transparent hover:border-amber-500/60"
                      : isDream
                      ? "border-purple-500/30 dark:border-purple-500/20 bg-gradient-to-b from-purple-500/[0.03] to-transparent hover:border-purple-500/60"
                      : "border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:border-[#5e6ad2]/40"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br from-[#5e6ad2]/15 to-indigo-500/20 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/25 shrink-0">
                          {companyName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-zinc-900 dark:text-[#ebebef] text-sm group-hover:text-[#5e6ad2] dark:group-hover:text-[#828df8] transition-colors truncate">
                            {companyName}
                          </h3>
                          <div className="text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#5e6ad2]" />
                            Campus Partner
                          </div>
                        </div>
                      </div>

                      {/* Tier Badge */}
                      {isSuperDream && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                          ⭐ Super Dream
                        </span>
                      )}
                      {isDream && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 shrink-0">
                          🚀 Dream Tier
                        </span>
                      )}
                    </div>

                    {/* Role */}
                    <div className="text-xs text-zinc-600 dark:text-[#8b8b9e] flex items-center gap-1.5 my-2">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">
                        {drive.role_title || "Software Development Engineer"}
                      </span>
                    </div>

                    {/* Package */}
                    <div className="my-2.5">
                      <span className="inline-block px-2.5 py-1 rounded-md font-mono font-black text-sm bg-zinc-100 dark:bg-white/[0.04] text-zinc-900 dark:text-[#ebebef] border border-zinc-200/60 dark:border-white/10">
                        {drive.raw_package_text ||
                          (drive.package_min_lpa === drive.package_max_lpa
                            ? `₹${drive.package_min_lpa} LPA`
                            : `₹${drive.package_min_lpa} - ${drive.package_max_lpa} LPA`)}
                      </span>
                    </div>
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="pt-2.5 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 dark:text-[#8b8b9e]">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>
                        {drive.date_of_visit
                          ? new Date(drive.date_of_visit).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Scheduled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/demo"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-semibold text-[#5e6ad2] dark:text-[#828df8] hover:underline flex items-center gap-0.5"
                      >
                        <PlayCircle className="w-3 h-3" />
                        Practice
                      </Link>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-[#5e6ad2] dark:group-hover:text-[#828df8] inline-flex items-center text-[11px]">
                        Details
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="py-16 text-center rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e]">
          <Building2 className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No placement drives match this filter
          </h4>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset the package tier filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTier("all");
            }}
            className="mt-3 px-3 py-1.5 rounded-md bg-[#5e6ad2] text-white text-xs font-semibold hover:bg-[#828df8] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
