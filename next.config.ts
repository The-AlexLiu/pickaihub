import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.theresanaiforthat.com",
      },
      {
        protocol: "https",
        hostname: "vievznbebirzshdrpneq.supabase.co",
      },
      // Allow any other domains if needed, or act strictly
    ],
  },
};

export default nextConfig;
