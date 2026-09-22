// The v5d sound inventory, as data. Internal to /sfx.
//
// This is a transcription of docs/design/v5/KanaHero v5d Sound Inventory.dc.html
// — 28 cues in 21 files over four tiers — kept here rather than derived from
// scripts/sfx-defaults.mjs because the two answer different questions. The
// defaults table says how a file is BAKED (cap, peak, head trim); this says
// what a cue IS: where it fires, what it is made of, which other cue it is a
// replay of, and what it is standing in for while it does not exist yet.
//
// Where the inventory and a later decision disagree, the later decision wins
// and the row says so in `amended` — the doc is dated 2026-09-19 and the ink
// pass moved under it.
//
// Adding a cue: add a row. A row whose `file` has no bytes in public/sfx/ shows
// as NOT BAKED and its buttons report the hole instead of doing nothing, which
// is the whole reason this page exists.

export type Tier = 0 | 1 | 2 | 3;

/** the five materials of the map — who touches it decides which it is */
export type Material = "cardstock" | "ink" | "brush" | "felt" | "metal" | "synth";

/** which in-context rig fires this cue the way the app does */
export type Rig = "ink" | "talk" | "deal" | "reveal" | "chrome";

export interface Cue {
  /** what the app calls it */
  name: string;
  /** the baked name under public/sfx/ — several cues can share one file */
  file: string;
  tier: Tier;
  material: Material;
  /** the cap and the level, as the inventory writes them */
  spec: string;
  /** the same cap as a number, where there is one — the board compares it
      against what the file actually measured after the bake. Left off the
      derived cues, which measure their parent's file. */
  capMs?: number;
  /** the target peak in dBFS, same purpose */
  peakDb?: number;
  /** ms until the NEXT instance of this cue can fire, where it can overlap
      itself at all — a baked file longer than its own gap smears into its
      successor, which is the one defect you cannot hear on a single PLAY */
  gapMs?: number;
  /** where it fires, in the app's own terms */
  where: string;
  /** the design note, shortened to what you need with your finger on the button */
  note: string;
  /** set when this cue is another cue replayed: the rate it is replayed at */
  rate?: number;
  /** set when this cue is another cue trimmed: dB against the baked level */
  gainDb?: number;
  /** a bed, not a one-shot — the rig owns it, the row cannot fire it alone */
  loop?: boolean;
  /** synthesized at runtime, so it has no file and is never missing */
  synth?: boolean;
  /** held out of the build on purpose; build it only if the beat needs it */
  held?: boolean;
  /** a later call that overrides the inventory's line */
  amended?: string;
  rig?: Rig;
}

export const TIERS: { id: Tier; label: string; blurb: string; accent: string }[] = [
  {
    id: 0,
    label: "TIER 0",
    blurb: "Already specced — the seven in SPEC-v5d §1. Baked, confirmed, no changes.",
    accent: "var(--live)",
  },
  {
    id: 1,
    label: "TIER 1",
    blurb: "The loop — fires every word, 9–21× a run. This is what the app sounds like.",
    accent: "var(--strike)",
  },
  {
    id: 2,
    label: "TIER 2",
    blurb: "Deals and arrivals — once per run, the beats between screens.",
    accent: "var(--caution)",
  },
  {
    id: 3,
    label: "TIER 3",
    blurb: "Chrome — by category, never by button.",
    accent: "var(--rail)",
  },
];

