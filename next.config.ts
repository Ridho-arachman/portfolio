import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone", // WAJIB untuk Dockerfile production
  // Jika menggunakan Next.js 14.1+ dan Ngrok, tambahkan ini agar tidak diblokir:
};

export default nextConfig;
