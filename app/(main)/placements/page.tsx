import { Metadata } from "next";
import { getPlacementHubData } from "@/app/actions/placements";
import { PlacementsClient } from "./components/PlacementsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Placement Hub - MockMate",
  description:
    "Real-time campus placement intelligence, live drive tracker, today radar, and historical recruitment compensation data.",
};

interface PlacementsPageProps {
  searchParams?: Promise<{ tab?: string }> | { tab?: string };
}

export default async function PlacementsPage({ searchParams }: PlacementsPageProps) {
  const [data, resolvedParams] = await Promise.all([
    getPlacementHubData(),
    searchParams ? Promise.resolve(searchParams) : undefined,
  ]);

  const initialTab =
    resolvedParams?.tab === "import"
      ? "import"
      : resolvedParams?.tab === "directory"
      ? "directory"
      : "command_center";

  return <PlacementsClient initialData={data} initialTab={initialTab} />;
}
