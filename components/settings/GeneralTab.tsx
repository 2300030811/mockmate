"use client";

import { User, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { AVATAR_ICONS, getAvatarIcon } from "@/lib/icons";
import { Profile, AppUser } from "@/types";

interface GeneralTabProps {
  profile: Profile | null;
  user: AppUser | null; 
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
  submitButton: React.ReactNode;
}

export function GeneralTab({ profile, user, selectedIcon, setSelectedIcon, submitButton }: GeneralTabProps) {
  const nickname = profile?.nickname || user?.user_metadata?.nickname || "User";

  return (
    <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/30">
            {(() => {
              const Icon = getAvatarIcon(selectedIcon);
              return <Icon className="w-8 h-8" />;
            })()}
          </div>
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your public display information and avatar.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <input type="hidden" name="avatar_icon" value={selectedIcon} />
        
        <div className="space-y-3">
          <label className="text-sm font-medium leading-none flex items-center gap-2 dark:text-gray-200">
            <User className="w-4 h-4 text-gray-500" />
            Profile Icon
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
            {AVATAR_ICONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIcon(item.id)}
                  className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                    selectedIcon === item.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                      : "bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:scale-105"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label 
            htmlFor="nickname" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 dark:text-gray-200"
          >
            <User className="w-4 h-4 text-gray-500" />
            Display Name
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            defaultValue={nickname}
            className="flex h-11 w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950/50 dark:border-gray-800 dark:text-white dark:focus-visible:ring-blue-400 transition-all font-medium"
            placeholder="Enter your nickname"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This name will be displayed on the leaderboard and your public profile.
          </p>
        </div>

        <div className="space-y-3">
          <label 
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 dark:text-gray-200"
          >
              <Mail className="w-4 h-4 text-gray-500" />
              Email Address
          </label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-400 cursor-not-allowed"
          />
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-3 py-1 rounded-full font-medium">
            <Shield className="w-3 h-3" />
            Verified Account
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          {submitButton}
        </div>
      </CardContent>
    </Card>
  );
}
