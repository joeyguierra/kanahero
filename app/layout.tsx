import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// next/font self-hosts at build time — no runtime font requests, offline-safe.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  themeColor: "#131215",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // pinch-zoom off: the writing canvas must own all touch gestures
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
