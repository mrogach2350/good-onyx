import type { NextConfig } from "next";
import './envConfig.ts'

const BASE_SERVER_URL = process.env.BASE_SERVER_URL

const nextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BASE_SERVER_URL}/:path*`,
      },
    ]
  },
  experimental: {
    turbo: {
      moduleIdStrategy: "deterministic",
    },
  },
} satisfies NextConfig;

export default nextConfig;
