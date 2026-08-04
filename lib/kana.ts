// The 71 hiragana this app drills: 46 base + 20 dakuten + 5 handakuten.
// Romaji is Hepburn (shi, chi, tsu, fu, ji, zu); を is "wo", ん is "n".
// `hex` is the Unicode codepoint, used as the stroke SVG filename.

export interface Kana {
  kana: string;
  romaji: string;
  hex: string;
  base: boolean; // member of the base 46
}

function k(kana: string, romaji: string, base: boolean): Kana {
  return { kana, romaji, hex: kana.codePointAt(0)!.toString(16).padStart(4, "0"), base };
}

export const KANA: Kana[] = [
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

export const BASE_46 = KANA.filter((x) => x.base);

export function strokeSvgPath(kana: Kana): string {
  return `/strokes/${kana.hex}.svg`;
}
