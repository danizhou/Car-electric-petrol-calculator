import type { NextConfig } from "next";

// GitHub Pages serves static files from a sub-path (e.g. /Car-electric-petrol-calculator),
// so that build is a static export with a base path. Other builds run as a normal Next.js server.
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath,
  output: isStaticExport ? "export" : undefined,
};

export default nextConfig;
