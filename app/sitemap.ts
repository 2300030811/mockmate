import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
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
