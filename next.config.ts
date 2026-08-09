import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: "/mündlich/:path*",
        destination: "/muendlich/:path*",
      },
    ];
  },
};

export default nextConfig;
