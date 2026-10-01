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
  Palette,
  CheckCircle2,
  AlertCircle,
  Shield
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { SecurityTab } from "./SecurityTab";
import { DangerTab } from "./DangerTab";
import { Profile, AppUser } from "@/types";

const initialState: ProfileState = {
  message: undefined,
  error: undefined,
  success: false,
};

const TABS = [
  { id: "general", label: "General", description: "Profile, avatar & nickname", icon: User },
  { id: "appearance", label: "Appearance", description: "Themes, audio & display", icon: Palette },
  { id: "security", label: "Security", description: "Password & access telemetry", icon: Shield },
  { id: "danger", label: "Danger Zone", description: "Data export & deletion", icon: Trash2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full sm:w-auto gap-2 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-sm font-medium text-xs rounded-lg px-4 py-2 transition-all active:scale-[0.98] border border-transparent"
    >
      {pending ? (
        <>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </>
      )}
    </Button>
  );
}

interface SettingsFormProps {
  initialTab?: string;
  initialProfile?: Profile | null;
  initialUser?: any;
}

export function SettingsForm({
  initialTab = "general",
  initialProfile = null,
  initialUser = null,
}: SettingsFormProps) {
  const { user: authUser, profile: authProfile, refresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReduced = useReducedMotion();

  const user = authUser || initialUser;
  const profile = authProfile || initialProfile;

  const [state, formAction] = useFormState(updateProfile, initialState);
  
  const validTab = TABS.find((t) => t.id === initialTab)?.id ?? "general";
  const [activeTab, setActiveTab] = useState<TabId>(validTab);
  const [selectedIcon, setSelectedIcon] = useState(profile?.avatar_icon || "User");
  const lastProcessedMessage = useRef<string | undefined>(undefined);
  const tabPanelRef = useRef<HTMLDivElement>(null);

  // Sync tab state with URL
  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/settings?${params.toString()}`, { scroll: false });
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
    const tabButtons = document.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabButtons[nextIdx]?.focus();
  }, [switchTab]);

  // Sync avatar icon if profile updates
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
              user={user as AppUser} 
              selectedIcon={selectedIcon} 
              setSelectedIcon={setSelectedIcon}
              submitButton={<SubmitButton />}
            />
          </form>
        );
      case "appearance":
        return <AppearanceTab theme={theme} setTheme={setTheme} />;
      case "security":
        return <SecurityTab user={user as AppUser} />;
      case "danger":
        return <DangerTab />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
      {/* Sidebar Tab Navigation */}
      <div className="lg:col-span-1 lg:sticky lg:top-[76px]">
        {/* Mobile Horizontal Bar */}
        <div
          className="flex lg:hidden overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-zinc-100/90 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl mb-4"
          role="tablist"
          aria-label="Settings sections mobile"
          aria-orientation="horizontal"
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isDanger = tab.id === "danger";
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-mobile-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => switchTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg shrink-0 transition-all ${
                  isActive
                    ? isDanger
                      ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-semibold"
                      : "bg-white dark:bg-[#1c1c28] text-zinc-900 dark:text-[#ebebef] border border-zinc-200 dark:border-[#28283a] shadow-xs font-semibold"
                    : isDanger
                    ? "text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                    : "text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Vertical Sidebar */}
        <div
          className="hidden lg:flex flex-col bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-2 shadow-subtle space-y-1"
          role="tablist"
          aria-label="Settings sections"
          aria-orientation="vertical"
        >
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
            Preferences
          </div>

          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isDanger = tab.id === "danger";

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => switchTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 border ${
                  isActive
                    ? isDanger
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25 shadow-xs"
                      : "bg-zinc-100 dark:bg-[#1a1a26] text-zinc-900 dark:text-[#ebebef] border-zinc-200 dark:border-[#28283a] shadow-xs"
                    : isDanger
                    ? "text-zinc-600 dark:text-[#8b8b9e] hover:bg-red-500/5 hover:text-red-600 dark:hover:text-red-400 border-transparent"
                    : "text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-100/70 dark:hover:bg-[#181824] hover:text-zinc-900 dark:hover:text-white border-transparent"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? isDanger
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#7f8cf8]"
                      : isDanger
                      ? "bg-zinc-100 dark:bg-[#181824] text-zinc-500 dark:text-[#8b8b9e]"
                      : "bg-zinc-100 dark:bg-[#181824] text-zinc-500 dark:text-[#8b8b9e]"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium leading-tight truncate">
                    {tab.label}
                  </div>
                  <div className="text-[10.5px] text-zinc-400 dark:text-[#5a5a6e] truncate mt-0.5">
                    {tab.description}
                  </div>
                </div>
                {isActive && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDanger ? "bg-red-500" : "bg-[#5e6ad2]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
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
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

