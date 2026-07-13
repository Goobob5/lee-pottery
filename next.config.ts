import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos uploaded from the phone live on Vercel Blob. Existing
    // repo-file photos (paths starting with `/`) keep working with no config;
    // only the remote Blob host needs to be allow-listed for next/image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
