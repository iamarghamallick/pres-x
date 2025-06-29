import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ✅ Don't fail the build on TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Don't fail the build on ESLint errors
  },
};

export default nextConfig;
