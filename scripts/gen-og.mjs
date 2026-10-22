// Generates the share preview (Open Graph / Twitter card) — the image a link
// to the app unfurls into on WhatsApp, iMessage, Slack, X and the rest.
// Run: node scripts/gen-og.mjs   (needs the network once, for the fonts)
//
// Rendered by Playwright rather than sharp because the card is type-led, and
// librsvg would set it in whatever fonts the machine happens to have. Output
// goes to app/, where Next's file convention picks it up and writes the tags.

import { copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.join(import.meta.dirname, "..");
const W = 1200;
const H = 630;

// THE LOG tokens (app/globals.css)
const C = {
  chassis: "#0a0a0b",
  bone: "#f2f0eb",
  strike: "#ff2e88",
  print: "#b9b6b1",
  carbon: "#5a5a5f",
  seam: "#2a2a2e",
};

const joker = (await readFile(path.join(ROOT, "public/assets/joker-mascot-open.png"))).toString("base64");

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@900&family=JetBrains+Mono:wght@400;700&display=block">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; background: ${C.chassis}; overflow: hidden; position: relative; }
  .rule { position: absolute; left: 72px; right: 72px; bottom: 64px; border-top: 1px solid ${C.seam}; }
  .text { position: absolute; left: 72px; top: 118px; width: 640px; }
  .eyebrow { font: 700 20px/1 "JetBrains Mono"; letter-spacing: 4px; color: ${C.strike}; }
  .mark { margin-top: 26px; font: 900 100px/0.9 "Archivo"; letter-spacing: -2px; color: ${C.bone}; }
  .line { margin-top: 30px; font: 400 26px/1.35 "JetBrains Mono"; color: ${C.print}; }
  .chip { display: inline-block; margin-top: 38px; padding: 14px 20px; background: ${C.strike};
          font: 700 20px/1 "JetBrains Mono"; letter-spacing: 3px; color: #000; }
  .foot { position: absolute; left: 72px; bottom: 30px; font: 400 16px/1 "JetBrains Mono";
          letter-spacing: 2.4px; color: ${C.carbon}; }
  .joker { position: absolute; right: -12px; bottom: 64px; width: 500px; height: 500px; }
</style></head>
<body>
  <img class="joker" src="data:image/png;base64,${joker}" alt="">
  <div class="text">
    <div class="eyebrow">WRITE JAPANESE FROM MEMORY</div>
    <div class="mark">KANAHERO</div>
    <div class="line">Write it by hand. Watch the real stroke order draw over it.</div>
    <div class="chip">HIRAGANA · KATAKANA · KANJI</div>
  </div>
  <div class="rule"></div>
  <div class="foot">OFFLINE · FREE · NO ACCOUNT</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const out = path.join(ROOT, "app", "opengraph-image.png");
await page.screenshot({ path: out });
await browser.close();

// X reads its own tag; the same picture serves both
await copyFile(out, path.join(ROOT, "app", "twitter-image.png"));
console.log(`wrote app/opengraph-image.png and app/twitter-image.png (${W}×${H})`);
