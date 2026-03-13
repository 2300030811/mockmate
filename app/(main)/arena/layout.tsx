import { requireAuth } from "@/lib/auth-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arena | MockMate",
  description: "Challenge other developers in real-time 1v1 quiz battles. Test your coding skills and rise through the ranks.",
};

export default async function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce authentication to prevent "forever spinner" for guest users
  await requireAuth();
  
  return <>{children}</>;
}
