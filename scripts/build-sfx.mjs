// Bakes the raw ElevenLabs generations in sfx-src/ into shippable one-shots in
// public/sfx/. Run: npm run sfx
//
// Why this is a script and not a folder of hand-trimmed files:
//
//   A UI one-shot is defined by numbers — where the transient starts, how long
//   the tail is allowed to be, how loud it sits against its siblings. Those
//   numbers are design decisions (SPEC-v5d-sound.md §1), and a decision that
//   lives in someone's memory of what they did in Audacity is a decision that
//   drifts the next time a sound is regenerated. Here the table below IS the
//   decision, and re-running is free.
//
//   The three flip sounds are the reason this matters. worn -> base -> shiny is
//   one family climbing, and the climb only reads if the three are treated
//   identically apart from the numbers that are meant to differ. Trimmed by
//   hand on three different evenings, they drift apart and the ladder dies.
//
// SOURCES ARE COMMITTED, and that is deliberate. scripts/fetch-strokes.mjs can
// re-fetch because KanjiVG is canonical and stable. This cannot: ElevenLabs is
// stochastic, so a generation that is lost is lost forever — the same prompt
// returns a different sound. sfx-src/ is therefore source code, not a build
// artifact, and `npm run sfx` must be reproducible from it alone.
//
// Naming: `<name>.<ext>`, or `<name>.<n>.<ext>` for round-robin variants. The
// config is looked up by `<name>`, so hand.tick.1 / .2 / .3 all get identical
// treatment and stay a set. Hyphens are accepted everywhere a dot is and
// normalised away, because that is how the files come off the ElevenLabs
// download (hand-tick.mp3), and renaming seven downloads by hand every
// regeneration is exactly the manual step this script exists to delete. The
// OUTPUT is always canonical: hand-tick.mp3 -> hand.tick.m4a.
//
// TUNING: the numbers below are DEFAULTS. `sfx-src/sfx.config.json`, written by
// the sound lab (`npm run sfx:lab`), overrides them per sound — that file is the
// record of what was decided by ear, and it is committed. Tune in the lab, bake
// here; never hand-edit a trim into existence twice.
//
// Requires ffmpeg + ffprobe on PATH (`brew install ffmpeg`), or ffmpeg-static
// as a devDependency — set FFMPEG / FFPROBE to override.

import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { DEFAULTS } from "./sfx-defaults.mjs";

const run = promisify(execFile);
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FFPROBE = process.env.FFPROBE || "ffprobe";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, "sfx-src");
const DEST = path.join(ROOT, "public", "sfx");
const CONFIG = path.join(SRC, "sfx.config.json");

/** ms of fade at the tail — below this a hard cut clicks */
const FADE_MS = 8;
/** AAC: universally decodable by Web Audio, unlike Opus in WebM on Safari.
    128k mono is well past transparent for a 100ms one-shot and costs ~1KB more
    per file than 96k — but it roughly halves the codec's peak overshoot (see
    the correction pass below), which is worth more than the kilobyte. */
const BITRATE = "128k";
/** how close to the target peak is close enough, in dB. Below ~1dB is
    inaudible on a one-shot, and the rarity ladder is 3-9dB apart, so this is
    comfortably tight enough to keep the ladder honest. */
const PEAK_TOLERANCE = 0.5;
/** correction passes before giving up and warning. Lossy peak is not perfectly
    steerable — each re-encode changes the encoder's own decisions slightly —
    so this converges rather than solves. Three is plenty; a warning after
    three means something is genuinely odd with that source. */
const MAX_PASSES = 3;


const AUDIO_EXT = new Set([".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg", ".opus"]);

/** the lab's decisions, laid over the defaults. Only the keys it names move. */
const tuned = await readFile(CONFIG, "utf8")
  .then((t) => JSON.parse(t))
  .catch(() => ({}));

const SOUNDS = {};
for (const [key, base] of Object.entries(DEFAULTS)) SOUNDS[key] = { ...base, ...(tuned[key] ?? {}) };
// a sound the lab knows about but the defaults do not still bakes
for (const [key, extra] of Object.entries(tuned)) if (!SOUNDS[key]) SOUNDS[key] = { ...extra };

/** did this value come from the lab rather than the table? */
const isTuned = (key) => Object.prototype.hasOwnProperty.call(tuned, key);

/** the canonical, dotted stem: "flip-worn-2.mp3" and "flip.worn.2.mp3" both
    become "flip.worn.2", and "flip-worn.mp3" becomes "flip.worn" */
function stem(file) {
  return file.slice(0, file.lastIndexOf(".")).replace(/-/g, ".");
}

/** the SOUNDS key for a file: the stem with any round-robin index removed */
function configKey(file) {
  const bare = stem(file);
  const trailing = bare.slice(bare.lastIndexOf(".") + 1);
  return /^\d+$/.test(trailing) ? bare.slice(0, bare.lastIndexOf(".")) : bare;
}

async function ffmpeg(args) {
  // ffmpeg writes its report to stderr even on success
  const { stderr } = await run(FFMPEG, ["-hide_banner", "-nostdin", ...args], {
    maxBuffer: 1 << 24,
  });
  return stderr;
}

/**
 * Peak level in dBFS, optionally through a filter chain first.
 *
 * Deliberately NOT loudnorm/EBU R128: that is a ~3s-window measurement and is
 * meaningless on a 90ms transient. What matters for a one-shot is how hard it
 * hits, which is peak.
 */
async function peakOf(input, filters) {
  const chain = filters ? `${filters},volumedetect` : "volumedetect";
  const out = await ffmpeg(["-i", input, "-af", chain, "-f", "null", "-"]);
  const found = out.match(/max_volume:\s*(-?\d+(?:\.\d+)?) dB/);
  if (!found) throw new Error(`no max_volume for ${path.basename(input)}`);
  return Number(found[1]);
}

