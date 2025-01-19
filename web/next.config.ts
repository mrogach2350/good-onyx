import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    turbo: {
      moduleIdStrategy: "deterministic",
    },
  },
};

export default nextConfig;
