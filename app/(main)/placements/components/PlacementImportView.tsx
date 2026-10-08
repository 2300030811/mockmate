"use client";

import { useState, useEffect } from "react";
import { ImportNoticeType, ConfirmedImportItem } from "@/types/placements";
import {
  publishManualPlacementAction,
  submitNoticeForAdminReviewAction,
  getPlacementAdminStatusAction,
} from "@/app/actions/placements-import";
import {
  Code2,
  Calendar,
  Briefcase,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Send,
  Layers,
  Sparkles,
  Award,
  Users,
  Megaphone,
  Globe,
  FileText,
  Lock,
} from "lucide-react";

interface PlacementImportViewProps {
  onSuccessNavigateToRadar?: () => void;
}

interface TemplateData {
  label: string;
  badgeLabel: string;
  colorClass: string;
  icon: typeof Code2;
  description: string;
  item: {
    noticeType: ImportNoticeType;
    companyName: string;
    roleTitle: string;
    packageText: string;
    minLpa: number | null;
    maxLpa: number | null;
    eventDateIso: string;
    deadlineIso: string;
    eventLocation: string;
    registrationUrl: string;
    eligibleBranches: string;
    minCgpa: number | null;
    sanitizedAnnouncementText: string;
  };
}

const TEMPLATES: Record<ImportNoticeType, TemplateData> = {
  ASSESSMENT: {
    label: "Online Assessment (OA)",
    badgeLabel: "Online Assessment (OA)",
    colorClass: "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#828df8] border-[#5e6ad2]/30",
    icon: Code2,
    description: "Scheduled online assessment, coding test, or SHL lockdown test",
    item: {
      noticeType: "ASSESSMENT",
      companyName: "LTIMindtree",
      roleTitle: "Software Development Engineer",
      packageText: "₹4.05 LPA",
      minLpa: 4.05,
      maxLpa: 4.05,
      eventDateIso: "2026-10-04",
      deadlineIso: "",
      eventLocation: "Online via SHL (Lockdown Browser required)",
      registrationUrl: "https://talentcentral.shl.com",
      eligibleBranches: "B.Tech (All Branches), MCA, M.Sc (CS/IT)",
      minCgpa: 6.5,
      sanitizedAnnouncementText:
        "The Online Assessment for LTIMindtree is scheduled on October 4, 2026 (Sunday), with the test link active for 24 hours from 00:01 Hours to 23:59 Hours.",
    },
  },
  NEW_DRIVE: {
    label: "Campus Placement Drive",
    badgeLabel: "Campus Drive Event",
    colorClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: Building2,
    description: "Full-time campus hiring drive announcement with CTC and eligibility",
    item: {
      noticeType: "NEW_DRIVE",
      companyName: "Cisco",
      roleTitle: "Technical Graduate Trainee",
      packageText: "₹17.5 LPA",
      minLpa: 17.5,
      maxLpa: 17.5,
      eventDateIso: "2026-10-15",
      deadlineIso: "2026-10-12",
      eventLocation: "Campus Placement Hall / Virtual",
      registrationUrl: "https://jobs.cisco.com",
      eligibleBranches: "CSE, IT, ECE",
      minCgpa: 7.0,
      sanitizedAnnouncementText:
        "Cisco campus recruitment drive for 2026/2027 batch. CTC ₹17.5 LPA across development and cloud networks.",
    },
  },
  INTERVIEW: {
    label: "Technical / HR Interview",
    badgeLabel: "Technical Interview",
    colorClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    icon: Briefcase,
    description: "Technical coding round, HR interview, or GD schedule",
    item: {
      noticeType: "INTERVIEW",
      companyName: "Google",
      roleTitle: "Application Engineering Intern",
      packageText: "₹1.14 Lakh/month",
      minLpa: 13.68,
      maxLpa: 13.68,
      eventDateIso: "2026-10-10",
      deadlineIso: "",
      eventLocation: "Virtual via Google Meet (Round 1 Technical)",
      registrationUrl: "https://meet.google.com",
      eligibleBranches: "CSE, IT, AI&DS",
      minCgpa: 7.5,
      sanitizedAnnouncementText:
        "Google Technical Coding & Data Structures interview round scheduled for shortlisted students.",
    },
  },
  REGISTRATION_DEADLINE: {
    label: "Registration Deadline",
    badgeLabel: "Registration Deadline",
    colorClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Clock,
    description: "Superset or external application cutoff deadline for registration",
    item: {
      noticeType: "REGISTRATION_DEADLINE",
      companyName: "Deloitte",
      roleTitle: "Analyst",
      packageText: "₹7.6 LPA",
      minLpa: 7.6,
      maxLpa: 7.6,
      eventDateIso: "",
      deadlineIso: "2026-10-12",
      eventLocation: "Online Portal",
      registrationUrl: "https://campus.deloitte.com/register",
      eligibleBranches: "All Engineering Branches & MCA",
      minCgpa: 6.0,
      sanitizedAnnouncementText:
        "Deloitte campus registration deadline closes on October 12, 2026. Submit form on Superset portal.",
    },
  },
  RESULT: {
    label: "Selection Results / Shortlist",
    badgeLabel: "Selection Shortlist",
    colorClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Award,
    description: "Official results announcement or round-wise candidate shortlist",
    item: {
      noticeType: "RESULT",
      companyName: "Infosys",
      roleTitle: "Specialist Programmer",
      packageText: "₹9.5 LPA",
      minLpa: 9.5,
      maxLpa: 9.5,
      eventDateIso: "",
      deadlineIso: "",
      eventLocation: "Campus Career Portal",
      registrationUrl: "",
      eligibleBranches: "CSE, IT",
      minCgpa: 7.0,
      sanitizedAnnouncementText:
        "Infosys has officially published the final selections for Specialist Programmer (₹9.5 LPA). Offer release letters will be distributed via career portal.",
    },
  },
  TRAINING: {
    label: "Pre-Placement Talk (PPT)",
    badgeLabel: "Pre-Placement Talk (PPT)",
    colorClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Megaphone,
    description: "Pre-placement talk, orientation, or technical preparation seminar",
    item: {
      noticeType: "TRAINING",
      companyName: "Amazon",
      roleTitle: "SDE Campus Hiring",
      packageText: "₹28.0 LPA",
      minLpa: 28.0,
      maxLpa: 28.0,
      eventDateIso: "2026-10-08",
      deadlineIso: "",
      eventLocation: "Campus Auditorium 1 & Zoom Stream",
      registrationUrl: "https://zoom.us",
      eligibleBranches: "All Branches",
      minCgpa: null,
      sanitizedAnnouncementText:
        "Amazon Pre-Placement Talk (PPT) & Leadership Q&A session with senior engineering leads.",
    },
  },
  GENERAL_ANNOUNCEMENT: {
    label: "General Notice",
    badgeLabel: "General Notice",
    colorClass: "bg-zinc-500/15 text-zinc-600 dark:text-[#8b8b9e] border-zinc-500/30",
    icon: Megaphone,
    description: "General placement cell policy update or student circular",
    item: {
      noticeType: "GENERAL_ANNOUNCEMENT",
      companyName: "KLU Placement Cell",
      roleTitle: "Notice Desk",
      packageText: "",
      minLpa: null,
      maxLpa: null,
      eventDateIso: "",
      deadlineIso: "",
      eventLocation: "Campus Notice Board",
      registrationUrl: "",
      eligibleBranches: "All Branches",
      minCgpa: null,
      sanitizedAnnouncementText:
        "Mandatory guidelines regarding SHL and HackerRank lockdown browser installation.",
    },
  },
};

