import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow phones/other devices on the LAN to load the dev server's
  // `/_next/*` resources (chunks, HMR). Without this, Next 16 blocks them as
  // cross-origin when you open the site by LAN IP, so lazily-loaded pieces
  // (the 3D canvas) and hot-reload silently fail on mobile. Wildcard covers
  // whatever DHCP hands the device; add other subnets if your LAN differs.
  allowedDevOrigins: ["10.0.0.*", "192.168.*"],
};

export default nextConfig;
