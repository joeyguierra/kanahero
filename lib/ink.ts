// The ink, as a drawing routine with no DOM in it (SPEC-v6 §4).
//
// The writing canvas draws through this, and so does a receipt — the same
// colour, the same speed-varied width, the same round caps, so a copy's ink on
// a card is the ink that was on the board when it was graded, at half the
// size. If the two ever disagree, the card is wrong (§2.6).
//
// A stroke is a flat array: x, y, t, x, y, t, … — CSS pixels of the box it was
// drawn in, and milliseconds. Flat because it is what gets stored: a five-kana
// word is a few hundred points, and three numbers a point is as small as it
// honestly gets without quantising the shape.

export const INK = "#0a0a0b"; // dark ink on the bone paper canvas
export const W_MAX = 9; // slow pen
export const W_MIN = 3.5; // fast pen
const SPEED_FULL_THIN = 2.2; // px/ms at which the line is thinnest
const SMOOTH = 0.6; // width smoothing (0..1, higher = steadier)

/** one pen stroke: [x, y, t, x, y, t, …] */
export type InkStroke = number[];

/** the ink on a board, with the board it was drawn on (SPEC-v6 §3.1) */
export interface InkSnapshot {
  box: { w: number; h: number };
  strokes: InkStroke[];
}

/** the pen's width for the segment between two points, given the width it had */
export function segmentWidth(
  ax: number,
  ay: number,
  at: number,
  bx: number,
  by: number,
  bt: number,
  lastWidth: number,
): number {
  const dt = Math.max(1, bt - at);
  const dist = Math.hypot(bx - ax, by - ay);
  const speed = dist / dt;
  const target = Math.max(W_MIN, W_MAX - (speed / SPEED_FULL_THIN) * (W_MAX - W_MIN));
  return SMOOTH * lastWidth + (1 - SMOOTH) * target;
}

/** when the last point of the attempt was put down, in its own clock */
export function inkDuration(strokes: InkStroke[]): number {
  let end = 0;
  for (const s of strokes) if (s.length >= 3) end = Math.max(end, s[s.length - 1]);
  return end;
}

/**
 * Draw the strokes onto a context, at `scale`, up to time `until` (in the
 * strokes' own clock; omit for all of it). The caller owns the transform and
 * the clear — this only puts ink down.
 */
export function drawInk(
  ctx: CanvasRenderingContext2D,
  strokes: InkStroke[],
  scale = 1,
  until = Infinity,
): void {
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    if (s.length < 3 || s[2] > until) continue;
    if (s.length === 3) {
      // a tap is a dot
      ctx.beginPath();
      ctx.arc(s[0] * scale, s[1] * scale, (W_MAX / 2) * scale, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    let w = W_MAX;
    for (let i = 3; i < s.length; i += 3) {
      if (s[i + 2] > until) break;
      w = segmentWidth(s[i - 3], s[i - 2], s[i - 1], s[i], s[i + 1], s[i + 2], w);
      ctx.lineWidth = w * scale;
      ctx.beginPath();
      ctx.moveTo(s[i - 3] * scale, s[i - 2] * scale);
      ctx.lineTo(s[i] * scale, s[i + 1] * scale);
      ctx.stroke();
    }
  }
}

/**
 * The ink as it is kept: coordinates to a tenth of a pixel, time as whole
 * milliseconds from the first point of the whole attempt, so the pauses
 * between strokes survive and the clock starts at zero.
 */
export function quantise(strokes: InkStroke[]): InkStroke[] {
  let t0 = Infinity;
  for (const s of strokes) if (s.length >= 3) t0 = Math.min(t0, s[2]);
  if (!Number.isFinite(t0)) t0 = 0;
  return strokes.map((s) => {
    const out: number[] = [];
    for (let i = 0; i + 2 < s.length; i += 3) {
      out.push(Math.round(s[i] * 10) / 10, Math.round(s[i + 1] * 10) / 10, Math.round(s[i + 2] - t0));
    }
    return out;
  });
}
