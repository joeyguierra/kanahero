// Where a character's vendored stroke file lives.
//
// One flat directory keyed by codepoint, two sources behind it: kana come from
// strokesvg (MIT, Klee One outlines), kanji from KanjiVG (CC BY-SA 3.0,
// normalized by scripts/fetch-kanjivg.mjs). Both are 1024-unit files with the
// same two groups, so nothing above this line needs to know which is which.

export function strokeSvgPath(char: string): string {
  return `/strokes/${char.codePointAt(0)!.toString(16)}.svg`;
}
