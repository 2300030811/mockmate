"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

interface AppearanceTabProps {
  theme: string | undefined;
  toggleTheme: () => void;
}

export function AppearanceTab({ theme, toggleTheme }: AppearanceTabProps) {
  return (
    <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Appearance Preferences</CardTitle>
        <CardDescription>
          Customize how MockMate looks on your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-xl dark:bg-gray-800">
              {theme === "dark" ? <Moon className="w-6 h-6 text-indigo-400" /> : <Sun className="w-6 h-6 text-amber-500" />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark themes.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
