// Where a character's vendored stroke file lives.
//
// One flat directory keyed by codepoint, two sources behind it: kana come from
// strokesvg (MIT, Klee One outlines), kanji from KanjiVG (CC BY-SA 3.0,
// normalized by scripts/fetch-kanjivg.mjs). Both are 1024-unit files with the
// same two groups, so nothing above this line needs to know which is which.

export function strokeSvgPath(char: string): string {
  return `/strokes/${char.codePointAt(0)!.toString(16)}.svg`;
}

/**
 * Make one stroke file safe to inline next to another copy of itself.
 *
 * strokesvg keys its clipPath ids off the codepoint, so a word with the same
 * kana twice (ちょっと, こんにちは) would inline two elements with the same id
 * and every clip-path would resolve to the first one — strokes vanish. The
 * suffix is per instance, so each cell of a reveal gets its own ids.
 */
export function scopeSvgIds(svg: string, suffix: string): string {
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  let out = svg;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`(\\sid=")${escaped}(")`, "g"), `$1${id}-${suffix}$2`)
      .replace(new RegExp(`(href=")#${escaped}(")`, "g"), `$1#${id}-${suffix}$2`)
      .replace(new RegExp(`(url\\(#)${escaped}(\\))`, "g"), `$1${id}-${suffix}$2`);
  }
  return out;
}

/** small kana render at 0.7x inside their cell, bottom-left (SPEC-v5 §4) */
const SMALL_KANA = new Set([..."ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ"]);

export function isSmallKana(char: string): boolean {
  return SMALL_KANA.has(char);
}
