import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: process.env.NODE_ENV === "production",
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;
