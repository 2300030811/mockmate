import { getAdminStats } from "@/app/actions/admin";
import { Users, FileQuestion, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const { success, data } = await getAdminStats();

  if (!success || !data) {
    return (
      <div className="p-8 text-red-500">
        Authentication Error or Failed to load stats.
      </div>
    );
  }

  const { totalUsers, totalQuizzes } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground opacity-60">
          High-level metrics for MockMate.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-70">Total Users</p>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </div>
        </div>

        {/* Total Quizzes Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-800 p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-70">Quizzes Taken</p>
            <div className="text-2xl font-bold">{totalQuizzes}</div>
          </div>
        </div>

        {/* Engagement Rate (Placeholder) */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-800 p-6 flex items-center gap-4 opacity-70">
           <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
           <div>
            <p className="text-sm font-medium opacity-70">Engagement</p>
            <div className="text-lg font-semibold">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
