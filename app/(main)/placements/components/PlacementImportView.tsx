"use client";

import { useState, useEffect } from "react";
import {
  AnalyzedImportDraft,
  AnalyzedImportItem,
  ConfirmedImportItem,
} from "@/types/placements";
import {
  analyzePlacementTextAction,
  confirmPlacementImportAction,
  submitNoticeForAdminReviewAction,
  getPlacementAdminStatusAction,
} from "@/app/actions/placements-import";
import {
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase,
  Layers,
  ArrowRight,
  RotateCcw,
  Check,
  ShieldAlert,
  Info,
  Send,
  Mail,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface PlacementImportViewProps {
  onSuccessNavigateToRadar?: () => void;
}

const SAMPLE_COPILOT_TABLE = `### Active Placement Opportunities for 2026 Batch

| Company | Role | Package | Eligibility | Status |
|---|---|---|---|---|
| Google | Application Engineering Intern | ₹1.14 Lakh/month | 2027 batch, CGPA ≥ 7.0 | Apply by 24 Sep 2026 |
| Cisco | Technical Graduate Trainee | ₹17.5 LPA | 2026 batch, CSE/ECE | Test on 28 Sep 2026 |
| Deloitte | Analyst | ₹7.6 LPA | 2026 batch, All Branches | Apply by 20 Sep 2026 |`;

const SAMPLE_ASSESSMENT_NOTICE = `Subject: Amazon WOW Assessment Schedule
Dear Students,
The Online Coding Assessment for Amazon is scheduled on 30 Sep 2026 at 10:00 AM IST.
Eligible branches: CSE, IT, AIDS, ECE with CGPA 7.5 and above.
Venue: Online Portal. Check your emails for test links.`;

const SAMPLE_RESULT_NOTICE = `Placement Notification: Infosys Final Results
Congratulations to all shortlisted candidates!
Infosys has officially published the final selections for the Specialist Programmer role (₹9.5 LPA).
Offer release letters will be distributed through the campus career portal.`;

export function PlacementImportView({
  onSuccessNavigateToRadar,
}: PlacementImportViewProps) {
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin permission & notification state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("2300030811cser@gmail.com");
  const [notificationEmail, setNotificationEmail] = useState("2300030811@kluniversity.in");
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Analysis Draft State
  const [draft, setDraft] = useState<AnalyzedImportDraft | null>(null);
  const [editableItems, setEditableItems] = useState<AnalyzedImportItem[]>([]);
  const [selectedTempIds, setSelectedTempIds] = useState<Set<string>>(new Set());

  // Non-Admin Review Submission Success State
  const [reviewSubmissionSuccess, setReviewSubmissionSuccess] = useState<{
    submissionId: string;
    adminEmail: string;
    recipientEmail: string;
    emailDispatched?: boolean;
    message: string;
    mailtoUrl?: string;
  } | null>(null);

  // Admin Direct Confirm Success State
  const [confirmedSummary, setConfirmedSummary] = useState<{
    createdDrives: number;
    updatedDrives: number;
    createdEvents: number;
    publishedAnnouncements: number;
  } | null>(null);

  // Check admin status on load
  useEffect(() => {
    let isMounted = true;
    async function checkAdmin() {
      try {
        const res = await getPlacementAdminStatusAction();
        if (isMounted) {
          setIsAdmin(res.isAdmin);
          if (res.adminEmail) setAdminEmail(res.adminEmail);
          if (res.notificationEmail) setNotificationEmail(res.notificationEmail);
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

  // ────────────────────────────────────────────────────────────────
  // Step 1: Analyze Action (Available to all users)
  // ────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!rawText || rawText.trim().length < 10) {
      setErrorMsg("Please paste placement text with at least 10 characters.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    const res = await analyzePlacementTextAction(rawText);
    setIsAnalyzing(false);

    if (!res.success || !res.draft) {
      setErrorMsg(res.error || "Could not analyze the placement notice.");
      return;
    }

    setDraft(res.draft);
    setEditableItems(res.draft.items);
    setSelectedTempIds(new Set(res.draft.items.map((it) => it.tempId)));
  };

  // ────────────────────────────────────────────────────────────────
  // Step 2A: Non-Admin Action: Submit Notice for Admin Verification
  // ────────────────────────────────────────────────────────────────
  const handleSubmitForReview = async () => {
    if (!rawText) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const summary = editableItems
      .map(
        (it) =>
          `• ${it.companyName} (${it.roleTitle || "General"}): ${it.packageText || "CTC TBD"}`
      )
      .join("\n");

    const res = await submitNoticeForAdminReviewAction(rawText, summary);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to submit notice for review.");
      return;
    }

    setReviewSubmissionSuccess({
      submissionId: res.submissionId || "SUB-RECORDED",
      adminEmail: res.adminEmail || adminEmail,
      recipientEmail: res.recipientEmail || notificationEmail,
      emailDispatched: res.emailDispatched,
      message: res.message || `Notice forwarded to ${notificationEmail}`,
      mailtoUrl: res.mailtoUrl,
    });
  };

  // ────────────────────────────────────────────────────────────────
  // Step 2B: Admin Action: Direct Publish to Live Radar
  // ────────────────────────────────────────────────────────────────
  const handleAdminConfirm = async () => {
    if (!draft || selectedTempIds.size === 0) return;

    const itemsToConfirm: ConfirmedImportItem[] = editableItems
      .filter((it) => selectedTempIds.has(it.tempId))
      .map((it) => ({
        tempId: it.tempId,
        noticeType: it.noticeType,
        companyName: it.companyName,
        roleTitle: it.roleTitle,
        packageText: it.packageText,
        minLpa: it.minLpa,
        maxLpa: it.maxLpa,
        eligibleBranches: it.eligibleBranches,
        minCgpa: it.minCgpa,
        deadlineIso: it.deadlineIso,
        deadlinePrecision: it.deadlinePrecision,
        deadlineInferred: it.deadlineInferred,
        eventDateIso: it.eventDateIso,
        eventLocation: it.eventLocation,
        registrationUrl: it.registrationUrl,
        selectedDriveId: it.matchedDriveId,
      }));

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await confirmPlacementImportAction(draft.submissionId, itemsToConfirm);
    setIsSubmitting(false);

    if (!res.success || !res.summary) {
      setErrorMsg(res.error || "Failed to publish placement import.");
      return;
    }

    setConfirmedSummary({
      createdDrives: res.summary.createdDrivesCount,
      updatedDrives: res.summary.updatedDrivesCount,
      createdEvents: res.summary.createdEventsCount,
      publishedAnnouncements: res.summary.publishedAnnouncementsCount,
    });
  };

  const handleReset = () => {
    setRawText("");
    setDraft(null);
    setEditableItems([]);
    setSelectedTempIds(new Set());
    setConfirmedSummary(null);
    setReviewSubmissionSuccess(null);
    setErrorMsg(null);
  };

  const toggleItemSelection = (tempId: string) => {
    const next = new Set(selectedTempIds);
    if (next.has(tempId)) {
      next.delete(tempId);
    } else {
      next.add(tempId);
    }
    setSelectedTempIds(next);
  };

  const updateItemField = (tempId: string, field: keyof AnalyzedImportItem, value: any) => {
    setEditableItems((prev) =>
      prev.map((it) => (it.tempId === tempId ? { ...it, [field]: value } : it))
    );
  };

  // ────────────────────────────────────────────────────────────────
  // Render State 1: Non-Admin Review Submission Success
  // ────────────────────────────────────────────────────────────────
  if (reviewSubmissionSuccess) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-6 sm:p-10 text-center max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] mx-auto flex items-center justify-center border border-[#5e6ad2]/20">
          {reviewSubmissionSuccess.emailDispatched ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          ) : (
            <Mail className="w-7 h-7" />
          )}
        </div>

        <div>
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            reviewSubmissionSuccess.emailDispatched
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20"
          }`}>
            {reviewSubmissionSuccess.emailDispatched
              ? "Dispatched via Email Gateway"
              : "Queued for Admin Review"}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-[#ebebef] mt-2">
            Notice Submitted for Verification
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] mt-1.5 max-w-md mx-auto leading-relaxed">
            Your placement notice submission has been recorded and dispatched to the campus placement desk for administrative review.
          </p>
        </div>

        {/* Security & Access Notice */}
        <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/80 dark:border-[#2a2a3c] text-xs text-left space-y-1.5 font-mono text-zinc-600 dark:text-[#8b8b9e]">
          <div className="flex items-center gap-1.5 text-zinc-900 dark:text-[#ebebef] font-semibold text-[11px]">
            <Lock className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Administrator Access Control Protocol</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Direct write permissions are restricted to authorized administrators. Once verified and audited against official records, the drive will be published to the live campus radar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {reviewSubmissionSuccess.mailtoUrl && (
            <a
              href={reviewSubmissionSuccess.mailtoUrl}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs bg-[#5e6ad2] hover:bg-[#828df8] text-white shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Open in Mail Client
            </a>
          )}
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Submit Another Notice
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Render State 2: Admin Direct Confirmation Success
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
            Placement Records Published to Live Radar
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 max-w-md mx-auto">
            Your reviewed placement records are now live on the MockMate Placement Hub.
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-xs bg-[#5e6ad2] hover:bg-[#828df8] text-white shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              View Live Command Center
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Import Another Notice
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Render State 3: Review Extracted Draft (Admin or Student)
  // ────────────────────────────────────────────────────────────────
  if (draft) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e]">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap text-xs font-mono">
              {isAdmin ? (
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Mode: Direct Write Permission Active
                </span>
              ) : (
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Verification Desk • Placement Review Queue
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-[#ebebef]">
              Extracted Placement Notice Review
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              {isAdmin
                ? "Verify and edit extracted values before directly publishing to the live campus radar."
                : "Inspect the extracted details before submitting to the campus placement desk for administrative review."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200 dark:border-[#1e1e2a] transition-colors"
            >
              Cancel / Start Over
            </button>

            {isAdmin ? (
              <button
                onClick={handleAdminConfirm}
                disabled={isSubmitting || selectedTempIds.size === 0}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-sm flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <span>Publishing to Radar...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm & Publish to Radar ({selectedTempIds.size})
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#5e6ad2] hover:bg-[#828df8] disabled:opacity-50 shadow-sm flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <span>Forwarding Notice...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Forward Notice for Review
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Non-Admin Notice Banner */}
        {!isAdmin && (
          <div className="p-3.5 rounded-lg border border-[#5e6ad2]/20 bg-[#5e6ad2]/[0.04] text-xs text-zinc-600 dark:text-[#8b8b9e] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#5e6ad2] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-900 dark:text-[#ebebef]">Administrator Verification Guard:</span>{" "}
              Submitting will automatically forward your circular to the campus placement administration desk for official review. Direct additions to the live radar are restricted to authorized administrators to maintain campus data integrity.
            </div>
          </div>
        )}

        {/* Extracted Items Grid */}
        <div className="space-y-4">
          {editableItems.map((item) => {
            const isSelected = selectedTempIds.has(item.tempId);
            const isConflict = item.matchOutcome === "conflict_with_official";
            const isAmbiguous = item.matchOutcome === "ambiguous_match";

            return (
              <div
                key={item.tempId}
                className={`rounded-xl border p-5 transition-all ${
                  !isSelected
                    ? "opacity-50 bg-zinc-50 dark:bg-white/[0.01] border-zinc-200/40 dark:border-white/5"
                    : isConflict
                    ? "border-amber-500/40 bg-amber-500/[0.02]"
                    : "border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-sm"
                }`}
              >
                {/* Item Top Bar */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-200/50 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.tempId)}
                        className="w-4 h-4 rounded text-[#5e6ad2] focus:ring-[#5e6ad2] border-zinc-300 dark:border-zinc-600"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                          {item.companyName}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20">
                          {item.noticeType.replace(/_/g, " ")}
                        </span>
                        {item.matchOutcome === "matched_official_drive" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            Campus Partner Matched
                          </span>
                        )}
                        {isConflict && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3" />
                            Review Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.deadlineInferred && item.deadlineIso && (
                    <span className="text-[11px] font-mono font-medium px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      Deadline: {item.deadlineIso}
                    </span>
                  )}
                </div>

                {/* Conflict Notice Banner */}
                {isConflict && item.conflictDescription && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Record Telemetry: </span>
                      {item.conflictDescription}
                    </div>
                  </div>
                )}

                {/* Ambiguous Match Disambiguation (Admin mode only) */}
                {isAdmin && isAmbiguous && item.ambiguousCandidates && item.ambiguousCandidates.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-center gap-1.5 font-bold mb-2">
                      <Info className="w-4 h-4 text-[#5e6ad2]" />
                      Existing partner drives found for {item.companyName}:
                    </div>
                    <select
                      value={item.matchedDriveId || ""}
                      onChange={(e) =>
                        updateItemField(item.tempId, "matchedDriveId", e.target.value || null)
                      }
                      className="text-xs rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-white dark:bg-[#181824] px-2.5 py-1.5 text-zinc-900 dark:text-[#ebebef] font-mono"
                    >
                      <option value="">Create as separate drive</option>
                      {item.ambiguousCandidates.map((cand) => (
                        <option key={cand.id} value={cand.id}>
                          Link to: {cand.driveName} ({cand.roleTitle || "General"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Form Fields (Editable for Admin, Readonly overview for Student) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                      Company Name
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={item.companyName}
                      onChange={(e) => updateItemField(item.tempId, "companyName", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-2.5 py-1.5 text-zinc-900 dark:text-[#ebebef] font-semibold disabled:opacity-80"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                      Role Title
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={item.roleTitle || ""}
                      onChange={(e) => updateItemField(item.tempId, "roleTitle", e.target.value || null)}
                      placeholder="e.g. SDE Intern"
                      className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-2.5 py-1.5 text-zinc-900 dark:text-[#ebebef] disabled:opacity-80"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                      Package / CTC Text
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={item.packageText || ""}
                      onChange={(e) => updateItemField(item.tempId, "packageText", e.target.value || null)}
                      placeholder="e.g. 17.5 LPA"
                      className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-2.5 py-1.5 text-zinc-900 dark:text-[#ebebef] font-semibold disabled:opacity-80"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#8b8b9e] uppercase">
                      Registration Deadline
                    </label>
                    <input
                      type="date"
                      disabled={!isAdmin}
                      value={item.deadlineIso || ""}
                      onChange={(e) => updateItemField(item.tempId, "deadlineIso", e.target.value || null)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#2a2a3c] bg-zinc-50/50 dark:bg-[#181824] px-2.5 py-1.5 text-zinc-900 dark:text-[#ebebef] disabled:opacity-80"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Render State 4: Initial Input Screen
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Informational Guidance Banner with Admin Access Indicator */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#5e6ad2] shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
            <span className="font-bold text-zinc-900 dark:text-[#ebebef]">
              Placement Notice Review Desk:
            </span>{" "}
            Paste placement notifications from Superset, WhatsApp circulars, or Outlook announcements.{" "}
            {isAdmin ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                You have placement administrator privileges with direct permission to add and publish drives.
              </span>
            ) : (
              <span>
                Notices submitted here are routed directly to the placement administration desk for verification prior to appearing on the live campus radar.
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          {isCheckingAdmin ? (
            <span className="text-[10px] font-mono text-zinc-400">Verifying access...</span>
          ) : isAdmin ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Direct Write Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200/80 dark:border-[#1e1e2a]">
              <Lock className="w-3 h-3 text-zinc-400" />
              Admin Review Mode
            </span>
          )}
        </div>
      </div>

      {/* Main Textarea Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#5e6ad2]" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
              Paste Placement Notice, Circular, or Assessment Notification
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 dark:text-[#5a5a6e] font-mono">
            {rawText.length.toLocaleString()} / 30,000 characters
          </span>
        </div>

        <textarea
          rows={9}
          value={rawText}
          onChange={(e) => setRawText(e.target.value.substring(0, 30000))}
          placeholder={`Paste recruiter email announcements, Superset schedules, or WhatsApp circulars here...

For example:
Company: Google
Role: Application Engineering Intern
Package: ₹1.14 Lakh/month
Online Assessment: 24 Sep 2026 at 10:00 AM IST
Eligibility: 2027 batch, CSE/IT, CGPA ≥ 7.0`}
          className="w-full rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#181824] p-3.5 text-xs font-mono text-zinc-900 dark:text-[#ebebef] placeholder-zinc-400 dark:placeholder-[#5a5a6e] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] transition-all resize-y"
        />

        {/* Quick Sample Demo Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-mono font-semibold text-zinc-400 dark:text-[#5a5a6e] uppercase">
            Quick Samples:
          </span>
          <button
            type="button"
            onClick={() => setRawText(SAMPLE_COPILOT_TABLE)}
            className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
          >
            Placement Table Sample
          </button>
          <button
            type="button"
            onClick={() => setRawText(SAMPLE_ASSESSMENT_NOTICE)}
            className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
          >
            Assessment Schedule Sample
          </button>
          <button
            type="button"
            onClick={() => setRawText(SAMPLE_RESULT_NOTICE)}
            className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
          >
            Shortlist Circular Sample
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-between items-center">
          <div className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
            {isAdmin ? (
              <span>Direct write access active</span>
            ) : (
              <span>Notice submissions route to placement desk for review</span>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || rawText.trim().length < 10}
            className="px-5 py-2.5 rounded-lg font-bold text-xs bg-[#5e6ad2] hover:bg-[#828df8] disabled:opacity-50 text-white shadow-sm flex items-center gap-2 transition-all"
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                Analyzing Notice...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Placement Notice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
