// Platform sets: the word decks that ship as JSON in public/sets.
//
// A set is data, not code — the only things fixed here are the ids (progress
// keys on them, forever) and the shape. User-created sets are not in this
// build (SPEC-v5 §10).

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
}

/** every platform set, in the order the decks show them */
export const PLATFORM_SET_IDS = [
  "everyday-hiragana",
  "countries-katakana",
  "test-kanji",
  "daily-basics-kanji",
  "station-kanji",
] as const;

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
