// Platform sets: the word decks that ship as JSON in public/sets.
//
// A set is data, not code — the only things fixed here are the ids (progress
// keys on them, forever) and the shape.

export type SetScript = "hiragana" | "katakana" | "kanji";

export interface SetWord {
  /** the written form; the word id within its set */
  word: string;
  /** kana reading — equal to `word` in a kana set */
  reading: string;
  romaji: string;
  meaning: string;
  kind?: string;
}

export interface WordSet {
  id: string;
  name: string;
  glyph: string;
  /** kanji sets only: the place glyph on the card */
  place?: string;
  /** kanji sets only: the card's kind word — defaults to PLACE (the station set) */
  label?: string;
  /** the deck row's one-line description — defaults per script */
  blurb?: string;
  script: SetScript;
  origin: "platform";
  words: SetWord[];
  /** the word S0 and S1 show beside the name; defaults to the script */
  tag?: string;
  /** v5b's per-set Joker lines: tolerated in the file, ignored (SPEC-v7 §4) */
  joker?: unknown;
}

/** what S0 and S1 print beside a set's name */
export function tagOf(set: WordSet): string {
  return set.tag ?? set.script;
}

/** every platform set, in the order the decks show them */
export const PLATFORM_SET_IDS = [
  "everyday-hiragana",
  "countries-katakana",
  "daily-basics-kanji",
  "station-kanji",
  "calendar-kanji",
  "n5-mock-words",
] as const;

/** one item per word, not per character (SPEC-v7 §4) */
export function itemId(setId: string, word: string): string {
  return `${setId}/${word}`;
}

/**
 * What the prompt may show. Never the written form: a kana set prompts with
 * romaji, a kanji set with meaning + reading — and a kana-only word inside a
 * kanji set (つける) with the meaning alone, because its reading is its form.
 */
export function promptFor(set: WordSet, w: SetWord): { main: string; reading?: string } {
  if (set.script !== "kanji") return { main: w.romaji };
  return w.reading === w.word ? { main: w.meaning } : { main: w.meaning, reading: w.reading };
}

export async function loadSet(id: string): Promise<WordSet> {
  const res = await fetch(`/sets/${id}.json`);
  if (!res.ok) throw new Error(`set ${id}: ${res.status}`);
  return res.json();
}

export function loadPlatformSets(): Promise<WordSet[]> {
  return Promise.all(PLATFORM_SET_IDS.map(loadSet));
}

/** every distinct character a set asks the user to write, in first-seen order */
export function charsInSet(set: WordSet): string[] {
  const seen: string[] = [];
  for (const w of set.words) for (const ch of w.word) if (!seen.includes(ch)) seen.push(ch);
  return seen;
}
