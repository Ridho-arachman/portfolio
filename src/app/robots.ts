import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";

// Sama seperti sitemap: `force-static` akan membekukan hostname saat build, jadi
// perubahan domain di admin tidak akan pernah sampai ke robots.txt.
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getSiteSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
