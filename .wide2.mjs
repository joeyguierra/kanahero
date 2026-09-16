import { chromium } from "playwright";
const DIR = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
await p.click(".deckRow:has-text('HIRAGANA')");
await p.click("button:has-text('START SESSION')");
await p.waitForTimeout(300);
await p.click(".setRow");
await p.click("button:has-text('DEAL')");
for (let i = 0; i < 10; i++) {
  const box = await p.locator(".canvasBox").boundingBox();
  await p.mouse.move(box.x + 40, box.y + 50);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width - 40, box.y + box.height - 50, { steps: 8 });
  await p.mouse.up();
  await p.click("button:has-text('FLIP')");
  await p.waitForSelector(".wordReveal svg");
  const cells = await p.locator(".wordRevealCell").count();
  if (cells === 5) {
    await p.waitForTimeout(6000);
    await p.locator(".canvasBox").screenshot({ path: `${DIR}/wide-5kana.png` });
    break;
  }
  await p.click("button:has-text('GOT IT')");
  await p.waitForTimeout(400);
  await p.locator("main").click({ position: { x: 20, y: 700 } });
  await p.waitForTimeout(300);
}
// the drill, whose reveal is one centred character
await p.goto("http://localhost:3000/");
await p.click(".deckRow:has-text('HIRAGANA')");
await p.click("button:has-text('START SESSION')");
await p.waitForTimeout(200);
await p.click(".deckCharacters");
await p.waitForSelector("canvas.ink");
const box2 = await p.locator(".canvasBox").boundingBox();
await p.mouse.move(box2.x + 60, box2.y + 60);
await p.mouse.down();
await p.mouse.move(box2.x + 300, box2.y + 240, { steps: 8 });
await p.mouse.up();
await p.click("button:has-text('Show')");
await p.waitForTimeout(2500);
await p.screenshot({ path: `${DIR}/wide-drill.png` });
await b.close();
