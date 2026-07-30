import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllCategories } from "@/lib/quiz-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const lastModified = new Date();

  const staticPages = [
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
  ];

  const quizPages = getAllCategories().map((c) => ({
    path: `/${c.routeSlug}`,
    priority: 0.85,
  }));

  const pages = [...staticPages, ...quizPages];

  return pages.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    priority,
    changeFrequency: path === "" ? "daily" : "weekly",
  })) as MetadataRoute.Sitemap;
}