export function PlacementImportView({
  onSuccessNavigateToRadar,
}: PlacementImportViewProps) {
  // Admin permission state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Active Type Selection
  const [activeType, setActiveType] = useState<ImportNoticeType>("ASSESSMENT");

  // Form Fields State (initialized to ASSESSMENT template)
  const [companyName, setCompanyName] = useState(TEMPLATES.ASSESSMENT.item.companyName);
  const [roleTitle, setRoleTitle] = useState(TEMPLATES.ASSESSMENT.item.roleTitle);
  const [packageText, setPackageText] = useState(TEMPLATES.ASSESSMENT.item.packageText);
  const [minLpa, setMinLpa] = useState<number | null>(TEMPLATES.ASSESSMENT.item.minLpa);
  const [maxLpa, setMaxLpa] = useState<number | null>(TEMPLATES.ASSESSMENT.item.maxLpa);
  const [eventDateIso, setEventDateIso] = useState(TEMPLATES.ASSESSMENT.item.eventDateIso);
  const [deadlineIso, setDeadlineIso] = useState(TEMPLATES.ASSESSMENT.item.deadlineIso);
  const [eventLocation, setEventLocation] = useState(TEMPLATES.ASSESSMENT.item.eventLocation);
  const [registrationUrl, setRegistrationUrl] = useState(TEMPLATES.ASSESSMENT.item.registrationUrl);
  const [eligibleBranches, setEligibleBranches] = useState(TEMPLATES.ASSESSMENT.item.eligibleBranches);
  const [minCgpa, setMinCgpa] = useState<number | null>(TEMPLATES.ASSESSMENT.item.minCgpa);
  const [sanitizedAnnouncementText, setSanitizedAnnouncementText] = useState(
    TEMPLATES.ASSESSMENT.item.sanitizedAnnouncementText
  );
  const [rawCircularReference, setRawCircularReference] = useState("");

  // Submitting & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success States
  const [confirmedSummary, setConfirmedSummary] = useState<{
    createdDrives: number;
    updatedDrives: number;
    createdEvents: number;
    publishedAnnouncements: number;
  } | null>(null);

  const [studentSubmittedSuccess, setStudentSubmittedSuccess] = useState<string | null>(null);

  // Check admin status on load
  useEffect(() => {
    let isMounted = true;
    async function checkAdmin() {
      try {
        const res = await getPlacementAdminStatusAction();
        if (isMounted) {
          setIsAdmin(res.isAdmin);
        }
      } catch (err) {
        console.error("Failed to check admin status:", err);
      } finally {
        if (isMounted) setIsCheckingAdmin(false);
      }
    }
    checkAdmin();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load a template into the form fields
  const handleApplyTemplate = (type: ImportNoticeType) => {
    setActiveType(type);
    const tmpl = TEMPLATES[type].item;
    setCompanyName(tmpl.companyName);
    setRoleTitle(tmpl.roleTitle);
    setPackageText(tmpl.packageText);
    setMinLpa(tmpl.minLpa);
    setMaxLpa(tmpl.maxLpa);
    setEventDateIso(tmpl.eventDateIso);
    setDeadlineIso(tmpl.deadlineIso);
    setEventLocation(tmpl.eventLocation);
    setRegistrationUrl(tmpl.registrationUrl);
    setEligibleBranches(tmpl.eligibleBranches);
    setMinCgpa(tmpl.minCgpa);
    setSanitizedAnnouncementText(tmpl.sanitizedAnnouncementText);
    setErrorMsg(null);
  };

  // Clear form fields for custom entry
  const handleClearForm = () => {
    setCompanyName("");
    setRoleTitle("");
    setPackageText("");
    setMinLpa(null);
    setMaxLpa(null);
    setEventDateIso("");
    setDeadlineIso("");
    setEventLocation("");
    setRegistrationUrl("");
    setEligibleBranches("");
    setMinCgpa(null);
    setSanitizedAnnouncementText("");
    setRawCircularReference("");
    setErrorMsg(null);
  };

  // Auto-parse numeric packages if user enters e.g. "17.5 LPA"
  const handlePackageTextChange = (val: string) => {
    setPackageText(val);
    const match = val.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0) {
        setMinLpa(num);
        setMaxLpa(num);
      }
    }
  };

  // Build the ConfirmedImportItem payload
  const buildPayloadItem = (): ConfirmedImportItem => {
    const branchesArray = eligibleBranches
      ? eligibleBranches
          .split(/[,/]+/)
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    return {
      tempId: `manual_${Date.now()}`,
      noticeType: activeType,
      companyName: companyName.trim(),
      roleTitle: roleTitle.trim() || null,
      packageText: packageText.trim() || null,
      minLpa: minLpa,
      maxLpa: maxLpa,
      eventDateIso: eventDateIso || null,
      deadlineIso: deadlineIso || null,
      eventLocation: eventLocation.trim() || null,
      registrationUrl: registrationUrl.trim() || null,
      eligibleBranches: branchesArray,
      minCgpa: minCgpa,
      sanitizedAnnouncementText: sanitizedAnnouncementText.trim() || null,
    };
  };

  // Submit Handler for Administrator (Direct Write to Live Radar)
  const handleAdminDirectPublish = async () => {
    if (!companyName.trim()) {
      setErrorMsg("Please enter a company or organization name.");
      return;
    }

    if (activeType === "ASSESSMENT" && !eventDateIso) {
      setErrorMsg("Please select an Assessment Date.");
      return;
    }

    if (activeType === "REGISTRATION_DEADLINE" && !deadlineIso) {
      setErrorMsg("Please select a Registration Deadline date.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payloadItem = buildPayloadItem();
    const res = await publishManualPlacementAction(payloadItem);
    setIsSubmitting(false);

    if (!res.success || !res.summary) {
      setErrorMsg(res.error || "Failed to publish placement record.");
      return;
    }

    setConfirmedSummary({
      createdDrives: res.summary.createdDrivesCount,
      updatedDrives: res.summary.updatedDrivesCount,
      createdEvents: res.summary.createdEventsCount,
      publishedAnnouncements: res.summary.publishedAnnouncementsCount,
    });
  };

  // Submit Handler for Student (Submit for Review)
  const handleStudentSubmitForReview = async () => {
    if (!companyName.trim()) {
      setErrorMsg("Please enter a company name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const summary = `Manual Entry: ${companyName} (${roleTitle || "General Role"}) - ${activeType} [${packageText || "CTC TBD"}] Date: ${eventDateIso || deadlineIso || "TBD"}`;
    const rawNote = rawCircularReference || sanitizedAnnouncementText || summary;

    const res = await submitNoticeForAdminReviewAction(rawNote, summary);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to submit notice for review.");
      return;
    }

    setStudentSubmittedSuccess(
      res.message || "Notice submitted for placement desk verification."
    );
  };

  // Reset after confirmation
  const handleReset = () => {
    setConfirmedSummary(null);
    setStudentSubmittedSuccess(null);
    handleApplyTemplate(activeType);
  };

  // Active template metadata
  const currentTemplate = TEMPLATES[activeType];
  const CurrentIcon = currentTemplate.icon;

  // ────────────────────────────────────────────────────────────────
  // Render: Admin Success Confirmation Screen
  // ────────────────────────────────────────────────────────────────
  if (confirmedSummary) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] p-6 sm:p-10 text-center max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Admin Write Permission Confirmed
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-[#ebebef] mt-2">
            Placement Record Published to Live Radar
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 max-w-md mx-auto">
            Your manual placement entry is now live in the active academic cycle.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 border-y border-emerald-500/20 font-mono">
          <div className="p-3 rounded-lg bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
            <div className="text-xl font-black text-zinc-900 dark:text-[#ebebef]">
              {confirmedSummary.createdDrives}
            </div>
            <div className="text-[10px] uppercase text-zinc-400">New Drives</div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
            <div className="text-xl font-black text-zinc-900 dark:text-[#ebebef]">
              {confirmedSummary.updatedDrives}
            </div>
            <div className="text-[10px] uppercase text-zinc-400">Drives Linked</div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
            <div className="text-xl font-black text-[#5e6ad2] dark:text-[#828df8]">
              {confirmedSummary.createdEvents}
            </div>
            <div className="text-[10px] uppercase text-zinc-400">Events Added</div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">
              {confirmedSummary.publishedAnnouncements}
            </div>
            <div className="text-[10px] uppercase text-zinc-400">Broadcasts</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onSuccessNavigateToRadar && (
            <button
              onClick={onSuccessNavigateToRadar}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-xs bg-[#5e6ad2] hover:bg-[#828df8] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              View Live Command Center
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Add Another Record
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Render: Student Success Screen
  // ────────────────────────────────────────────────────────────────
  if (studentSubmittedSuccess) {
    return (
      <div className="rounded-xl border border-[#5e6ad2]/30 bg-[#5e6ad2]/[0.02] dark:bg-[#5e6ad2]/[0.04] p-6 sm:p-10 text-center max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] mx-auto flex items-center justify-center border border-[#5e6ad2]/20">
          <Send className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5e6ad2] dark:text-[#828df8] px-2.5 py-0.5 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20">
            Forwarded for Administrative Verification
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-[#ebebef] mt-2">
            Notice Submitted for Review
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 max-w-md mx-auto">
            {studentSubmittedSuccess}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onSuccessNavigateToRadar && (
            <button
              onClick={onSuccessNavigateToRadar}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-xs bg-[#5e6ad2] hover:bg-[#828df8] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Back to Command Center
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Submit Another Notice
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Render: Main Manual Placement Studio Interface
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ── 1. DESK STATUS BANNER ── */}
      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] flex items-center justify-center shrink-0 border border-[#5e6ad2]/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
              Manual Placement Entry Studio
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Directly enter and publish verified assessments, drives, and interview rounds. Select a preset template below or customize fields manually.
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          {isCheckingAdmin ? (
            <span className="text-[10px] font-mono text-zinc-400">Verifying access...</span>
          ) : isAdmin ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Direct Write Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-3 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              Student Review Queue
            </span>
          )}
        </div>
      </div>

      {/* ── 2. TEMPLATE SELECTOR BUTTONS STRIP ── */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-500 dark:text-[#8b8b9e]">
            <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Select Entry Template Preset:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate(activeType)}
              className="text-[11px] font-mono text-[#5e6ad2] dark:text-[#828df8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset {currentTemplate.label}
            </button>
            <span className="text-zinc-300 dark:text-[#2a2a3c]">|</span>
            <button
              type="button"
              onClick={handleClearForm}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-[#ebebef] cursor-pointer"
            >
              Clear to Blank
            </button>
          </div>
        </div>

        {/* Segmented Preset Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.keys(TEMPLATES) as ImportNoticeType[]).map((typeKey) => {
            const tmpl = TEMPLATES[typeKey];
            const Icon = tmpl.icon;
            const isCurrent = activeType === typeKey;

            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => handleApplyTemplate(typeKey)}
                className={`text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? "bg-[#5e6ad2] text-white shadow-sm font-bold shadow-[#5e6ad2]/20"
                    : "bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-[#8b8b9e] hover:bg-zinc-200 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tmpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. TWO-COLUMN WORK AREA: FORM + LIVE RADAR PREVIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#1e1e2a]">
            <div className="flex items-center gap-2">
              <CurrentIcon className="w-4 h-4 text-[#5e6ad2]" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
                {currentTemplate.label} Parameters
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
              100% Deterministic • Zero AI Hallucination
            </span>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-3.5 text-xs font-mono">
            {/* Row 1: Company & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                  Company / Organization <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. LTIMindtree, Google, Cisco"
                  className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] font-semibold focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                  Role Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Development Engineer"
                  className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                />
              </div>
            </div>

            {/* Row 2: Compensation CTC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                  Package CTC Text
                </label>
                <input
                  type="text"
                  value={packageText}
                  onChange={(e) => handlePackageTextChange(e.target.value)}
                  placeholder="e.g. ₹4.05 LPA or ₹17.5 LPA"
                  className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] font-semibold focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                  Min LPA (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minLpa ?? ""}
                  onChange={(e) => setMinLpa(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 4.05"
                  className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                  Max LPA (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={maxLpa ?? ""}
                  onChange={(e) => setMaxLpa(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 4.05"
                  className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                />
              </div>
            </div>

            {/* Row 3: Dates & Scheduling based on Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeType !== "REGISTRATION_DEADLINE" ? (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                    {activeType === "ASSESSMENT"
                      ? "Assessment Date (OA)"
                      : activeType === "INTERVIEW"
                      ? "Interview Date"
                      : "Campus Visit / Event Date"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventDateIso}
                    onChange={(e) => setEventDateIso(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                    Registration Deadline Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={deadlineIso}
                    onChange={(e) => setDeadlineIso(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                  />
                </div>
              )}

              {activeType === "NEW_DRIVE" && (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                    Application Cutoff (Optional)
                  </label>
                  <input
                    type="date"
                    value={deadlineIso}
                    onChange={(e) => setDeadlineIso(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                  />
                </div>
              )}

              {activeType !== "NEW_DRIVE" && (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                    Venue / Testing Platform
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Online via SHL (Lockdown Browser) or CSE Lab 3"
                    className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                  />
                </div>
              )}
            </div>

            {/* Row 4: Portal Link */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                Portal URL / Test Link
              </label>
              <input
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://talentcentral.shl.com or https://jobs.cisco.com"
                className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
              />
            </div>

            {/* Row 5: Eligibility & CGPA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                  Eligible Branches (Comma Separated)
                </label>
                <input
                  type="text"
                  value={eligibleBranches}
                  onChange={(e) => setEligibleBranches(e.target.value)}
                  placeholder="e.g. CSE, IT, ECE, MCA"
                  className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                  Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={minCgpa ?? ""}
                  onChange={(e) => setMinCgpa(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 6.5"
                  className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-3 py-2 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                />
              </div>
            </div>

            {/* Row 6: Description / Circular Text */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                Circular Summary / Notification Description
              </label>
              <textarea
                rows={3}
                value={sanitizedAnnouncementText}
                onChange={(e) => setSanitizedAnnouncementText(e.target.value)}
                placeholder="Detailed guidelines, test link timings, or shortlisted instructions..."
                className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] p-3 text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] resize-y"
              />
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="pt-3 border-t border-zinc-100 dark:border-[#1e1e2a] flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearForm}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              Reset Inputs
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={handleAdminDirectPublish}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    Publishing to Live Radar...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Publish to Radar
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStudentSubmitForReview}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-bold text-xs bg-[#5e6ad2] hover:bg-[#828df8] disabled:opacity-50 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit for Placement Review
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Radar Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#1e1e2a]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5e6ad2]" />
                <h3 className="text-xs font-mono font-bold uppercase text-zinc-700 dark:text-[#ebebef]">
                  Live Radar Card Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                WYSIWYG Target Render
              </span>
            </div>

            {/* Visual Mirror of Radar Card */}
            <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824]/60 space-y-3">
              {/* Card Header: Company, Classification Badge, Package */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200/50 dark:border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br from-[#5e6ad2]/15 to-indigo-500/25 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/30 shrink-0">
                    {companyName.trim().charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] truncate">
                      {companyName.trim() || "Recruiter Name"}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#5e6ad2]" />
                      Campus Partner
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${currentTemplate.colorClass} border`}
                  >
                    <CurrentIcon className="w-3 h-3" />
                    {currentTemplate.badgeLabel}
                  </span>
                  {packageText && (
                    <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-[#ebebef] border border-zinc-200 dark:border-white/10">
                      {packageText}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body: Role, Date, Venue */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-[#8b8b9e]">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">
                    {roleTitle.trim() || "Role to be announced"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {eventDateIso || deadlineIso
                        ? new Date(eventDateIso || deadlineIso).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Date Scheduled"}
                    </span>
                  </div>
                </div>

                {eventLocation && (
                  <div className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] truncate flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{eventLocation}</span>
                  </div>
                )}

                {eligibleBranches && (
                  <div className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] pt-1 border-t border-zinc-100 dark:border-white/5 truncate">
                    Eligibility: {eligibleBranches} {minCgpa ? `• CGPA ≥ ${minCgpa}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Template Tips */}
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/80 dark:border-[#2a2a3c] text-xs text-zinc-600 dark:text-[#8b8b9e] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-[#5a5a6e] block">
                Standard Template Guidelines
              </span>
              <ul className="text-[11px] space-y-1 list-disc list-inside">
                <li>
                  <strong>Assessment (OA):</strong> Creates a test card on the Radar and increments OA counters.
                </li>
                <li>
                  <strong>Campus Drive:</strong> Adds or updates the company profile and compensation tier in the directory.
                </li>
                <li>
                  <strong>Deadline:</strong> Appears in the upcoming registration deadlines drawer.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
