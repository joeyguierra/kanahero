// The word list: one ordered queue, shipped as JSON in public/words.
//
// The list is data, not code. Two of its promises are load-bearing and are
// checked by scripts/verify-strokes.mjs: every `write` is unique (it is the
// item id, forever), and every `meaning` is unique (a kana word is prompted by
// its meaning alone).

export type Script = "hiragana" | "katakana" | "kanji";

export interface Word {
  /** place in the queue, from 1 */
  order: number;
  /** exactly what the learner handwrites; the item id */
  write: string;
  /** the script the prompt names */
  ask: Script;
  /** the full reading in kana — equal to `write` for a kana word */
  reading: string;
  /** the usual kanji form of a word asked in hiragana, for the answer screen */
  kanji: string | null;
  romaji: string;
  meaning: string;
  pos?: string;
  source?: string;
  note?: string;
}

export interface Cue {
  script: Script;
  main: string;
  reading?: string;
}

/**
 * What the prompt may show. Never the written form: a kanji word prompts with
 * its meaning and reading, a kana word with its meaning alone, because its
 * reading is its form. The script label says which form is being asked for.
 */
export function promptFor(w: Word): Cue {
  return w.ask === "kanji"
    ? { script: w.ask, main: w.meaning, reading: w.reading }
    : { script: w.ask, main: w.meaning };
}

export async function loadWords(): Promise<Word[]> {
  const res = await fetch("/words/n5.json");
  if (!res.ok) throw new Error(`word list: ${res.status}`);
  return res.json();
}

/** every distinct character the list asks the user to write, in first-seen order */
export function charsInWords(words: Word[]): string[] {
  const seen = new Set<string>();
  for (const w of words) for (const ch of w.write) seen.add(ch);
  return [...seen];
}
