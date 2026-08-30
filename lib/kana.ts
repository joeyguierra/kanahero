// The 71 hiragana this app drills: 46 base + 20 dakuten + 5 handakuten,
// and the 71 katakana that mirror them one for one.
// Romaji is Hepburn (shi, chi, tsu, fu, ji, zu); を/ヲ is "wo", ん/ン is "n".
// `hex` is the Unicode codepoint, used as the stroke SVG filename.

export type Script = "hiragana" | "katakana";

export interface Kana {
  kana: string;
  romaji: string;
  hex: string;
  base: boolean; // member of the base 46
  script: Script;
}

function hex(kana: string): string {
  return kana.codePointAt(0)!.toString(16).padStart(4, "0");
}

function k(kana: string, romaji: string, base: boolean): Kana {
  return { kana, romaji, hex: hex(kana), base, script: "hiragana" };
}

export const HIRAGANA: Kana[] = [
  // base 46
  k("あ", "a", true), k("い", "i", true), k("う", "u", true), k("え", "e", true), k("お", "o", true),
  k("か", "ka", true), k("き", "ki", true), k("く", "ku", true), k("け", "ke", true), k("こ", "ko", true),
  k("さ", "sa", true), k("し", "shi", true), k("す", "su", true), k("せ", "se", true), k("そ", "so", true),
  k("た", "ta", true), k("ち", "chi", true), k("つ", "tsu", true), k("て", "te", true), k("と", "to", true),
  k("な", "na", true), k("に", "ni", true), k("ぬ", "nu", true), k("ね", "ne", true), k("の", "no", true),
  k("は", "ha", true), k("ひ", "hi", true), k("ふ", "fu", true), k("へ", "he", true), k("ほ", "ho", true),
  k("ま", "ma", true), k("み", "mi", true), k("む", "mu", true), k("め", "me", true), k("も", "mo", true),
  k("や", "ya", true), k("ゆ", "yu", true), k("よ", "yo", true),
  k("ら", "ra", true), k("り", "ri", true), k("る", "ru", true), k("れ", "re", true), k("ろ", "ro", true),
  k("わ", "wa", true), k("を", "wo", true), k("ん", "n", true),
  // dakuten 20
  k("が", "ga", false), k("ぎ", "gi", false), k("ぐ", "gu", false), k("げ", "ge", false), k("ご", "go", false),
  k("ざ", "za", false), k("じ", "ji", false), k("ず", "zu", false), k("ぜ", "ze", false), k("ぞ", "zo", false),
  k("だ", "da", false), k("ぢ", "dji", false), k("づ", "dzu", false), k("で", "de", false), k("ど", "do", false),
  k("ば", "ba", false), k("び", "bi", false), k("ぶ", "bu", false), k("べ", "be", false), k("ぼ", "bo", false),
  // handakuten 5
  k("ぱ", "pa", false), k("ぴ", "pi", false), k("ぷ", "pu", false), k("ぺ", "pe", false), k("ぽ", "po", false),
];

// Unicode lays katakana out as a copy of the hiragana block shifted by 0x60
// (あ U+3042 → ア U+30A2, ん U+3093 → ン U+30F3), and the two scripts agree on
// reading and on which kana are base vs marked. So the katakana set is derived
// rather than retyped: parity is then structural, not something to keep in sync.
const KATAKANA_OFFSET = 0x60;

export const KATAKANA: Kana[] = HIRAGANA.map((h) => {
  const kana = String.fromCodePoint(h.kana.codePointAt(0)! + KATAKANA_OFFSET);
  return { kana, romaji: h.romaji, hex: hex(kana), base: h.base, script: "katakana" };
});

export const BY_SCRIPT: Record<Script, Kana[]> = {
  hiragana: HIRAGANA,
  katakana: KATAKANA,
};

/** the deck for a home-screen choice */
export function kanaSet(script: Script, base: boolean): Kana[] {
  const all = BY_SCRIPT[script];
  return base ? all.filter((x) => x.base) : all;
}

export function strokeSvgPath(kana: Kana): string {
  return `/strokes/${kana.hex}.svg`;
}
