// The sound lab: a local page for tuning the trim, and the bridge that lets it
// write what you decide to disk. Run: npm run sfx:lab
//
// WHY A SERVER AND NOT A PAGE IN THE APP
//
//   `next.config.ts` is `output: "export"` and `scripts/gen-sw.mjs` precaches
//   every byte of `out/`. Anything under `app/` or `public/` therefore SHIPS,
//   and gets precached onto a stranger's phone. A tuning rig is not part of the
//   product, so it lives here in scripts/ where the export cannot see it —
//   same reasoning that keeps e2e and the icon generator out of the bundle.
//
//   A server also buys the two things a file:// page cannot do: read sfx-src/
//   on its own, and write the decision back down.
//
// THE DIVISION OF LABOUR, which is the whole point:
//
//   The BROWSER decides. It decodes, draws, plays, and lets you move the cap,
//   the target peak and the head trim by ear against the real reveal cadence.
//   FFMPEG renders. It does the actual trim and the AAC encode with the
//   measure-correct-remeasure pass, because a lossy codec moves the peak by up
//   to 3dB and float samples in a tab cannot tell you that.
//
//   So the page never writes audio. It writes `sfx-src/sfx.config.json`, then
//   asks this server to run the real bake, then plays the REAL .m4a back so
//   what you approve is what ships.
//
// Binds to 127.0.0.1 only. No dependencies.

import { execFile } from "node:child_process";
import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { promisify } from "node:util";

import { DEFAULTS, TIERS } from "./sfx-defaults.mjs";

const run = promisify(execFile);

const HERE = import.meta.dirname;
const ROOT = path.join(HERE, "..");
const SRC = path.join(ROOT, "sfx-src");
const OUT = path.join(ROOT, "public", "sfx");
const CONFIG = path.join(SRC, "sfx.config.json");
const PAGE = path.join(HERE, "sfx-lab.html");

const PORT = Number(process.env.PORT) || 4321;
const AUDIO = new Set([".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg", ".opus"]);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".ogg": "audio/ogg",
  ".opus": "audio/ogg",
};

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": TYPES[".json"], "cache-control": "no-store" });
  res.end(JSON.stringify(body));
};

/** never serve outside the folder we meant — the name is one path segment */
function safeJoin(dir, name) {
  const resolved = path.resolve(dir, name);
  if (resolved !== path.join(dir, path.basename(name))) return null;
  return resolved;
}

async function listDir(dir) {
  try {
    const names = await readdir(dir);
    return names.filter((n) => !n.startsWith(".") && AUDIO.has(path.extname(n).toLowerCase())).sort();
  } catch {
    return [];
  }
}

async function readConfig() {
  try {
    return JSON.parse(await readFile(CONFIG, "utf8"));
  } catch {
    return {};
  }
}

async function serveFile(res, file, type) {
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}

function body(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) reject(new Error("too big"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  const route = url.pathname;

  try {
    if (route === "/" || route === "/index.html") {
      return serveFile(res, PAGE, TYPES[".html"]);
    }

    // everything the page needs to draw itself, in one call
    if (route === "/api/list") {
      const [sources, baked, config] = await Promise.all([listDir(SRC), listDir(OUT), readConfig()]);
      const sizes = {};
      for (const f of baked) {
        try {
          sizes[f] = (await stat(path.join(OUT, f))).size;
        } catch {
          /* raced with a bake; it will be there next poll */
        }
      }
      return json(res, 200, { sources, baked, sizes, config, defaults: DEFAULTS, tiers: TIERS });
    }

    if (route.startsWith("/src/")) {
      const file = safeJoin(SRC, decodeURIComponent(route.slice(5)));
      if (!file) return res.writeHead(400).end("bad name");
      return serveFile(res, file, TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
    }

    if (route.startsWith("/out/")) {
      const file = safeJoin(OUT, decodeURIComponent(route.slice(5)));
      if (!file) return res.writeHead(400).end("bad name");
      return serveFile(res, file, TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
    }

    if (route === "/api/config" && req.method === "POST") {
      const next = JSON.parse(await body(req));
      // sorted and pretty, because this file is committed and read by people
      const keys = Object.keys(next).sort();
      const out = {};
      for (const k of keys) out[k] = next[k];
      await writeFile(CONFIG, JSON.stringify(out, null, 2) + "\n");
      return json(res, 200, { ok: true, path: path.relative(ROOT, CONFIG), keys: keys.length });
    }

    // the real thing: ffmpeg, the peak-correction pass, AAC on disk
    if (route === "/api/bake" && req.method === "POST") {
      try {
        const { stdout, stderr } = await run(process.execPath, [path.join(HERE, "build-sfx.mjs")], {
          cwd: ROOT,
          maxBuffer: 1 << 24,
        });
        return json(res, 200, { ok: true, report: (stdout || "") + (stderr || "") });
      } catch (err) {
        return json(res, 200, { ok: false, report: String(err.stderr || err.message || err) });
      }
    }

    res.writeHead(404).end("not found");
  } catch (err) {
    json(res, 500, { ok: false, error: String(err.message || err) });
  }
});

server.listen(PORT, "127.0.0.1", async () => {
  const sources = await listDir(SRC);
  console.log(`\n  sound lab   http://127.0.0.1:${PORT}`);
  console.log(`  sources     sfx-src/ (${sources.length} file${sources.length === 1 ? "" : "s"})`);
  console.log(`  config      ${path.relative(ROOT, CONFIG)}`);
  console.log(`  bakes to    ${path.relative(ROOT, OUT)}/\n`);
  console.log(`  Ctrl-C to stop.\n`);
});
