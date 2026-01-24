import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified,
    },
    {
      url: `${siteUrl}/widgets/stats`,
      lastModified,
    },
    {
      url: `${siteUrl}/widgets/goal`,
      lastModified,
    },
    {
      url: `${siteUrl}/widgets/chat`,
      lastModified,
    },
  ];
}