export const CUES: Cue[] = [
  // ---- tier 0 · the reveal and the tick ----------------------------------
  {
    name: "hand.tick",
    file: "hand.tick",
    tier: 0,
    material: "cardstock",
    spec: "≤180 ms · −12 dBFS",
    capMs: 180,
    peakDb: -12,
    where: "GOT IT · Round.tsx · 420 ms after the grade, under the next melt",
    note: "The item-get. Lands inside the next melt and possibly under the player's own ink — at −12 it is rightly the loudest thing in that window, and it is never ducked.",
    rig: "ink",
  },
  {
    name: "flip.worn",
    file: "flip.worn",
    tier: 0,
    material: "cardstock",
    spec: "≤75 ms · −18 dBFS · gap 114 ms",
    capMs: 75,
    peakDb: -18,
    gapMs: 114,
    where: "S8 · a worn card turning",
    note: "The quietest thing in the app, and the bottom of the one climbing family. Also the first thing to try for deal.land — same material, near-identical action.",
    rig: "reveal",
  },
  {
    name: "flip.base",
    file: "flip.base",
    tier: 0,
    material: "cardstock",
    spec: "≤95 ms · −15 dBFS · gap 114 ms",
    capMs: 95,
    peakDb: -15,
    gapMs: 114,
    where: "S8 · a base card turning",
    note: "The middle of the climb. worn → base → shiny only reads if the three are treated identically apart from the numbers meant to differ.",
    rig: "reveal",
  },
  {
    name: "flip.shiny",
    file: "flip.shiny",
    tier: 0,
    material: "metal",
    spec: "≤280 ms · −9 dBFS · >8 kHz",
    capMs: 280,
    peakDb: -9,
    gapMs: 320,
    where: "S8 · a shiny turning",
    note: "The only thing in the app that rings, because it is the only thing that glows. Nothing else goes above −12 and nothing else lives above 8 kHz.",
    rig: "reveal",
  },
  {
    name: "reveal.shinyHold",
    file: "reveal.shinyHold",
    tier: 0,
    material: "cardstock",
    spec: "≤450 ms · −15 dBFS",
    capMs: 450,
    peakDb: -15,
    where: "S8 · the 450 ms beat before every shiny turns",
    note: "The anticipation. Specced in §1 and not yet baked — until it is, that beat is silence, which is a defensible reading of it.",
    rig: "reveal",
  },
  {
    name: "reveal.end",
    file: "reveal.end",
    tier: 0,
    material: "cardstock",
    spec: "≤700 ms · −12 dBFS · 200–500 Hz",
    capMs: 700,
    peakDb: -12,
    where: "S8 · the last card down, the moment he speaks",
    note: "The fanfare, with no melody: one deck squared. Twin to deal.press at the other end of the run — the same deck heard opening and closing, and they must not be the same recording.",
    rig: "reveal",
  },
  {
    name: "reveal.skip",
    file: "reveal.skip",
    tier: 0,
    material: "cardstock",
    spec: "≤250 ms · −12 dBFS",
    capMs: 250,
    peakDb: -12,
    where: "S8 · a tap through the reveal · Result.tsx hurry()",
    note: "The hand gathered up at once. The riffle that follows is 70 ms a card and stays silent; this one thud is the sound of it.",
    rig: "reveal",
  },

  // ---- tier 1 · the loop --------------------------------------------------
  {
    name: "ink.loop",
    file: "ink.loop",
    tier: 1,
    material: "ink",
    spec: "2 s SEAMLESS LOOP · −26 → −20 dBFS",
    capMs: 2000,
    peakDb: -20,
    where: "pointer held and moving on the canvas · Round.tsx",
    note: "The one continuous sound in the app and the one heard most — this is where the ASMR lives. Gain and playbackRate follow pointer speed: silent at rest, full at ~600 px/s. Generate with ElevenLabs' own loop:true; a loop point crossfaded afterwards always has a seam under a 2 s bed.",
    amended: "2026-09-20 — both hands are brushes now: the player has a small dry one, the Joker a broad wet one. Weight and wetness tell them apart, not instrument.",
    loop: true,
    rig: "ink",
  },
  {
    name: "ink.down",
    file: "ink.down",
    tier: 1,
    material: "ink",
    spec: "≤40 ms · −22 dBFS · RR3 ±3%",
    capMs: 40,
    peakDb: -22,
    where: "pointerdown on the canvas",
    note: "The tip touching paper — the attack the bed has no way to make.",
    rig: "ink",
  },
  {
    name: "ink.up",
    file: "ink.up",
    tier: 1,
    material: "ink",
    spec: "≤30 ms · −26 dBFS",
    capMs: 30,
    peakDb: -26,
    where: "pointerup — the lift",
    note: "The same generation trimmed from the other end. Build it, then A/B against the bed's 8 ms fade alone and cut it if the fade is enough.",
    rig: "ink",
  },
  {
    name: "ink.reveal",
    file: "ink.reveal",
    tier: 1,
    material: "brush",
    spec: "≤250 ms · −16 dBFS",
    capMs: 250,
    peakDb: -16,
    where: "FLIP · Round.tsx write→reveal · his model over your ink",
    note: "One broad wet sweep. The answer is the Joker's and it must not be mistakable for yours — if it is, widen the weight gap, not the level. One swish covers today's one-frame cut; round-robin per stroke only if the model ever draws itself.",
    rig: "ink",
  },
  {
    name: "joker.talk",
    file: "joker.talk",
    tier: 1,
    material: "synth",
    spec: "≤25 ms · −24 dBFS · RR4 ±6%",
    where: "M1 type-on, 22 ms/char · Joker.tsx · every screen",
    note: "The RPG text blip — but not one per character: 45 characters at 22 ms is a rattle. Shipping today as the synthesized square in lib/joker-voice.ts, every 6th voiced character. The inventory's paper click is the alternative: one dry click every third character, a typewriter platen from the next room. The rig below types a real corpus line either way.",
    synth: true,
    rig: "talk",
  },
  {
    name: "hand.miss",
    file: "hand.miss",
    tier: 1,
    material: "cardstock",
    spec: "≤180 ms · −16 dBFS · 300–800 Hz",
    capMs: 180,
    peakDb: -16,
    where: "MISSED · Round.tsx missed() · the word goes back with a gap of 2",
    note: "One card slid back under a deck on felt: dull, no snap, no ring. The exact opposite gesture to hand.tick. Old-school damage, gentled to nothing — his line is already kind and the sound must not undercut it.",
    rig: "ink",
  },
  {
    name: "ink.clear",
    file: "ink.clear",
    tier: 1,
    material: "ink",
    spec: "≤300 ms · −18 dBFS",
    capMs: 300,
    peakDb: -18,
    where: "CLEAR · the canvas wiped",
    note: "A fresh sheet, not an eraser — the ink went and the sheet went with it.",
    rig: "ink",
  },
  {
    name: "ink.undo",
    file: "ink.clear",
    tier: 1,
    material: "ink",
    spec: "≤120 ms · −20 dBFS · ink.clear @ 1.4",
    where: "UNDO · one stroke lifted",
    note: "One generation, two cues: the same file played faster and trimmed. A half-pull rather than a full swap. No second bake.",
    rate: 1.4,
    gainDb: -2,
    rig: "ink",
  },

  // ---- tier 2 · deals and arrivals ---------------------------------------
  {
    name: "deal.press",
    file: "deal.press",
    tier: 2,
    material: "cardstock",
    spec: "≤400 ms · −12 dBFS · 200–500 Hz",
    capMs: 400,
    peakDb: -12,
    where: "DEAL · S6b CTA · the run begins",
    note: "A deck squared and cut once. The level-start, and the bookend to reveal.end. The most important single non-loop sound outside S8.",
    rig: "deal",
  },
  {
    name: "prompt.melt",
    file: "prompt.melt",
    tier: 2,
    material: "cardstock",
    spec: "≤700 ms · −24 dBFS",
    capMs: 700,
    peakDb: -24,
    where: "M5 · every presentation, 900 ms · PromptMelt.tsx",
    note: "The card being made: paper fibre settling, grain draining to silence. Fires 9–21× a run, so it must be felt, not heard. Ducks to nothing while the ink bed is active. If it reads as noise, the answer is silence, not a louder file.",
    rig: "deal",
  },
  {
    name: "deal.land",
    file: "deal.land",
    tier: 2,
    material: "cardstock",
    spec: "≤80 ms · −18 dBFS · RR3 · gap 90 ms",
    capMs: 80,
    peakDb: -18,
    gapMs: 90,
    where: "M4 · S6b mount · 9 backs seat 90 ms apart",
    note: "A card landing flat on felt, and the densest cue in the app — tighter than the reveal's 114 ms. Try flip.worn before generating anything.",
    rig: "deal",
  },
  {
    name: "deal.throw",
    file: "deal.throw",
    tier: 2,
    material: "cardstock",
    spec: "≤70 ms · −24 dBFS",
    capMs: 70,
    peakDb: -24,
    where: "M4 · the flick off his fist, interleaved 90 ms with the lands",
    note: "HELD. From t=420 throws and lands interleave 90 ms apart and this is probably one sound too many. The prompt is written and waiting: build it only if the deal feels weightless without it.",
    held: true,
    rig: "deal",
  },
  {
    name: "reveal.arrive",
    file: "reveal.arrive",
    tier: 2,
    material: "cardstock",
    spec: "≤240 ms · −14 dBFS",
    capMs: 240,
    peakDb: -14,
    where: "M14 · S8 mount · the earned set set down face-down",
    note: "One soft stack placed on the table. Must finish inside LEAD_MS (300) or it eats the first flip — hence 240, not the inventory's 280. The run was just written to disk in this instant; the loudest moment in the app is currently a screen swap.",
    rig: "reveal",
  },

  // ---- tier 3 · chrome ----------------------------------------------------
  {
    name: "ui.nav",
    file: "ui.nav",
    tier: 3,
    material: "cardstock",
    spec: "≤50 ms · −20 dBFS · RR2 ±3% · 300–800 Hz",
    capMs: 50,
    peakDb: -20,
    where: "← back · deck rows · set rows · VIEW COLLECTION → · CREDITS · BACK TO DECK",
    note: "One dry cardstock tap. The cursor sound — and the screen transition too: there is no separate transition cue.",
    rig: "chrome",
  },
  {
    name: "ui.select",
    file: "ui.nav",
    tier: 3,
    material: "cardstock",
    spec: "ui.nav @ 1.12",
    where: "a deck row going live on S1 · a CTA turning strike",
    note: "A state change sits a shade above navigation. No new file.",
    rate: 1.12,
    rig: "chrome",
  },
  {
    name: "ui.primary",
    file: "ui.primary",
    tier: 3,
    material: "felt",
    spec: "≤120 ms · −14 dBFS",
    capMs: 120,
    peakDb: -14,
    where: "START SESSION · KEEP WRITING · the bone and strike CTAs without a cue of their own",
    note: "Felt-covered wood pressed, heavier than nav. The confirm. DEAL and FLIP are excluded — they have deal.press and ink.reveal, because what they confirm is a specific object.",
    rig: "chrome",
  },
  {
    name: "ui.toggle (ON)",
    file: "ui.toggle",
    tier: 3,
    material: "felt",
    spec: "≤60 ms · −16 dBFS",
    capMs: 60,
    peakDb: -16,
    where: "DAKUTEN on · MEANING on · SOUND on",
    note: "A small wooden switch. The sound toggle switching ON is the one cue that must always play — it is how the player learns the channel exists. Fire it inside the same gesture that unlocks the context.",
    rig: "chrome",
  },
  {
    name: "ui.toggle (OFF)",
    file: "ui.toggle",
    tier: 3,
    material: "felt",
    spec: "ui.toggle @ 0.89",
    where: "the same switches, going off",
    note: "One file, two rates. Down is off — the only pitch symbolism in the app, and it is doing the work of a second generation.",
    rate: 0.89,
    rig: "chrome",
  },
  {
    name: "modal.open",
    file: "modal.open",
    tier: 3,
    material: "felt",
    spec: "≤160 ms · −16 dBFS",
    capMs: 160,
    peakDb: -16,
    where: "M8 · the abandon dialog · SETTINGS",
    note: "A felt-muffled thump as the blur comes in.",
    rig: "chrome",
  },
  {
    name: "modal.close",
    file: "modal.close",
    tier: 3,
    material: "felt",
    spec: "≤100 ms · −18 dBFS",
    capMs: 100,
    peakDb: -18,
    where: "✕ · Esc · backdrop · KEEP WRITING · DONE",
    note: "Lighter and shorter than the open. The cancel.",
    rig: "chrome",
  },
  {
    name: "modal.leave",
    file: "reveal.skip",
    tier: 3,
    material: "cardstock",
    spec: "reveal.skip @ −18 dBFS",
    where: "LEAVE RUN · the hand is abandoned",
    note: "Cards gathered up all at once is exactly what happens to the hand. It answers OVL-5 without adding a word the modal already said.",
    gainDb: -6,
    rig: "chrome",
  },
  {
    name: "overlay.lift",
    file: "overlay.lift",
    tier: 3,
    material: "cardstock",
    spec: "≤120 ms · −18 dBFS",
    capMs: 120,
    peakDb: -18,
    where: "OVL-1 · tap a card on S8 after the reveal",
    note: "One card lifted off the table.",
    rig: "chrome",
  },
  {
    name: "overlay.set",
    file: "overlay.set",
    tier: 3,
    material: "cardstock",
    spec: "≤120 ms · −18 dBFS",
    capMs: 120,
    peakDb: -18,
    where: "OVL-1 · tap anywhere to close",
    note: "And set back down. Do not reverse the lift for this — reversed foley reads as reversed.",
    rig: "chrome",
  },
];

