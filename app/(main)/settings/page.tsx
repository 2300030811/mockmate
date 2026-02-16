import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata = {
  title: "Settings - MockMate",
  description: "Manage your account settings and preferences.",
};

export default function SettingsPage() {
    return (
        <div className="container max-w-6xl py-10 px-4 md:px-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-3xl font-bold tracking-tight dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Settings</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Manage your account settings and preferences.
                    </p>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <div className="py-6">
                    <SettingsForm />
                </div>
            </div>
        </div>
    );
}
