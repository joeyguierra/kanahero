import type { Metadata, Viewport } from "next";
import { Klee_One } from "next/font/google";
import "./globals.css";

// Klee One renders the kana (same font the stroke data derives from).
// next/font self-hosts at build time — no runtime font requests, offline-safe.
const klee = Klee_One({
  weight: ["400", "600"],
  subsets: ["latin"], // JP glyphs arrive via unicode-range slices
  variable: "--font-klee",
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "kanahero",
  description: "Write hiragana from memory. Prompt, write, reveal, self-grade.",
  applicationName: "kanahero",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "kanahero",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // pinch-zoom off: the writing canvas must own all touch gestures
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={klee.variable}>
      <body>{children}</body>
    </html>
  );
}
