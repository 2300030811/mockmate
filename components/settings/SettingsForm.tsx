"use client";

// @ts-ignore - Types for these hooks are missing in current @types/react-dom version
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/auth-provider";
import { updateProfile, ProfileState } from "@/app/actions/profile";
import { 
  User, 
  Mail, 
  Save, 
  Trash2, 
  Shield, 
  Moon, 
  Sun,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTheme } from "@/components/providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

const initialState: ProfileState = {
  message: undefined,
  error: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      variant="primary"
      disabled={pending}
      className="w-full sm:w-auto gap-2"
    >
      {pending ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Save Changes
        </>
      )}
    </Button>
  );
}

export function SettingsForm() {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  // @ts-ignore
  const [state, formAction] = useFormState(updateProfile, initialState);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (state.success) {
      toast.success(state.message, {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      });
    } else if (state.error) {
      toast.error(state.error, {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    }
  }, [state]);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const nickname = profile?.nickname || user.user_metadata?.nickname || "User";

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <form action={formAction}>
            <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/30">
                    {getInitials(nickname)}
                  </div>
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your public display information.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    value={user.email}
                    disabled
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-400 cursor-not-allowed"
                  />
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-3 py-1 rounded-full font-medium">
                    <Shield className="w-3 h-3" />
                    Verified Account
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <SubmitButton />
                </div>
              </CardContent>
            </Card>
          </form>
        );
      case "appearance":
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
      case "danger":
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
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            activeTab === "general"
              ? "bg-white dark:bg-gray-800 shadow-md text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          }`}
        >
          <User className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            activeTab === "appearance"
              ? "bg-white dark:bg-gray-800 shadow-md text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Appearance
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            activeTab === "danger"
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-200 dark:ring-red-900"
              : "text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400"
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </button>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
