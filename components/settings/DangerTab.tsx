"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Download, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  FileText, 
  ShieldAlert, 
  CheckCircle2,
  Clock,
  Archive
} from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/app/actions/auth";
import { exportUserData } from "@/app/actions/profile";
import { useRouter } from "next/navigation";

export function DangerTab() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const result = await exportUserData();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Download as JSON file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mockmate-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Your MockMate data export has been downloaded.", {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      });
    } catch {
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;

    setDeleting(true);
    try {
      const result = await deleteAccount({ hardDelete: true });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Account and all associated personal data have been completely wiped.");
        router.push("/");
      }
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="rounded-xl border border-red-500/20 dark:border-red-950/40 bg-white dark:bg-[#14141e] shadow-subtle overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-[#1e1e2a]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Danger Zone & Data Governance
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Export your complete platform record under GDPR guidelines or initiate account termination.
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Risk Zone</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Export Data Section */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/60 dark:bg-[#11111a] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] dark:text-[#7f8cf8] shrink-0">
                <Archive className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                  GDPR Data Portability & Archive
                </h4>
                <p className="text-[10.5px] text-zinc-500 dark:text-[#8b8b9e] max-w-md leading-relaxed">
                  Export an unencrypted JSON payload containing your complete profile, quiz answers, certification records, and preferences.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleExportData}
              disabled={exporting}
              className="gap-2 text-xs font-medium border-zinc-200 dark:border-[#28283a] bg-white dark:bg-[#181824] shrink-0 h-8"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#5e6ad2]" />
                  <span>Export JSON</span>
                </>
              )}
            </Button>
          </div>

          <div className="pt-2 border-t border-zinc-200/60 dark:border-[#1e1e2a] flex flex-wrap gap-1.5 text-[10px] font-mono text-zinc-500 dark:text-[#6a6a7e]">
            <span className="flex items-center gap-1 bg-zinc-100 dark:bg-[#161622] px-2 py-0.5 rounded">
              <FileText className="w-3 h-3 text-[#5e6ad2]" /> Quiz History
            </span>
            <span className="flex items-center gap-1 bg-zinc-100 dark:bg-[#161622] px-2 py-0.5 rounded">
              <FileText className="w-3 h-3 text-emerald-500" /> Career Track Logs
            </span>
            <span className="flex items-center gap-1 bg-zinc-100 dark:bg-[#161622] px-2 py-0.5 rounded">
              <FileText className="w-3 h-3 text-amber-500" /> User Telemetry
            </span>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-red-500/20 dark:border-red-950/50 bg-red-50/20 dark:bg-red-950/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                  Account Termination & Data Purge
                </h4>
                <p className="text-[10.5px] text-zinc-500 dark:text-[#8b8b9e] max-w-md leading-relaxed">
                  Mark your account for permanent deletion. Your active session will be revoked, and your records queued for purge following a 7-day grace window.
                </p>
              </div>
            </div>

            {!showConfirm && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowConfirm(true)}
                className="gap-2 text-xs font-medium shrink-0 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 hover:bg-red-500/20 h-8"
              >
                <Trash2 className="w-3 h-3" />
                <span>Initiate Deletion</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>India DPDP Act (2023) Right to Erasure: Complete wipe of profile, quiz logs, and telemetry.</span>
          </div>

          {/* Confirmation Accordion */}
          {showConfirm && (
            <div className="p-4 bg-white dark:bg-[#11111a] border border-red-500/30 rounded-xl space-y-3.5 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Are you absolutely sure you want to permanently erase this account?
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                    This triggers an immediate cascading database wipe and deletes your authentication record. Please type{" "}
                    <strong className="font-mono text-red-600 dark:text-red-400 bg-red-500/10 px-1 py-0.5 rounded">
                      DELETE
                    </strong>{" "}
                    to confirm.
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="flex h-10 w-full rounded-lg border border-red-300 dark:border-red-900/60 bg-zinc-50/50 dark:bg-[#161622] px-3.5 py-2 text-xs font-mono placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                aria-label="Confirmation input - type DELETE to confirm account deletion"
              />

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== "DELETE" || deleting}
                  className="gap-2 text-xs font-medium"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete Account</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText("");
                  }}
                  className="text-xs border-zinc-200 dark:border-[#28283a]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

