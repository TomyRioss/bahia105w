import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "http",
        hostname: "153.75.247.241",
      },
      {
        protocol: "https",
        hostname: "153.75.247.241",
      },
    ],
  },
};

export default nextConfig;
