import { Metadata } from "next";
import { getPlacementHubData } from "@/app/actions/placements";
import { PlacementsClient } from "./components/PlacementsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Placement Hub - MockMate",
  description:
    "Real-time campus placement intelligence, live drive tracker, today radar, and historical recruitment compensation data.",
};

export default async function PlacementsPage() {
  const data = await getPlacementHubData();

  return <PlacementsClient initialData={data} />;
}
