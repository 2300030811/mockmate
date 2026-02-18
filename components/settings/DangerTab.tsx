"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function DangerTab() {
  return (
    <Card className="border-red-100 dark:border-red-900/30 shadow-xl bg-red-50/30 dark:bg-red-900/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 rounded-2xl border border-red-100 dark:border-red-900/30">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Delete Account</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Permanently remove your personal data, quiz history, and settings. This action cannot be undone.
            </p>
          </div>
          <Button variant="destructive" disabled className="opacity-80 cursor-not-allowed">
            Delete Account
          </Button>
        </div>
        <p className="text-xs text-center text-gray-400">
          Account deletion is currently disabled for security reasons. Please contact support.
        </p>
      </CardContent>
    </Card>
  );
}
