"use client";

// Everything the Joker says — the runtime half. The lines themselves live in
// `joker/corpus.md` and in each set's own JSON, and reach this file only
// through `scripts/joker-audit.mjs`, which compiles them into
// `lib/joker-corpus.generated.json` (git-ignored; `npm run joker` rebuilds it).
// Nothing here is hand-edited prose and nothing here decides what is true —
// the audit already silenced anything that is not (SPEC-v5b §2–3).
//
// What this file owns is WHICH line he says, and it owes two things at once:
// never repetitive, and never a surprise. So:
//
//   peekLine(screen, ctx)  pure. Safe during render, idempotent, writes nothing.
//   commitLine(id)         the only writer: spends a `once`, advances the bag.
//   useJokerLine(...)      picks once per beat, commits in an effect.
//
// The split is the old peek/markSeen contract generalized: a line is only
// spent once it has actually been on screen.
//
// Selection, in order (SPEC-v5b §5):
//   1. eligible = the screen's pool ∪ the active set's, filtered by `when`,
//      minus spent `once` lines, minus lines whose tokens have no value
//   2. an eligible `once` line wins outright — the intro, the wipe line, and,
//      where the caller asks for asides, the global and set-scoped ones. When
//      one is due it outranks whatever the screen would have said, which is
//      what makes the S7 order missed → once → earned → round.* fall out of
//      one rule instead of four branches
//   3. else roll rare, 1 in 40
//   4. else draw from the screen's shuffle bag
//
// The bag is the anti-repetition guarantee: an ordered list of ids still to
// come, persisted per screen, so every line is seen before any repeats.

import { useEffect, useRef, useState } from "react";

import corpus from "./joker-corpus.generated.json";
import { mulberry32, newSeed } from "./joker";
import type { SetWord, WordSet } from "./sets";

const SEEN_KEY = "kanahero:v1.joker.seen";
const BAGS_KEY = "kanahero:v1.joker.bags";

/** Spent-once ids retired by a truth fix (SPEC-v5b §1): the line a user was
    shown was false, so the id is dropped and everyone meets the true one once. */
const RETIRED_SEEN = ["kuchi"];
/** ids that changed spelling when the corpus became the source of truth */
const RENAMED_SEEN: Record<string, string> = { wholeWord: "once.wholeWord" };

/** the pool of lines he may say exactly once, ever — not a screen */
const ONCE_POOL = "once";
/** one draw in forty opens the rare tier, when the screen has one to open */
const RARE_ODDS = 40;
/** specificity is the character: a line about THIS set outranks a general one,
    and the bag carries it three times over to make that true in practice */
const SET_WEIGHT = 3;

export type JokerScreen =
  | "home"
  | "home.wiped"
  | "home.hiragana"
  | "home.katakana"
  | "home.kanji"
  | "home.bank"
  | "deck.hiragana"
  | "deck.katakana"
  | "deck.kanji"
  | "drill"
  | "drill.prompt"
  | "bank"
  | "collection"
  | "collection.empty"
  | "abandon"
  | "round.kana"
  | "round.kanji"
  | "round.missed"
  | "reveal.kana"
  | "reveal.kanji"
  | "earned.shiny"
  | "earned.base"
  | "earned.worn"
  | "credits"
  | "set"
  | "result";

/** a compiled line, as the audit emits it */
export interface JokerLine {
  id: string;
  text: string;
  when?: string[];
  once?: boolean;
  tier?: string;
  ja?: string[];
  subj?: string;
  /** set `once` lines only: what has to be on screen for the line to be due */
  trigger?: { wordIncludes?: string };
}

/** what a set may carry under its own `joker` key (SPEC-v5b §4) */
export type SetJoker = Partial<Record<JokerScreen | "once", JokerLine[]>>;

/**
 * Everything a line is allowed to know. A field left undefined is not a zero:
 * a line whose token or condition needs it is simply not eligible, which is
 * how he never says "0 cards earned" on a screen that cannot count them.
 */
