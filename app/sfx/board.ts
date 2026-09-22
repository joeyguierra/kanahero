// The sound board's own player. Internal to /sfx — not part of the app.
//
// WHY NOT lib/sfx.ts: that module is the product's shipping path and its FILES
// table is deliberately closed — six names, six baked files, nothing else can
// be asked for. The board has the opposite job. It must be able to ask for a
// cue that does not exist yet, say so out loud, and start sounding the moment
// the file lands in public/sfx/ with no code change. So it probes the export
// for whatever is there and decodes what it finds.
//
// It still plays through lib/audio.ts, and that is the point: the same one
// AudioContext, the same master gain, the same silent-switch behaviour the
// player gets. A board with its own context would be auditioning a mix nobody
// will ever hear.
//
// Everything here is best-effort and silent on failure. A missing file is the
// normal state of half this table while the pack is still being generated;
// it is reported, never thrown.

import { audio } from "@/lib/audio";

/** the round-robin suffixes build-sfx.mjs can emit: `<name>.m4a`, `<name>.2.m4a` */
const SUFFIXES = ["", ".1", ".2", ".3", ".4"];

/** what the board knows about one baked name */
export interface Baked {
  /** every file found for it, in round-robin order */
  urls: string[];
  /** decoded, in the same order; a null is a file that would not decode */
  buffers: (AudioBuffer | null)[];
}

const baked = new Map<string, Baked>();
const cursor = new Map<string, number>();
const measured = new Map<string, Measured>();

/** what the file on disk actually turned out to be, read off the decoded
    buffer — the length after the trim and the peak after AAC, which is the
    pair the bake's own report warns about when it will not converge */
export interface Measured {
  ms: number;
  peakDb: number;
  files: number;
}

/** ± playbackRate on every play, as lib/sfx.ts does it — one file played
    twenty times identically is the fatigue failure (§3) */
const JITTER = 0.03;

export type Availability = "ready" | "missing";

/**
 * Ask the export which of these names actually have files, without needing an
 * AudioContext — so the table can show its status dots before anything is
 * armed. HEAD only; nothing is decoded here.
 */
export async function probe(names: string[]): Promise<Record<string, string[]>> {
  const found: Record<string, string[]> = {};
  await Promise.all(
    names.map(async (name) => {
      const urls: string[] = [];
      for (const suffix of SUFFIXES) {
        const url = `/sfx/${name}${suffix}.m4a`;
        try {
          const res = await fetch(url, { method: "HEAD", cache: "no-store" });
          if (res.ok) urls.push(url);
        } catch {
          // offline, or the host answers HEAD with a redirect to the shell —
          // either way that name counts as not there
        }
      }
      found[name] = urls;
      const entry = baked.get(name);
      const same = entry?.urls.join() === urls.join();
      if (!same) measured.delete(name);
      baked.set(name, { urls, buffers: same ? entry.buffers : [] });
    }),
  );
  return found;
}

/**
 * Decode everything probe() found. Must be called from inside a gesture the
 * first time — it is what opens the context. Resolves when every file has been
 * through the decoder one way or the other.
 */
export async function arm(): Promise<boolean> {
  const a = audio("sfx");
  if (!a) return false;
  await Promise.all(
    [...baked.entries()].map(async ([name, entry]) => {
      if (entry.buffers.length === entry.urls.length) return;
      const buffers = await Promise.all(
        entry.urls.map(async (url) => {
          try {
            return await a.ctx.decodeAudioData(await (await fetch(url, { cache: "no-store" })).arrayBuffer());
          } catch {
            return null;
          }
        }),
      );
      baked.set(name, { urls: entry.urls, buffers });
      measured.delete(name);
    }),
  );
  return true;
}

/** peak of the loudest variant, and the length of the first — a set of
    round-robin variants is supposed to be the same sound, so one number for
    the set is the honest summary and a wide spread is itself the finding */
function take(entry: Baked): Measured | null {
  const buffers = entry.buffers.filter((b): b is AudioBuffer => !!b);
  if (!buffers.length) return null;
  let peak = 0;
  for (const buffer of buffers) {
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i]);
        if (v > peak) peak = v;
      }
    }
  }
  return {
    ms: Math.round(buffers[0].duration * 1000),
    peakDb: Math.round(20 * Math.log10(peak || 1e-6) * 10) / 10,
    files: buffers.length,
  };
}

/** everything decoded so far, measured once and remembered */
export function stats(): Record<string, Measured> {
  const out: Record<string, Measured> = {};
  for (const [name, entry] of baked) {
    const known = measured.get(name);
    const seen = known ?? take(entry);
    if (!seen) continue;
    if (!known) measured.set(name, seen);
    out[name] = seen;
  }
  return out;
}

export function has(name: string): boolean {
  return (baked.get(name)?.urls.length ?? 0) > 0;
}

/** how many files this name has, for the variant readout */
export function variants(name: string): number {
  return baked.get(name)?.urls.length ?? 0;
}

