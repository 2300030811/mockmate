"use client";

// @ts-expect-error -- @types/react-dom 18.2.x lacks useFormState/useFormStatus typings
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState, useRef, useCallback, KeyboardEvent } from "react";
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
  AlertCircle,
  Shield
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { SecurityTab } from "./SecurityTab";
import { DangerTab } from "./DangerTab";

const initialState: ProfileState = {
  message: undefined,
  error: undefined,
  success: false,
};

const TABS = [
  { id: "general", label: "General", icon: User },
  { id: "appearance", label: "Appearance", icon: LayoutDashboard },
  { id: "security", label: "Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

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

interface SettingsFormProps {
  initialTab?: string;
}

export function SettingsForm({ initialTab = "general" }: SettingsFormProps) {
  const { user, profile, refresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [state, formAction] = useFormState(updateProfile, initialState);
  
  const validTab = TABS.find(t => t.id === initialTab)?.id ?? "general";
  const [activeTab, setActiveTab] = useState<TabId>(validTab);
  const [selectedIcon, setSelectedIcon] = useState("User");
  const lastProcessedMessage = useRef<string | undefined>(undefined);
  const tabPanelRef = useRef<HTMLDivElement>(null);

  // Sync tab state with URL
  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/settings?${params.toString()}`, { scroll: false });
    // Move focus to tab panel for accessibility
    setTimeout(() => tabPanelRef.current?.focus(), 100);
  }, [router, searchParams]);

  // Keyboard navigation for tabs (arrow keys)
  const handleTabKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, currentIdx: number) => {
    let nextIdx = currentIdx;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      nextIdx = (currentIdx + 1) % TABS.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      nextIdx = (currentIdx - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIdx = TABS.length - 1;
    } else {
      return;
    }
    switchTab(TABS[nextIdx].id);
    // Focus the new tab button
    const tabButtons = document.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabButtons[nextIdx]?.focus();
  }, [switchTab]);

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
        return <AppearanceTab theme={theme} setTheme={setTheme} />;
      case "security":
        return <SecurityTab user={user} />;
      case "danger":
        return <DangerTab />;
      default:
        return null;
    }
  };

  const getTabStyle = (tab: TabId) => {
    if (tab === "danger") {
      return activeTab === "danger"
        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-200 dark:ring-red-900"
        : "text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400";
    }
    return activeTab === tab
      ? "bg-white dark:bg-gray-800 shadow-md text-blue-600 dark:text-blue-400"
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Tab Navigation */}
      <div className="lg:col-span-1 space-y-2" role="tablist" aria-label="Settings sections" aria-orientation="vertical">
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => switchTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, idx)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${getTabStyle(tab.id)}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div
        className="lg:col-span-3"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        ref={tabPanelRef}
        tabIndex={-1}
      >
        <AnimatePresence mode="wait">
          <m.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