export interface JokerContext {
  firstEver?: boolean;
  wiped?: boolean;
  runsFinished?: number;
  shiny?: number;
  base?: number;
  worn?: number;
  /** cards earned in the run just finished — never the drill's characters */
  earned?: number;
  bank?: number;
  /** the active set: gives script, setId, words, and its own lines */
  set?: WordSet;
  /** the word on screen — set asides trigger off it */
  word?: SetWord;
  chars?: number;
  missStreak?: number;
  triesThisWord?: number;
  /**
   * true where an aside from the global `once` pool or the active set may jump
   * the queue — the prompt, and only the prompt. The reveal is not the place
   * for an aside and a miss gets answered, so both leave it off. A once-line
   * belonging to the screen's own pool (the intro, the wipe line) needs no
   * permission: it is that screen's line.
   */
  allowOnce?: boolean;
}

export interface JokerPick {
  id: string;
  text: string;
  /** a once-line, which commit retires rather than advancing a bag */
  once?: boolean;
  /**
   * The bag this draw came out of, already minus this id — commit's whole job
   * is to store it. It travels on the pick rather than being recomputed later
   * because a draw may have refilled the bag, and the refill is shuffled: only
   * the peek that drew knows what came next. (The spec sketches
   * `commitLine(id)`; taking the pick means a line can only be spent by the
   * thing that actually drew it.)
   */
  bag?: { screen: string; ids: string[] };
}

/** nothing yet — the first paint, before storage has been read */
const NO_LINE: JokerPick = { id: "", text: "" };

const POOLS = corpus.pools as Record<string, JokerLine[]>;
const HASH = corpus.hash;

// ---- counting ----

// He counts in words, not digits — the canvas lines do, and the sets are small
// enough that he never runs out.
const WORDS = [
  "No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen", "Twenty", "Twenty-one",
];

const count = (n: number) => WORDS[n] ?? String(n);

// ---- context → the flat variables lines are written against ----

type Vars = Record<string, string | number | boolean | undefined>;

function varsOf(ctx: JokerContext): Vars {
  return {
    firstEver: ctx.firstEver,
    wiped: ctx.wiped,
    runsFinished: ctx.runsFinished,
    shiny: ctx.shiny,
    base: ctx.base,
    worn: ctx.worn,
    earned: ctx.earned,
    bank: ctx.bank,
    script: ctx.set?.script,
    setId: ctx.set?.id,
    words: ctx.set?.words.length,
    chars: ctx.chars,
    missStreak: ctx.missStreak,
    triesThisWord: ctx.triesThisWord,
  };
}

/**
 * The audit's twin of this evaluator lives in `scripts/joker-audit.mjs`, where
 * it proves no reachable context leaves a screen speechless. The two must move
 * together. Grammar: flag, !flag, key=value, key!=value, key>n, key>=n.
 */
function holds(cond: string, vars: Vars): boolean {
  const m = cond.match(/^(!?)([A-Za-z.]+)(?:(>=|!=|>|=)(.+))?$/);
  if (!m) return false;
  const [, not, key, op, rhs] = m;
  const value = vars[key];
  if (!op) return not ? !value : Boolean(value);
  // A comparison against something this screen cannot know is never true —
  // the same rule as an unfillable token. `script!=kanji` must not hold on a
  // screen that has no set in front of it.
  if (value === undefined) return false;
  if (op === "=") return String(value) === rhs;
  if (op === "!=") return String(value) !== rhs;
  return op === ">" ? Number(value) > Number(rhs) : Number(value) >= Number(rhs);
}

/**
 * Fills a line's tokens, or returns null if one of them has no value — an
 * unfillable line is not eligible. Never render a blank, a zero he did not
 * mean, or NaN.
 */
function fill(text: string, vars: Vars, ctx: JokerContext): string | null {
  let missing = false;
  const out = text.replace(/\{([^}]+)\}/g, (_, token: string, at: number) => {
    let n: number | undefined;
    if (token.startsWith("n:")) {
      const mark = token.slice(2);
      n = ctx.set?.words.filter((w) => w.word.includes(mark)).length;
    } else {
      const value = vars[token];
      n = typeof value === "number" ? value : undefined;
    }
    if (n === undefined) {
      missing = true;
      return "";
    }
    // capitalized where a sentence starts, lowercase inside one
    const word = count(n);
    return at === 0 ? word : word.toLowerCase();
  });
  return missing ? null : out;
}

// ---- storage: spent once-lines, and the bags ----

function readSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    const ids = new Set(
      (Array.isArray(list) ? list.filter((s): s is string => typeof s === "string") : []).map(
        (id) => RENAMED_SEEN[id] ?? id,
      ),
    );
    for (const id of RETIRED_SEEN) ids.delete(id);
    return ids;
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Set<string>): void {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
  } catch {
    // no storage — he repeats a once-line one day; not worth failing over
  }
}

type Bags = Record<string, string[]>;

function readBags(): Bags {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BAGS_KEY);
    const blob = raw ? (JSON.parse(raw) as { v?: unknown; bags?: unknown }) : null;
    if (!blob || typeof blob.bags !== "object" || blob.bags === null) return {};
    const bags: Bags = {};
    for (const [screen, ids] of Object.entries(blob.bags as Record<string, unknown>)) {
      if (Array.isArray(ids)) bags[screen] = ids.filter((id): id is string => typeof id === "string");
    }
    return blob.v === HASH ? bags : reconcile(bags);
  } catch {
    // malformed storage is a fresh start, never a throw — like every other
    // reader in this app
    return {};
  }
}

function writeBags(bags: Bags): void {
  try {
    window.localStorage.setItem(BAGS_KEY, JSON.stringify({ v: HASH, bags }));
  } catch {
    // no storage — he draws at random and occasionally repeats himself
  }
}

/**
 * The corpus changed under a live bag. Ids that no longer exist are dropped,
 * and ids that are new go in at the FRONT: after an update the user meets the
 * new lines first, which is the entire visible payoff of shipping them.
 *
 * A set line's id (`<setId>/<name>`) is left alone — it belongs to a file this
 * bundle cannot see — unless it is for a set that no longer exists at all,
 * which it cannot tell from here either. Those are skipped at draw time and
 * cleared on the next refill.
 */
function reconcile(bags: Bags): Bags {
  const out: Bags = {};
  for (const [screen, ids] of Object.entries(bags)) {
    const known = new Set((POOLS[screen] ?? []).map((l) => l.id));
    const kept = ids.filter((id) => known.has(id) || id.includes("/"));
    const fresh = [...known].filter((id) => !ids.includes(id));
    out[screen] = [...fresh, ...kept];
  }
  return out;
}

// ---- the pool for a screen, in this context ----

function poolFor(screen: JokerScreen, ctx: JokerContext): JokerLine[] {
  const set = ctx.set?.joker?.[screen] ?? [];
  return [...(POOLS[screen] ?? []), ...set];
}

/** The once-lines that could be due here: the global pool plus the active
    set's asides, which carry their own trigger. Sitting in a `once` block is
    what makes a set line a once-line — it does not restate the tag. */
function oncePool(ctx: JokerContext): JokerLine[] {
  const asides = (ctx.set?.joker?.once ?? []).map((line) => ({ ...line, once: true as const }));
  return [...(POOLS[ONCE_POOL] ?? []), ...asides];
}

function triggered(line: JokerLine, ctx: JokerContext): boolean {
  const mark = line.trigger?.wordIncludes;
  if (!mark) return true;
  return ctx.word?.word.includes(mark) ?? false;
}

interface Eligible {
  line: JokerLine;
  text: string;
}

function eligible(lines: JokerLine[], ctx: JokerContext, seen: Set<string>): Eligible[] {
  const vars = varsOf(ctx);
  const out: Eligible[] = [];
  for (const line of lines) {
    if (line.once && seen.has(line.id)) continue;
    if (!(line.when ?? []).every((c) => holds(c, vars))) continue;
    if (!triggered(line, ctx)) continue;
    const text = fill(line.text, vars, ctx);
    if (text === null) continue;
    out.push({ line, text });
  }
  return out;
}

/** a bag holding every ship id for the screen, set lines weighted up, shuffled */
function refill(screen: JokerScreen, ctx: JokerContext, avoidFirst?: string): string[] {
  const ids: string[] = [];
  for (const line of POOLS[screen] ?? []) if (!line.once) ids.push(line.id);
  for (const line of ctx.set?.joker?.[screen] ?? []) {
    if (!line.once) for (let i = 0; i < SET_WEIGHT; i++) ids.push(line.id);
  }
  const rand = mulberry32(newSeed());
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  // a reshuffled bag may not open on the line that closed the last one
  if (ids.length > 1 && ids[0] === avoidFirst) [ids[0], ids[1]] = [ids[1], ids[0]];
  return ids;
}

