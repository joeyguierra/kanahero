// Everything the Joker says, in one table. Copied verbatim from the JOKER
// sheet of the v5 canvas — he is the only prose in the app, so the lines are
// data, not markup, and they are edited here or nowhere.
//
// Rules (SPEC-v5 §6): one line per screen, under twelve words, first person,
// dry. Never two lines at once. Never explains a mechanic twice — the two
// first-time lines are keyed by a `seen` set in localStorage.

const SEEN_KEY = "kanahero:v1.joker.seen";

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
  | "credits";

/** lines that may be shown once ever, then never again */
export type JokerOnce = "wholeWord" | "kuchi";

const LINES: Record<JokerScreen, string> = {
  home: "Pick a deck. I'll deal, you write.",
  // once, after the v2 → v3 wipe (SPEC-v5a §2) — then never again
  "home.wiped": "New rules, so I reshuffled. Your old cards are gone.",
  "home.hiragana": "Native words, particles, endings. The first script.",
  "home.katakana": "Loanwords, names, signs. Same sounds, sharper strokes.",
  "home.kanji": "Kanji. Meaning, not sound. One character, many readings.",
  "home.bank": "The bank. Characters you snapped but couldn't read yet.",
  "deck.hiragana": "Characters first, or straight to words. Your call.",
  "deck.katakana": "Same rules, sharper strokes. Countries today.",
  "deck.kanji": "No alphabet here. Only words, only places you've been.",
  drill: "That's the stroke. Yours next to mine — honest?",
  // the canvas draws S4 revealing only; the prompt state needs its own line or
  // his panel would empty out and move the canvas
  "drill.prompt": "From memory. I'll show you after.",
  bank: "What you couldn't read. Kept until you can.",
  collection: "Every copy you've made, word by word.",
  "collection.empty": "Nothing here yet. Finish a run.",
  abandon: "Leave now and this run's cards leave with you.",
  // the set and result lines carry the state's own numbers — see setLine and
  // resultLine; nothing on S6b or S8 is a fixed string any more
  "round.kana": "Whole word, one box. Make it fit.",
  "round.kanji": "The kana's on the card — I want the kanji.",
  "round.missed": "Back in the deck. It'll come round again.",
  "reveal.kana": "Five characters, one line. Did they all land?",
  "reveal.kanji": "There it is. Be honest. Did your ink match mine?",
  // nothing is kept until the run finishes, and he never says otherwise (§1.6)
  "earned.shiny": "First try. Shiny — if you finish the run.",
  "earned.base": "Second try. Base stock. Finish to keep it.",
  "earned.worn": "Took a few. Worn stock. Finish to keep it.",
  credits: "Other people's work, named. That's the deal.",
};

const ONCE: Record<JokerOnce, string> = {
  // the first time a word reveal ever happens
  wholeWord: "Whole word, one box. Make it fit.",
  // the first station word that carries 口
  kuchi: "Five of these share 口. You'll know it by the third.",
};

export function jokerLine(screen: JokerScreen): string {
  return LINES[screen];
}

// He counts in words, not digits — the canvas lines do, and the sets are small
// enough that he never runs out.
const WORDS = [
  "No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen", "Twenty", "Twenty-one",
];

const count = (n: number) => WORDS[n] ?? String(n);

/**
 * S6b — the set is always face down and always dealt whole, so the only number
 * he has to work with is how many words are in it.
 */
export function setLine(total: number): string {
  return `${count(total)} words, face down. Deal when you're ready.`;
}

/** S7b — the reveal, counting what he just laid down */
export function revealLine(script: string, chars: number): string {
  if (script === "kanji") return LINES["reveal.kanji"];
  if (chars === 1) return "One character, one box. Did it land?";
  return `${count(chars)} characters, one line. Did they all land?`;
}

/** S8 — what the run minted. There is nothing left over to count: a run is
    the whole set, so the only variable is how much of it came up shiny. */
export function resultLine(minted: number, shiny: number): string {
  if (shiny === 0) return `${count(minted)} cards minted. Deal again whenever.`;
  return `${count(minted)} cards minted, ${count(shiny).toLowerCase()} shiny. Deal again whenever.`;
}

function seen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(list) ? list.filter((s) => typeof s === "string") : []);
  } catch {
    return new Set();
  }
}

/**
 * A line the Joker is allowed to say exactly once, ever — read without
 * spending it. Null once it has been seen, so the caller falls back to the
 * screen's own line and he never explains the same mechanic twice.
 */
export function peekOnce(id: JokerOnce): string | null {
  return seen().has(id) ? null : ONCE[id];
}

/** spend it: called when the line has actually been shown */
export function markSeen(id: JokerOnce): void {
  const already = seen();
  if (already.has(id)) return;
  already.add(id);
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...already]));
  } catch {
    // no storage — he repeats himself once in a while; not worth failing over
  }
}
