// The one AudioContext, and the gate in front of it.
//
// Everything that makes a sound goes through here: lib/sfx.ts (the seven
// one-shots) and lib/joker-voice.ts (the synthesized blip). Two contexts would
// mean two sets of hardware buffers, two unlock states, and two things to mute.
//
// Silent-first is law, not a preference (SPEC-v5d-sound.md §0.1). This app's
// real runtime is an overnight coach with everyone asleep, a quiet car, and a
// shop counter. So:
//
//   - Two channels — his voice, the table's one-shots — each with its own
//     switch, and every entry point here no-ops for a channel that is off.
//     SILENT MODE is both off at once. Nothing in the app is ever sound-only.
//     (Both start ON: a creator call on 2026-09-20 over §0.1's default-off.)
//   - No context is constructed until sound is switched on. A suspended
//     AudioContext still costs a hardware audio session on some platforms, and
//     a drill app has no business claiming one it will not use.
//   - iOS mutes Web Audio on the hardware ringer switch unless the page says
//     otherwise. We deliberately do NOT say otherwise: `transient` is the type
//     meant for notification-style sounds, and a drill app that overrides
//     someone's silent switch on a night bus is exactly the wrong behaviour.
//
// Shape follows HandTick.tsx: exported functions, capability checks inline,
// and a graceful no-op whenever the platform or the user says no.

import { AUDIO_DEFAULT, isSilent, type AudioPrefs } from "./progress";

type Ctx = AudioContext & { resume(): Promise<void> };

/** what asks to sound: his voice, or the table */
export type Channel = "voice" | "sfx";

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let prefs: AudioPrefs = AUDIO_DEFAULT;

/** The switches, as stored. Silent tears nothing down — the context is cheap
    to keep once it exists, and rebuilding it would cost the unlock again —
    but it does take the master gain to zero, so a reveal already scheduled
    on the audio clock goes quiet with everything else. */
export function setAudioPrefs(next: AudioPrefs): void {
  prefs = next;
  if (master) master.gain.value = isSilent(next) ? 0 : 1;
}

/** may this channel sound right now? */
export function canSound(channel: Channel): boolean {
  return prefs[channel];
}

/**
 * The live context, or null when there is nothing to play into.
 *
 * MUST be called from inside a user gesture the first time: browsers create
 * the context suspended and only a real tap resumes it. Every caller in this
 * app is already gesture-driven (a GOT IT, a tap, a typed line that a tap
 * started), so there is no separate unlock step to build.
 */
export function audio(channel?: Channel): { ctx: Ctx; out: GainNode } | null {
  if (channel ? !canSound(channel) : isSilent(prefs)) return null;
  if (typeof window === "undefined") return null;

  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;

    // `transient` = a notification-style sound that sits on top of whatever
    // else is playing, and that the ringer switch is allowed to silence.
    // Never `playback`: that is the setting that overrides the silent switch.
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) {
      try {
        session.type = "transient";
      } catch {
        // not supported here; the ringer switch behaviour is the platform's
      }
    }

    try {
      ctx = new AC() as Ctx;
    } catch {
      return null; // no audio on this device; the app is unchanged
    }
    master = ctx.createGain();
    master.gain.value = isSilent(prefs) ? 0 : 1;
    master.connect(ctx.destination);
  }

  // outside a gesture this can stay pending or reject, depending on the
  // browser; either way the next call inside one resumes it, so it is not an
  // error and must not surface as one
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return master ? { ctx, out: master } : null;
}
