import { getAllQuizResults } from "@/app/actions/admin";
import { LeaderboardTable } from "./LeaderboardTable";

export default async function AdminLeaderboardPage() {
  const { success, data, error } = await getAllQuizResults(100);

  if (!success || !data) {
    return (
      <div className="p-8 text-red-500">
        Error loading leaderboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard Management</h2>
        <p className="text-muted-foreground opacity-60">
          View and remove inappropriate entries from the global leaderboard.
        </p>
      </div>

      <LeaderboardTable results={data as any[]} />
    </div>
  );
}
