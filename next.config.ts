import type { NextConfig } from "next";

// Static export: no server, no API. The whole app is files that a service
// worker can precache — that's what makes it work on a plane.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
