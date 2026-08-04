// Plays a vendored strokesvg file the way a pen writes.
//
// File anatomy (see public/strokes/*.svg):
//   <g data-strokesvg="shadows"> — filled outline of each stroke, used as clip
//     paths and as the faint "ghost" of the full character (fill: var(--shadow))
//   <g data-strokesvg="strokes"> — one child per stroke, in writing order,
//     tagged style="--i:N". A child is a single centerline <path>, or a <g> of
//     several paths when the stroke self-intersects (loops in あ, ま, ほ...).
//
// Each centerline is revealed start-to-end with stroke-dasharray/-dashoffset,
// clipped to its shadow, so the stroke grows in the direction the pen moves.
// Duration scales with path length: a long sweep takes longer than a tick.

const SPEED = 1600; // svg user units per second (viewBox is 1024)
const MIN_MS = 140; // floor so tiny ticks don't blink
const GAP_MS = 260; // pen-lift pause between strokes

interface Segment {
  path: SVGPathElement;
  len: number;
}

export interface StrokePlayer {
  /** number of pen strokes (not path segments) */
  strokeCount: number;
  /** hide all strokes, then draw them in order; resolves when done */
  play(): Promise<void>;
  /** show the finished character without animating */
  finish(): void;
  /** stop and detach; safe to call more than once */
  cancel(): void;
}

export function createStrokePlayer(svg: SVGSVGElement): StrokePlayer {
  const strokesGroup = svg.querySelector<SVGGElement>('[data-strokesvg="strokes"]');
  // one entry per pen stroke; loops are split into sequential segments
  const strokes: Segment[][] = [];
  for (const unit of Array.from(strokesGroup?.children ?? [])) {
    const paths =
      unit instanceof SVGPathElement
        ? [unit]
        : Array.from(unit.querySelectorAll<SVGPathElement>("path"));
    if (paths.length === 0) continue;
    strokes.push(paths.map((path) => ({ path, len: path.getTotalLength() })));
  }

  let cancelled = false;
  let running: Animation | null = null;

  // Hide by parking the dash fully off the path. Offsets deliberately overshoot
  // by 1 unit on each side: a dash boundary sitting exactly on a path endpoint
  // paints a round-cap dot.
  function hideAll() {
    for (const seg of strokes.flat()) {
      seg.path.style.strokeDasharray = `${seg.len + 2} ${seg.len + 2}`;
      seg.path.style.strokeDashoffset = `${seg.len + 3}`;
    }
  }

  function showAll() {
    for (const seg of strokes.flat()) {
      seg.path.style.strokeDashoffset = "1";
    }
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function play() {
    cancelled = false;
    hideAll();
    for (let i = 0; i < strokes.length; i++) {
      if (i > 0) await sleep(GAP_MS);
      for (const seg of strokes[i]) {
        if (cancelled) return;
        const duration = Math.max(MIN_MS, (seg.len / SPEED) * 1000);
        running = seg.path.animate(
          [{ strokeDashoffset: `${seg.len + 3}` }, { strokeDashoffset: "1" }],
          { duration, easing: "ease-in-out", fill: "none" },
        );
        try {
          await running.finished;
        } catch {
          return; // cancelled mid-stroke
        }
        seg.path.style.strokeDashoffset = "1"; // commit final state
      }
    }
  }

  return {
    strokeCount: strokes.length,
    play,
    finish() {
      cancelled = true;
      running?.cancel();
      showAll();
    },
    cancel() {
      cancelled = true;
      running?.cancel();
    },
  };
}
