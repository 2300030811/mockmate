import { Metadata } from "next";
import { getAdminStats } from "@/app/actions/admin";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Operations & Telemetry - MockMate",
  description:
    "Real-time platform throughput, assessment telemetry, student evaluation metrics, and campus placement infrastructure.",
};

export default async function AdminDashboard() {
  const { success, data, error } = await getAdminStats();

  if (!success || !data) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
        <h3 className="text-base font-semibold">Access Error</h3>
        <p className="text-sm mt-1">Failed to load platform telemetry: {error || "Unauthorized"}</p>
      </div>
    );
  }

  return <AdminDashboardClient data={data} />;
}
