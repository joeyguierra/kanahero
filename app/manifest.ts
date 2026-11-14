import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // required for output: "export"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "kanahero",
    short_name: "kanahero",
    description: "Write Japanese from memory — prompt, write, reveal, self-grade — on a schedule that brings each word back when it is due.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
