"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";
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
      toast.success("Your data has been exported.");
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
      const result = await deleteAccount();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Account marked for deletion. You have 7 days to contact support to recover it.");
        router.push("/");
      }
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="border-red-100 dark:border-red-900/30 shadow-xl bg-red-50/30 dark:bg-red-900/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Data */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Export My Data</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Download all your personal data, quiz history, and settings as a JSON file.
            </p>
          </div>
          <Button variant="outline" onClick={handleExportData} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Exporting..." : "Export Data"}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="p-4 bg-white dark:bg-gray-950 rounded-2xl border border-red-100 dark:border-red-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Delete Account</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Permanently remove your personal data, quiz history, and settings. 
                You will have a 7-day grace period to contact support to recover your account.
              </p>
            </div>
            {!showConfirm && (
              <Button variant="destructive" onClick={() => setShowConfirm(true)} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            )}
          </div>

          {showConfirm && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Are you absolutely sure?
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                    This will soft-delete your account. Type <strong>DELETE</strong> below to confirm.
                  </p>
                </div>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="flex h-10 w-full rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Confirmation input - type DELETE to confirm account deletion"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== "DELETE" || deleting}
                  className="gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? "Deleting..." : "Confirm Deletion"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowConfirm(false); setConfirmText(""); }}
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
