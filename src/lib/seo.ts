import type { Metadata } from "next";
import { getClientEnv } from "@/lib/env";

const env = getClientEnv();

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
export const SITE_NAME = env.NEXT_PUBLIC_SITE_NAME;

const DEFAULT_OG_IMAGE = "/avatar.png";

interface SeoOptions {
  /**
   * Page title WITHOUT the site-name suffix — the root layout template
   * (`%s | SiteName`) appends it automatically. Pass `absolute: true` to
   * opt out (e.g. the home page).
   */
  title: string;
  description: string;
  /** Absolute path starting with "/", e.g. "/projects". */
  path: string;
  /** OG/Twitter image: absolute path or full URL. Defaults to the avatar. */
  ogImage?: string;
  /** Render the page without indexing (error states, private areas). */
  noIndex?: boolean;
  /** Use `title` verbatim instead of letting the root template append the site name. */
  absolute?: boolean;
}

/**
 * Single source of truth for page metadata: canonical URL, Open Graph,
 * and Twitter card are derived consistently from one input object.
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex = false,
  absolute = false,
}: SeoOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    ...(absolute ? { title: { absolute: title } } : { title }),
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "id_ID",
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    ...(noIndex && { robots: { index: false, follow: false } as const }),
  };
}

/** Metadata for detail pages whose content was not found (soft 404 guard). */
export function buildNotFoundMetadata(entityLabel: string): Metadata {
  return {
    title: `${entityLabel} Not Found`,
    robots: { index: false, follow: false },
  };
}
