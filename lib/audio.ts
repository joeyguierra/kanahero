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
//   - `enabled` defaults to FALSE and every entry point here no-ops until it
//     is true. Nothing in the app is ever sound-only.
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

type Ctx = AudioContext & { resume(): Promise<void> };

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let enabled = false;

/** Turn sound on or off. Off tears nothing down — the context is cheap to keep
    once it exists, and rebuilding it would cost the unlock again. */
export function setEnabled(on: boolean): void {
  enabled = on;
  if (master) master.gain.value = on ? 1 : 0;
}

export function isEnabled(): boolean {
  return enabled;
}

/**
 * The live context, or null when there is nothing to play into.
 *
 * MUST be called from inside a user gesture the first time: browsers create
 * the context suspended and only a real tap resumes it. Every caller in this
 * app is already gesture-driven (a GOT IT, a tap, a typed line that a tap
 * started), so there is no separate unlock step to build.
 */
export function audio(): { ctx: Ctx; out: GainNode } | null {
  if (!enabled) return null;
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
    master.gain.value = 1;
    master.connect(ctx.destination);
  }

  if (ctx.state === "suspended") void ctx.resume();
  return master ? { ctx, out: master } : null;
}
