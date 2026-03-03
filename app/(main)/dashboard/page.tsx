import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardContent } from "./components/DashboardContent";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

export const metadata = {
  title: "Dashboard - MockMate",
  description: "View your quiz stats, streaks, badges, and recent activity.",
};

async function DashboardLoader() {
  try {
    const data = await getDashboardData();

    if (!data) {
      redirect("/login?redirect=/dashboard");
    }

    return <DashboardContent data={data} />;
  } catch (error) {
    // If redirect() was called, re-throw it (Next.js uses throw for redirects)
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // For any other error, let the error boundary handle it
    throw error;
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {/* @ts-expect-error Async Server Component */}
      <DashboardLoader />
    </Suspense>
  );
}
