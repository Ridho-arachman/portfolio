import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

function securityHeaders(isProduction: boolean) {
  return [
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org",
        "font-src 'self' data:",
        "connect-src 'self' https://challenges.cloudflare.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org ws: wss:",
        "frame-src 'self' https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        ...(isProduction ? ["upgrade-insecure-requests"] : []),
      ].join("; "),
    },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    ...(isProduction
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ]
      : []),
  ];
}

const ngrokDomain = process.env.NEXT_PUBLIC_NGROK_DOMAIN;

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactCompiler: false,
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  compress: true, // Enable gzip compression
  
  // Image Optimization - Critical for LCP
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@tanstack/react-query",
      "@tanstack/react-table",
      "zustand",
      "motion",
      "recharts",
      "clsx",
      "tailwind-merge",
    ],
    optimizeCss: true,
  },

  // Compiler options for smaller bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  allowedDevOrigins: ngrokDomain ? [ngrokDomain] : undefined,
  
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders(process.env.NODE_ENV === "production"),
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache public assets (images, fonts)
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff|woff2|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Add preconnect hints via headers for critical origins
      {
        source: "/",
        headers: [
          { key: "Link", value: "<https://images.unsplash.com>; rel=preconnect; crossorigin" },
          { key: "Link", value: "<https://picsum.photos>; rel=preconnect; crossorigin" },
          { key: "Link", value: "<https://challenges.cloudflare.com>; rel=preconnect; crossorigin" },
          { key: "Link", value: "<https://*.supabase.co>; rel=preconnect; crossorigin" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
