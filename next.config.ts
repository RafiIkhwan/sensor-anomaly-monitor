import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  output: "standalone",
  env: {
    NEXT_PUBLIC_LEVEL_THRESHOLD: process.env.LEVEL_THRESHOLD_PERCENT,
    NEXT_PUBLIC_ENABLE_TELEGRAM: process.env.ENABLE_TELEGRAM,
    NEXT_PUBLIC_ENABLE_WHATSAPP: process.env.ENABLE_WHATSAPP,
  }
};

export default nextConfig;
