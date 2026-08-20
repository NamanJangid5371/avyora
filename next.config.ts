import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.AVYORA_APP === "admin" ? ".next-admin" : ".next",
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
