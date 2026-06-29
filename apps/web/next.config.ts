import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.11.223'],
  output: 'standalone',
};

export default nextConfig;
