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
  | "set.kana"
  | "set.kanji"
  | "set.full"
  | "round.kana"
  | "round.kanji"
  | "round.missed"
  | "reveal.kana"
  | "reveal.kanji"
  | "earned.foil"
  | "earned.base"
  | "earned.worn"
  | "result.kana"
  | "result.kanji"
  | "result.full"
  | "credits";

/** lines that may be shown once ever, then never again */
export type JokerOnce = "wholeWord" | "kuchi";

const LINES: Record<JokerScreen, string> = {
  home: "Pick a deck. I'll deal, you write.",
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
  // set and result lines carry the state's own numbers — see setLine/resultLine
  "set.kana": "Ten words, four yours. The rest wait.",
  "set.kanji": "Three earned, nine face-down. Deal when you're ready.",
  "set.full": "Every card in this set is yours. Nothing left to deal.",
  "round.kana": "Whole word, one box. Make it fit.",
  "round.kanji": "The kana's on the card — I want the kanji.",
  "round.missed": "Back in the deck. It'll come round again.",
  "reveal.kana": "Five characters, one line. Did they all land?",
  "reveal.kanji": "There it is. Be honest. Did your ink match mine?",
  "earned.foil": "First try. That's foil — and foil never fades. Take it.",
  "earned.base": "Second time. Base stock, and it's yours.",
  "earned.worn": "Took a few. Worn stock — still yours, still counts.",
  "result.kana": "Words in hand. Come back for the rest.",
  "result.kanji": "That's your hand. The deck keeps the rest.",
  "result.full": "Every card. Nothing left for me to deal.",
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

/** S6b — the canvas phrasing with this set's own numbers */
export function setLine(script: string, total: number, earned: number): string {
  if (earned >= total) return LINES["set.full"];
  const left = total - earned;
  if (script === "kanji") {
    if (earned === 0) return `${count(left)} words, all face-down. Deal when you're ready.`;
    return `${count(earned)} earned, ${count(left).toLowerCase()} face-down. Deal when you're ready.`;
  }
  if (earned === 0) return `${count(total)} words, none yours yet. Let's fix that.`;
  return `${count(total)} words, ${count(earned).toLowerCase()} yours. The rest wait.`;
}

/** S7b — the reveal, counting what he just laid down */
export function revealLine(script: string, chars: number): string {
  if (script === "kanji") return LINES["reveal.kanji"];
  if (chars === 1) return "One character, one box. Did it land?";
  return `${count(chars)} characters, one line. Did they all land?`;
}

/** S8 — collected this round, and what the deck still holds */
export function resultLine(
  script: string,
  collected: number,
  foil: number,
  left: number,
): string {
  if (left === 0) return LINES["result.full"];
  if (script === "kanji") return `${count(collected)} in hand. The deck keeps the rest.`;
  if (foil > 0) {
    return `${count(collected)} words, ${count(foil).toLowerCase()} foil. Come back for the other ${count(left).toLowerCase()}.`;
  }
  return `${count(collected)} words. Come back for the other ${count(left).toLowerCase()}.`;
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

export function hasSeen(id: JokerOnce): boolean {
  return seen().has(id);
}
