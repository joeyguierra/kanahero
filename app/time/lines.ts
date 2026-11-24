// The Joker's lines for /time, verbatim from docs/design/time/joker-time-lines.md.
// This page's alone: not in joker/corpus.md, not policed by joker-audit. Each
// was checked by hand against joker-character.md READ FIRST — positive only,
// information first, under twelve words, kana only, never days or amounts.
// A line that claims something about the page goes stale if the page changes;
// the source file marks those with `needs:`.

export type JokerState = "normal" | "entry" | "pre" | "drill" | "saved";

export const LINES: Record<JokerState, readonly string[]> = {
  normal: [
    "A dash means untimed, not zero. ちゃんと かぞえる.",
    "No dash is a zero. A dash is a question. ほらね.",
    "Bars only grow from a stopwatch. I never guess. とうぜん.",
    "Measured means measured. The rest stays a dash. しょうじきに.",
    "Three colors, three parts: check, drill, night sheet.",
    "Tap any dash to time it. どうぞ.",
    "The total says how many parts are untimed. Read both.",
  ],
  entry: [
    "Late night sheet? It counts for the day it started. ね.",
    "Minutes, colon, seconds. Straight off the stopwatch. どうぞ.",
    "Wrong number? Save again. The newest one wins. はい.",
    "No morning items? Say none. None is not a dash.",
    "Clear puts the dash back. Nothing is lost. だいじょうぶ.",
    "Today or yesterday. You pick the date, not the clock.",
  ],
  pre: [
    "Check and morning items, kept apart, drawn as one. べんり.",
    "Two timers, one bar. Tap it and they split. ほら.",
    "Morning items belong to last night's sheet. Drawn here anyway. おっと.",
  ],
  drill: [
    "Drill minutes fill themselves in. Paper parts, type them here. どうぞ.",
    "The app times every drill itself. よゆう.",
    "Two sessions? I add them up. とうぜん.",
    "Drill time is start to finish. A pause counts too.",
    "Old drills are already here. I kept them. さすが おれ.",
  ],
  saved: [
    "Saved to this phone only. Export carries it. はい.",
    "Saved. It never leaves this phone unless you export. やくそく.",
    "One export file carries drills and times together. べんり.",
    "Works with no signal. ちか でも だいじょうぶ.",
  ],
};
