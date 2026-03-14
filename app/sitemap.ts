import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const lastModified = new Date();
  const pages = [
    { path: "", priority: 1 },
    { path: "/certification", priority: 0.9 },
    { path: "/career-path", priority: 0.9 },
    { path: "/dashboard", priority: 0.9 },
    { path: "/demo", priority: 0.9 },
    { path: "/arena", priority: 0.8 },
    { path: "/project-mode", priority: 0.8 },
    { path: "/system-design", priority: 0.8 },
    { path: "/resume-roaster", priority: 0.7 },
    { path: "/daily-challenge", priority: 0.7 },
    { path: "/aws-quiz", priority: 0.85 },
    { path: "/azure-quiz", priority: 0.85 },
    { path: "/salesforce-quiz", priority: 0.85 },
    { path: "/mongodb-quiz", priority: 0.85 },
    { path: "/oracle-quiz", priority: 0.85 },
    { path: "/pcap-quiz", priority: 0.85 },
  ];

  return pages.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    priority,
    changeFrequency: path === "" ? "daily" : "weekly",
  })) as MetadataRoute.Sitemap;
}
