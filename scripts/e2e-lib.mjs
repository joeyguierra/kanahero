// Shared by e2e-loop and e2e-offline: serve `out/`, and drive one word of the
// v7 loop the way a thumb does.

import { spawn } from "node:child_process";

export async function serveOut(port) {
  const url = `http://localhost:${port}`;
  const server = spawn("npx", ["-y", "serve", "-l", String(port), "out"], { stdio: "ignore" });
  const kill = () => server.kill();
  process.on("exit", kill);
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return { url, kill };
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`nothing answered on ${url}`);
}

/** Today's big line: "N due · M new", or the next line when the day is done */
export const big = (page) => page.locator(".v7Counts").innerText();

export async function draw(page) {
  const box = await page.locator("canvas.ink").boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
  await page.mouse.up();
  return box;
}

/** What the prompt shows: the script label, the cue, and the header. */
export async function readPrompt(page) {
  await page.waitForSelector(".v7Prompt");
  return {
    trial: (await page.locator(".v7TrialForm").count()) > 0,
    prompt: (await page.locator(".v7Prompt").innerText()).replace(/\s+/g, " ").trim(),
    head: (await page.locator(".v7Head").innerText()).replace(/\s+/g, " ").trim(),
  };
}

/** Tap the prompt on its way: one tap starts the melt. A study trial is
    tapped once its form has drawn, on the label, so the tap is not one of the
    drawing's own. */
export async function hurryPrompt(page, trial) {
  if (trial) await page.waitForSelector(".v7TrialForm svg path");
  await page.locator(".v7Script").click();
}

/**
 * One word: read the prompt, tap it on its way, write, DONE, grade. Returns
 * what the prompt showed and what the reveal said the word was.
 * `shown`: a prompt already read with readPrompt, when the caller looked first.
 * `wait`: leave the prompt alone and let it run its own time.
 */
export async function playItem(page, ok = true, shown = null, { wait = false } = {}) {
  const { trial, prompt, head } = shown ?? (await readPrompt(page));
  if (!wait && (await page.locator(".v7Prompt").count()) > 0) await hurryPrompt(page, trial);
  await page.waitForSelector("canvas.ink");
  // the prompt is gone from the write screen until it is asked for, and goes
  // again when the pen touches the board
  const cueAtStart = await page.locator(".v7CueBody").count();
  await page.click("button:has-text('SHOW PROMPT')");
  const cue = (await page.locator(".v7CueBody").innerText()).replace(/\s+/g, " ").trim();
  const board = await draw(page);
  const cueAfterInk = await page.locator(".v7CueBody").count();
  await page.click("button:has-text('DONE')");
  await page.waitForSelector(".wordReveal");
  const cueOnReveal = await page.locator(".v7Cue").count();
  const word = (await page.locator(".v7AnswerWord").innerText()).trim();
  const kanji = (await page.locator(".v7AnswerKanji").allInnerTexts()).join("");
  const revealBoard = await page.locator("canvas.ink").boundingBox();
  await page.click(`button:has-text('${ok ? "GOT IT" : "MISSED"}')`);
  return { trial, prompt, cue, cueAtStart, cueAfterInk, cueOnReveal, head, word, kanji, board, revealBoard };
}

export const stored = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("kanahero:v7") ?? "null"));

export const ledger = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("kanahero-ledger");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains("rows")) return resolve([]);
          const all = db.transaction("rows").objectStore("rows").getAll();
          all.onsuccess = () => resolve(all.result);
          all.onerror = () => reject(all.error);
        };
      }),
  );
