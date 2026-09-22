import type { NextConfig } from "next";

// Static export: no server, no API. The whole app is files that a service
// worker can precache — that's what makes it work on a plane.
const nextConfig: NextConfig = {
  output: "export",

  // DEV ONLY, and it has nothing to do with the export. Next blocks requests
  // for dev-only assets — the chunks, the HMR socket — from any origin other
  // than the one the server was started on, which is `localhost`. Open the dev
  // server as 127.0.0.1 or over the LAN and every chunk comes back 403: the
  // markup renders, nothing hydrates, no button works and no effect runs.
  //
  // This app is tuned on a phone over the LAN — the writing canvas and the
  // sound board are both things you have to hold — so the private ranges are
  // allowed through. `next build` never reads this.
  allowedDevOrigins: [
    "127.0.0.1",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "*.local",
  ],
};

export default nextConfig;
