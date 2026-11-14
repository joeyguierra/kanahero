// Shared by e2e-loop and e2e-offline: serve `out/`, and drive one item of the
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

export const row = (page, name, tag) =>
  page.locator(`.v7SetRow:has(.v7SetName:text-matches("^${name} ${tag}$"))`);

export const counts = (page, name, tag) => row(page, name, tag).locator(".v7SetCounts").innerText();

export async function draw(page) {
  const box = await page.locator("canvas.ink").boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
  await page.mouse.up();
  return box;
}

/**
 * One item: read the prompt, wait for it to melt, write, DONE, grade.
 * Returns what the prompt showed and what the reveal said the word was.
 */
export async function readPrompt(page) {
  await page.waitForSelector(".v7Prompt");
  return {
    trial: (await page.locator(".v7TrialForm").count()) > 0,
    prompt: (await page.locator(".v7Prompt").innerText()).trim(),
    head: (await page.locator(".v7Head").innerText()).replace(/\s+/g, " ").trim(),
  };
}

/** `shown`: a prompt already read with readPrompt, when the caller looked first */
export async function playItem(page, ok = true, shown = null) {
  const { trial, prompt, head } = shown ?? (await readPrompt(page));
  await page.waitForSelector("canvas.ink");
  const board = await draw(page);
  await page.click("button:has-text('DONE')");
  await page.waitForSelector(".wordReveal");
  const word = (await page.locator(".v7AnswerWord").innerText()).trim();
  const revealBoard = await page.locator("canvas.ink").boundingBox();
  await page.click(`button:has-text('${ok ? "GOT IT" : "MISSED"}')`);
  return { trial, prompt, head, word, board, revealBoard };
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
