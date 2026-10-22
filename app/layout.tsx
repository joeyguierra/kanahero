import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono, Klee_One, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";

// Klee One renders the kana (same font the stroke data derives from).
// next/font self-hosts at build time — no runtime font requests, offline-safe.
const klee = Klee_One({
  weight: ["400", "600"],
  subsets: ["latin"], // JP glyphs arrive via unicode-range slices
  variable: "--font-klee",
  preload: false,
  display: "swap",
});

// v2 type system: Archivo carries the display weights (the 900s do most of the
// work), JetBrains Mono every instrument label. Both are variable fonts, so
// no weight list — the whole axis ships in one file.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  preload: false,
  display: "swap",
});

// The ghost glyphs only — the design draws them in Noto Sans JP at 900, and a
// 1px outline of a calligraphic face reads nothing like an outline of a heavy
// gothic one. Kana shown *as characters* stay Klee One, which is the face the
// stroke data derives from.
const jp = Noto_Sans_JP({
  subsets: ["latin"], // JP glyphs arrive via unicode-range slices
  variable: "--font-jp",
  preload: false,
  display: "swap",
});

const DESCRIPTION =
  "Write Japanese from memory: hiragana, katakana and kanji, by hand, with the real stroke order drawn over your attempt. Offline, free, no account.";

export const metadata: Metadata = {
  // share previews need absolute URLs; the image itself is app/opengraph-image.png
  // (scripts/gen-og.mjs), which Next turns into the og:image and twitter:image tags
  metadataBase: new URL("https://kanahero.joeyguierra.com"),
  title: "kanahero",
  description: DESCRIPTION,
  applicationName: "kanahero",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "kanahero",
    title: "kanahero — write Japanese from memory",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "kanahero — write Japanese from memory",
    description: DESCRIPTION,
  },
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
    <html lang="en" className={`${klee.variable} ${archivo.variable} ${mono.variable} ${jp.variable}`}>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
