// The baked one-shots — the imperative shell over lib/audio.ts (SPEC-v5d §3b).
//
// Shape follows HandTick.tsx and lib/audio.ts: exported functions, capability
// checks inline, a graceful no-op whenever sound is off or the platform has no
// audio. Nothing here is ever the signal; every cue doubles a visual that is
// complete without it (§0.1).
//
//   - Web Audio, not <audio>: an element's latency would visibly lag a 240 ms
//     flip. The files decode once, into AudioBuffers, on the first play after
//     sound is switched on — never at boot.
//   - A fresh AudioBufferSourceNode per play. Single-use by design; not pooled.
//   - Round-robin over any `<name>.<n>.m4a` variants, and ±3 % playbackRate
//     jitter on every play (§3): hand.tick fires up to 21 times a run, and one
//     file played 21 times identically is the failure mode.
//   - `schedule()` lays a whole cue list out against the audio clock, which
//     does not jitter the way setTimeout does under render load (§3b).

import { audio } from "./audio";
import type { Cue, SfxName } from "./sfx-schedule";

/** the baked files, by name — add `/sfx/<name>.2.m4a` here when a variant is
    baked and it joins the round-robin with no other change. deal.land is the
    one that most wants variants: it fires nine times in 1.1 s on S6b, tighter
    than anything in the reveal. */
const FILES: Record<SfxName, string[]> = {
  "hand.tick": ["/sfx/hand.tick.m4a"],
  "flip.worn": ["/sfx/flip.worn.m4a"],
  "flip.base": ["/sfx/flip.base.m4a"],
  "flip.shiny": ["/sfx/flip.shiny.m4a"],
  "reveal.end": ["/sfx/reveal.end.m4a"],
  "reveal.skip": ["/sfx/reveal.skip.m4a"],
  "deal.land": ["/sfx/deal.land.m4a"],
  "prompt.melt": ["/sfx/prompt.melt.m4a"],
  "ui.nav": ["/sfx/ui.nav.m4a"],
  "drawer.open": ["/sfx/drawer.open.m4a"],
  "ui.primary": ["/sfx/ui.primary.m4a"],
  "ui.toggle": ["/sfx/ui.toggle.m4a"],
};

/** ui.toggle is one file at two rates: ON at 1.0, OFF at this. Down is off —
    the only pitch symbolism in the app, and it does the work of a second
    generation. Exported so every switch in the app reads the same number. */
export const TOGGLE_OFF = 0.89;

/** ± this much playbackRate on every play, so nothing repeats exactly */
const JITTER = 0.03;

/** decoded once per session; a null entry is a file that failed to decode,
    which plays as silence rather than being retried on every cue */
const buffers = new Map<string, AudioBuffer | null>();
let loading: Promise<void> | null = null;
/** every file has been through the decoder, one way or the other */
let ready = false;
/** the next variant to use, per name */
const cursor = new Map<SfxName, number>();

/** the file for this play, cycling the variants */
function next(name: SfxName): string {
  const files = FILES[name];
  const i = cursor.get(name) ?? 0;
  cursor.set(name, (i + 1) % files.length);
  return files[i];
}

/**
 * Fetch and decode every file, once. Safe to call early — the toggle calls it
 * inside the gesture that turns sound on, so by the first tick the buffers are
 * already there — and safe to call often: the second call is the same promise.
 */
export function preload(): Promise<void> {
  const a = audio("sfx");
  if (!a) return Promise.resolve();
  if (loading) return loading;
  const { ctx } = a;
  loading = Promise.all(
    Object.values(FILES)
      .flat()
      .map(async (url) => {
        try {
          const bytes = await (await fetch(url)).arrayBuffer();
          buffers.set(url, await ctx.decodeAudioData(bytes));
        } catch {
          buffers.set(url, null);
        }
      }),
  ).then(() => {
    ready = true;
  });
  return loading;
}

/** a source for one play, or null when there is nothing to play it into */
function source(url: string): { ctx: AudioContext; node: AudioBufferSourceNode } | null {
  const a = audio("sfx");
  if (!a) return null;
  const buffer = buffers.get(url);
  if (!buffer) return null;
  const node = a.ctx.createBufferSource();
  node.buffer = buffer;
  node.playbackRate.value = 1 + (Math.random() * 2 - 1) * JITTER;
  node.connect(a.out);
  return { ctx: a.ctx, node };
}

/**
 * One sound, now. For the cues that answer a tap — hand.tick, reveal.skip —
 * which fire when the tap fires. Returns a stop, for the rare caller that
 * needs to cut it.
 *
 * `rate` multiplies into the ±3 % jitter rather than replacing it, because a
 * derived cue is still a cue and must not be the one sound in the app that
 * repeats exactly. It exists for ui.toggle, which is one file played up for ON
 * and down for OFF (TOGGLE_OFF).
 */
export function play(name: SfxName, opts?: { rate?: number }): () => void {
  const s = source(next(name));
  if (!s) {
    // first play after switching on: decode now, and this one is missed
    void preload();
    return () => {};
  }
  if (opts?.rate) s.node.playbackRate.value *= opts.rate;
  s.node.start();
  return () => s.node.stop();
}

/**
 * A whole cue list, laid out ahead against the audio clock from the moment of
 * the call. Returns a cancel that drops every cue still to come — the reveal's
 * skip must call it alongside its clearTimeout loop. A cue already sounding
 * plays out: a one-shot cut mid-way is a click, and the thud of the spread
 * landing is the right sound under a snap anyway.
 *
 * If the buffers are still decoding, the schedule waits for them and starts
 * only what is still in the future, against the same origin.
 */
export function schedule(cues: Cue[]): () => void {
  const a = audio("sfx");
  if (!a) return () => {};
  const { ctx } = a;
  const origin = ctx.currentTime;
  // A source started at audio time T is heard at T plus whatever the hardware
  // takes to get it out — 5 ms of buffer on a laptop, a fifth of a second on
  // Bluetooth. A cue laid on the picture's clock arrives that much after the
  // picture, so take it off the top. The whole list shifts together, so the
  // rhythm inside it is untouched, and a cue that would fall in the past is
  // dropped exactly as before rather than bunching up with the next.
  const latency = ctx.outputLatency || ctx.baseLatency || 0;
  const nodes: { node: AudioBufferSourceNode; when: number }[] = [];
  let cancelled = false;

  const arm = () => {
    if (cancelled) return;
    for (const cue of cues) {
      const when = origin + cue.at / 1000 - latency;
      if (when < ctx.currentTime) continue;
      const s = source(next(cue.name));
      if (!s) continue;
      s.node.start(when);
      nodes.push({ node: s.node, when });
    }
  };

  if (ready) arm();
  else void preload().then(arm);

  return () => {
    cancelled = true;
    for (const { node, when } of nodes) {
      if (when <= ctx.currentTime) continue;
      try {
        node.stop();
      } catch {
        // already finished — nothing to drop
      }
    }
    nodes.length = 0;
  };
}