/** every distinct baked name the board should probe for */
export const FILES: string[] = [...new Set(CUES.filter((c) => !c.synth).map((c) => c.file))];

/** tier 4 — deliberately silent, listed so nobody builds one by accident */
export const SILENT: { what: string; why: string }[] = [
  { what: "The count pop on S8 (M11)", why: "the flip already is its sound" },
  { what: "The shiny sweep", why: "flip.shiny's ring is the sweep" },
  { what: "The float and bob of seated cards on S6b", why: "nothing is touching them" },
  { what: "Panel entrance, S1 hydration, the 120 ms type-on lead-in", why: "nothing has happened yet" },
  { what: "Screen transitions", why: "ui.nav is the transition" },
  { what: "Error or success chimes", why: "nothing in this app is an error" },
  { what: "Pronunciation, mora audio", why: "backlog, not SFX (§5.4)" },
  { what: "Music", why: "the ink bed is the score" },
];

/** the mix ladder, floor to ceiling — nothing but shiny goes above −12 */
export const LADDER: { db: string; width: number; cues: string; hot?: boolean }[] = [
  { db: "−9", width: 100, cues: "flip.shiny", hot: true },
  { db: "−12", width: 82, cues: "hand.tick · reveal.end · reveal.skip · deal.press" },
  { db: "−14", width: 72, cues: "ui.primary · reveal.arrive" },
  { db: "−15/−16", width: 64, cues: "flip.base · shinyHold · hand.miss · ink.reveal · ui.toggle · modal.open" },
  { db: "−18", width: 54, cues: "flip.worn · deal.land · ink.clear · modal.close · overlay.*" },
  { db: "−20/−22", width: 44, cues: "ui.nav · ink.undo · ink.down" },
  { db: "−24/−26", width: 32, cues: "joker.talk · prompt.melt · ink.loop (floor)" },
];
