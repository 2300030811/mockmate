"use client";

// @ts-ignore - Types for these hooks are missing in current @types/react-dom version
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/auth-provider";
import { updateProfile, ProfileState } from "@/app/actions/profile";
import { 
  User, 
  Trash2, 
  Save, 
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { DangerTab } from "./DangerTab";

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
  const { user, profile, refresh } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Custom hook usage with proper types if possible, or keeping it as is but cleaner
  // @ts-ignore
  const [state, formAction] = useFormState(updateProfile, initialState);
  
  const [activeTab, setActiveTab] = useState("general");
  const [selectedIcon, setSelectedIcon] = useState("User");
  const lastProcessedMessage = useRef<string | undefined>(undefined);

  // Set initial icon when profile is available
  useEffect(() => {
    if (profile?.avatar_icon) {
      setSelectedIcon(profile.avatar_icon);
    }
  }, [profile?.avatar_icon]);

  useEffect(() => {
    const messageToShow = state.success ? state.message : state.error;
    
    if (messageToShow && messageToShow !== lastProcessedMessage.current) {
      if (state.success) {
        toast.success(state.message, {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        });
        setTimeout(() => {
          refresh();
        }, 500);
      } else if (state.error) {
        toast.error(state.error, {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
      }
      
      lastProcessedMessage.current = messageToShow;
    }
    
    if (!state.message && !state.error) {
      lastProcessedMessage.current = undefined;
    }
  }, [state, refresh]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <form action={formAction}>
            <GeneralTab 
              profile={profile} 
              user={user} 
              selectedIcon={selectedIcon} 
              setSelectedIcon={setSelectedIcon}
              submitButton={<SubmitButton />}
            />
          </form>
        );
      case "appearance":
        return <AppearanceTab theme={theme} toggleTheme={toggleTheme} />;
      case "danger":
        return <DangerTab />;
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