/** the buffer for this play, cycling the variants */
function next(name: string): AudioBuffer | null {
  const entry = baked.get(name);
  if (!entry || !entry.urls.length) return null;
  const i = (cursor.get(name) ?? 0) % entry.urls.length;
  cursor.set(name, i + 1);
  return entry.buffers[i] ?? null;
}

export interface FireOpts {
  /** playbackRate, before jitter — how the derived cues are made (ink.undo is
      ink.clear at 1.4, ui.select is ui.nav at 1.12) */
  rate?: number;
  /** trim, in dB, relative to the baked level — LEAVE RUN is reveal.skip at −6 */
  gainDb?: number;
  /** seconds from now on the audio clock; 0 is "as soon as the node starts" */
  at?: number;
  /** no ±3 % wobble — for A/Bing two bakes against each other */
  exact?: boolean;
}

/**
 * One cue, now or at an offset on the audio clock. Returns false when nothing
 * sounded — no file, not armed, sound switched off — which is what the board
 * prints in the log instead of leaving you tapping a dead button.
 */
export function fire(name: string, opts: FireOpts = {}, retry = true): boolean {
  const a = audio("sfx");
  if (!a) return false;
  const buffer = next(name);
  if (!buffer) {
    // there IS a file, it is simply not decoded yet — the first tap on the
    // page is the tap that opens the context, and it would otherwise be the
    // one tap that makes no sound. Decode, then play it a beat late.
    if (retry && (baked.get(name)?.urls.length ?? 0) > 0) {
      void arm().then(() => fire(name, opts, false));
      return true;
    }
    return false;
  }

  const node = a.ctx.createBufferSource();
  node.buffer = buffer;
  const wobble = opts.exact ? 1 : 1 + (Math.random() * 2 - 1) * JITTER;
  node.playbackRate.value = (opts.rate ?? 1) * wobble;

  if (opts.gainDb) {
    const gain = a.ctx.createGain();
    gain.gain.value = Math.pow(10, opts.gainDb / 20);
    node.connect(gain).connect(a.out);
  } else {
    node.connect(a.out);
  }

  node.start(a.ctx.currentTime + Math.max(0, opts.at ?? 0));
  return true;
}

/** one cue in a laid-out sequence */
export interface BoardCue extends FireOpts {
  name: string;
  /** ms from the start of the sequence */
  ms: number;
}

/**
 * A whole sequence against the audio clock, the way Result.tsx lays the reveal
 * out — not setTimeout, which jitters under render load at the 90 ms spacing
 * the deal uses. Returns what sounded and what did not, so the board can log
 * the holes.
 */
export function sequence(cues: BoardCue[]): { name: string; sounded: boolean }[] {
  return cues.map((cue) => ({
    name: cue.name,
    sounded: fire(cue.name, { ...cue, at: cue.ms / 1000 }),
  }));
}

// ---- the bed ------------------------------------------------------------

export interface Bed {
  /** pointer speed in px/ms — the same quantity WritingCanvas's segmentWidth
      already computes, so the two never drift (sfx-defaults, tier 1) */
  speed(pxPerMs: number): void;
  stop(): void;
}

/** silent at rest, full at ~600 px/s = 0.6 px/ms (inventory, ink.loop) */
const FULL_SPEED = 0.6;
/** the bed's own range under its baked peak: −26 at a crawl, −20 flat out */
const BED_FLOOR_DB = -6;
/** how far the rate rides with the hand — any more and it reads as a tape */
const BED_RATE = 0.18;
/** §0's fade, both ends: shorter clicks, longer smears the attack */
const FADE = 0.008;

/**
 * The one continuous sound in the app: start it on pointerdown, feed it the
 * pointer speed, stop it on lift. Null when there is no file or no context,
 * so the rig can say so rather than looking broken.
 */
export function bed(name: string): Bed | null {
  const a = audio("sfx");
  if (!a) return null;
  const buffer = next(name);
  if (!buffer) return null;

  const node = a.ctx.createBufferSource();
  node.buffer = buffer;
  node.loop = true;
  const gain = a.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, a.ctx.currentTime);
  node.connect(gain).connect(a.out);
  node.start();

  let stopped = false;
  return {
    speed(pxPerMs: number) {
      if (stopped) return;
      const t = Math.min(1, Math.max(0, pxPerMs / FULL_SPEED));
      // dB, not linear: a linear ramp on a bed reads as a fader being pushed
      const db = BED_FLOOR_DB * (1 - t);
      gain.gain.setTargetAtTime(Math.pow(10, db / 20) * t, a.ctx.currentTime, 0.02);
      node.playbackRate.setTargetAtTime(1 - BED_RATE / 2 + BED_RATE * t, a.ctx.currentTime, 0.05);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      const end = a.ctx.currentTime + FADE;
      gain.gain.cancelScheduledValues(a.ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, a.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, end);
      node.stop(end + 0.01);
    },
  };
}