async function durationMs(file) {
  const { stdout } = await run(FFPROBE, [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    file,
  ]);
  return Math.round(Number(stdout.trim()) * 1000);
}

function trimChain({ ms, head, loop }) {
  // A bed is used whole: no head strip (its start is a loop point, not a
  // transient), no cap, and above all no fade — an 8ms fade at the end of a
  // loop is a hole punched in it once per cycle.
  if (loop) return "anull";
  const seconds = ms / 1000;
  const fade = Math.max(0, seconds - FADE_MS / 1000);
  // head first (so the transient sits at sample 0 — perceived latency runs from
  // the start of the FILE, not from the peak), then the hard cap, then the fade
  const strip =
    head === undefined
      ? "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0"
      : `atrim=start=${head / 1000},asetpts=PTS-STARTPTS`;
  return `${strip},atrim=end=${seconds},asetpts=PTS-STARTPTS,afade=t=out:st=${fade}:d=${FADE_MS / 1000}`;
}

async function encode(input, output, chain, gainDb) {
  await ffmpeg([
    "-y", "-i", input,
    "-af", `${chain},volume=${gainDb.toFixed(2)}dB`,
    "-ac", "1", "-ar", "48000",
    "-c:a", "aac", "-b:a", BITRATE,
    "-movflags", "+faststart",
    output,
  ]);
}

const files = (await readdir(SRC).catch(() => {
  throw new Error("no sfx-src/ — put the raw ElevenLabs downloads there first");
}))
  .filter((f) => !f.startsWith(".") && AUDIO_EXT.has(path.extname(f).toLowerCase()))
  .sort();

if (files.length === 0) throw new Error("sfx-src/ has no audio in it");

await mkdir(DEST, { recursive: true });

const rows = [];
const unknown = [];

for (const file of files) {
  const key = configKey(file);
  const config = SOUNDS[key];
  if (!config) {
    unknown.push(file);
    continue;
  }

  const input = path.join(SRC, file);
  const name = stem(file);
  const output = path.join(DEST, `${name}.m4a`);
  const chain = trimChain(config);

  // First guess: measure the trimmed source, apply the gain that should land
  // it on target. Cannot be one pass — the gain depends on the measurement.
  let gain = config.peak - (await peakOf(input, chain));
  await encode(input, output, chain, gain);
  let peak = await peakOf(output);

  // Then converge. AAC is lossy, and a lossy codec RECONSTRUCTS the waveform
  // rather than reproducing it — so the decoded peak is not the peak that went
  // in. Measured here: a tone landing at exactly -18.0 dBFS pre-encode came
  // back at -14.8 after AAC 96k. That is not rounding, it is the codec, and it
  // is worst on sharp transients at low bitrates, which is precisely this
  // material. Left uncorrected it would quietly flatten the worn/base/shiny
  // ladder — the one thing the levels exist to create.
  //
  // Each re-encode nudges the encoder's own decisions, so this converges
  // instead of solving. Encoding a 100ms file three times costs nothing.
  let passes = 1;
  while (Math.abs(config.peak - peak) > PEAK_TOLERANCE && passes < MAX_PASSES) {
    gain += config.peak - peak;
    await encode(input, output, chain, gain);
    peak = await peakOf(output);
    passes += 1;
  }

  const [{ size }, ms] = await Promise.all([stat(output), durationMs(output)]);
  rows.push({ name, ms, cap: config.ms, peak, target: config.peak, size, passes, tuned: isTuned(key), loop: !!config.loop });
}

const pad = (s, n) => String(s).padEnd(n);
const total = rows.reduce((a, r) => a + r.size, 0);

console.log(`\nsfx: ${rows.length} baked -> public/sfx/\n`);
console.log(`  ${pad("file", 22)}${pad("ms", 12)}${pad("peak", 20)}${pad("passes", 8)}bytes`);
for (const r of rows) {
  // hitting the cap exactly means it was truncated, which is the intended
  // behaviour — a shorter file just means the source was shorter
  const at = r.loop ? " (loop)" : r.ms >= r.cap ? " (cap)" : "";
  const off = Math.abs(r.peak - r.target) > PEAK_TOLERANCE ? " ⚠" : "";
  const peak = `${r.peak} / ${r.target} dB${off}`;
  console.log(
    `  ${pad(r.name + (r.tuned ? " *" : ""), 22)}${pad(r.ms + at, 12)}${pad(peak, 20)}${pad(r.passes, 8)}${r.size.toLocaleString()}`,
  );
}
console.log(`\n  total ${(total / 1024).toFixed(1)} KB`);
if (rows.some((r) => r.tuned)) console.log("  * = tuned in the lab (sfx-src/sfx.config.json)");
if (rows.some((r) => Math.abs(r.peak - r.target) > PEAK_TOLERANCE)) {
  console.log("  ⚠ = peak did not converge in " + MAX_PASSES + " passes; listen before shipping");
}

const have = new Set(rows.map((r) => configKey(`${r.name}.x`)));
// "foil" was renamed to "shiny" in SPEC-v5a §7 and verified gone in v5c; a
// source file that still says foil quietly reintroduces the old word
const foil = unknown.filter((f) => /foil/i.test(f));
const missing = Object.keys(SOUNDS).filter((k) => !have.has(k));
if (missing.length) console.log(`\n  not yet generated: ${missing.join(", ")}`);
if (unknown.length) console.log(`\n  ⚠ no config, skipped: ${unknown.join(", ")}`);
if (foil.length) {
  console.log("    ↳ \"foil\" was renamed to \"shiny\" (SPEC-v5a §7) — rename to flip-shiny");
}
console.log();
