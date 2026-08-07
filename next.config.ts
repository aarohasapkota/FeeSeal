import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare tunnel / custom hostname in `next dev`
  allowedDevOrigins: ["fees.fuegowork.dev", "*.fuegowork.dev"],
};

export default nextConfig;
