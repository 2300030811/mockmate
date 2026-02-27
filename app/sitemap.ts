import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const pages = [
    "",
    "/career-path",
    "/demo",
    "/upload",
    "/aws-quiz",
    "/azure-quiz",
    "/salesforce-quiz",
    "/mongodb-quiz",
    "/oracle-quiz",
    "/pcap-quiz",
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
  }));
}