// ---- the public surface ----

/**
 * The line he would say on this screen, right now. Pure: two calls with the
 * same state give the same answer, and neither spends anything.
 */
export function peekLine(screen: JokerScreen, ctx: JokerContext = {}): JokerPick {
  const seen = readSeen();
  const open = eligible(poolFor(screen, ctx), ctx, seen);

  // 2 — a once-line that is due outranks the pool it would have drawn from
  const asides = ctx.allowOnce ? eligible(oncePool(ctx), ctx, seen).filter((e) => e.line.once) : [];
  const due = [...asides, ...open.filter((e) => e.line.once)][0];
  if (due) return { id: due.line.id, text: due.text, once: true };

  const common = open.filter((e) => !e.line.once);
  if (common.length === 0) return NO_LINE;

  // 3 — the rare tier, when the screen has one and the roll lands
  const rare = common.filter((e) => e.line.tier === "rare");
  if (rare.length > 0 && Math.floor(Math.random() * RARE_ODDS) === 0) {
    const one = rare[Math.floor(Math.random() * rare.length)];
    return { id: one.line.id, text: one.text };
  }

  // 4 — the bag. An id that is not eligible right now keeps its place rather
  // than being burned: a conditional line waits for its condition.
  const byId = new Map(common.map((e) => [e.line.id, e]));
  const draw = (ids: string[]): JokerPick | null => {
    const at = ids.findIndex((id) => byId.has(id));
    if (at < 0) return null;
    const hit = byId.get(ids[at])!;
    return {
      id: hit.line.id,
      text: hit.text,
      bag: { screen, ids: [...ids.slice(0, at), ...ids.slice(at + 1)] },
    };
  };
  const bag = readBags()[screen] ?? [];
  return (
    draw(bag) ??
    draw(refill(screen, ctx, bag[bag.length - 1])) ??
    // nothing in either bag is eligible, so take the first line that is
    { id: common[0].line.id, text: common[0].text }
  );
}

/**
 * Spend it. Called when the line has actually been on screen — a once-line is
 * retired, and the bag moves past the id so the next visit is a different line.
 */
export function commitLine(pick: JokerPick): void {
  if (!pick.id || typeof window === "undefined") return;
  if (pick.once) {
    const seen = readSeen();
    if (seen.has(pick.id)) return;
    seen.add(pick.id);
    writeSeen(seen);
    return;
  }
  if (!pick.bag) return;
  writeBags({ ...readBags(), [pick.bag.screen]: pick.bag.ids });
}

/**
 * Pick once, commit when shown. `beat` is what makes a new line warranted —
 * a new prompt, a new screen — and nothing else re-draws: a re-render must
 * never change what he is in the middle of saying, because `Joker.tsx`
 * restarts its typing whenever the text changes.
 *
 * The first paint has no line at all. This is a static export, so the line
 * depends on storage the server cannot see; rather than guess and swap, the
 * panel reserves its height (`.jokerLine` min-height) and he starts talking a
 * tick later. Nothing under him moves either way.
 */
export function useJokerLine(
  /** null where this screen is not the one showing — a screen he is not on
      must not spend a line, and a hook may not be called conditionally */
  screen: JokerScreen | null,
  ctx: JokerContext = {},
  beat: unknown = null,
): JokerPick {
  const [pick, setPick] = useState<JokerPick>(NO_LINE);
  // The context is read at pick time and is never itself a reason to pick
  // again. This effect is declared first so it has always run by the time the
  // pick below reads it.
  const latest = useRef(ctx);
  useEffect(() => {
    latest.current = ctx;
  });

  // One draw per beat, however many times the effect runs. React's StrictMode
  // runs it twice in development, and a second draw would spend a line that
  // was never on screen — the one thing the peek/commit split exists to stop.
  const drawn = useRef<string | null>(null);

  useEffect(() => {
    if (!screen) return;
    const key = `${screen}|${String(beat)}`;
    if (drawn.current === key) return;
    drawn.current = key;
    const chosen = peekLine(screen, latest.current);
    setPick(chosen);
    commitLine(chosen);
  }, [screen, beat]);

  return pick;
}
