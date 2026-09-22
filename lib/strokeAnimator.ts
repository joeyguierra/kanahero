// Plays a vendored strokesvg file the way a pen writes.
//
// File anatomy (see public/strokes/*.svg):
//   <g data-strokesvg="shadows"> — filled outline of each stroke, used as clip
//     paths and as the faint "ghost" of the full character (fill: var(--shadow))
//   <g data-strokesvg="strokes"> — one child per pen stroke, in writing order,
//     tagged style="--i:N". A child is a single centerline <path>, or a <g> of
//     several paths when the stroke self-intersects (loops in あ, ま, ほ...).
//
// A <g> child is NOT a sequence of sub-strokes: it is the *same* trajectory
// repeated once per clip region, so the crossing layers correctly. Upstream's
// own animator says as much — "all strokes in a group should be the same
// length". So its paths animate together, as one pen stroke, over one shared
// length. Drawing them one after another redraws the stroke and reads as a
// stall partway through.
//
// Each centerline is revealed start-to-end with stroke-dasharray/-dashoffset,
// clipped to its shadow, so the stroke grows in the direction the pen moves.
// Duration scales with path length: a long sweep takes longer than a tick.

const SPEED = 1600; // svg user units per second (viewBox is 1024)
const MIN_MS = 140; // floor so tiny ticks don't blink
const GAP_MS = 260; // pen-lift pause between strokes

interface Stroke {
  /** every path that draws this one pen stroke; >1 when it self-intersects */
  paths: SVGPathElement[];
  /** shared length for all of them — see the note above */
  len: number;
}

export interface StrokePlayer {
  /** number of pen strokes (not path segments) */
  strokeCount: number;
  /** park every stroke off-screen without drawing any of it — for a character
      that is mounted but has not had its turn yet (the word reveal loads all
      its cells before the first one starts) */
  hide(): void;
  /** hide all strokes, then draw them in order; resolves when done.
      onStroke fires with the 1-based stroke number as each begins. */
  play(onStroke?: (n: number) => void): Promise<void>;
  /** draw the rest at `factor` times the pace, from now: the stroke in
      flight speeds up, the pause after it is cut short, and every stroke
      still to come runs at the new pace. Sticks until the player is cancelled. */
  hurry(factor: number): void;
  /** show the finished character without animating */
  finish(): void;
  /** stop and detach; safe to call more than once */
  cancel(): void;
}

export function createStrokePlayer(svg: SVGSVGElement): StrokePlayer {
  const strokesGroup = svg.querySelector<SVGGElement>('[data-strokesvg="strokes"]');
  const strokes: Stroke[] = [];
  for (const unit of Array.from(strokesGroup?.children ?? [])) {
    const paths =
      unit instanceof SVGPathElement
        ? [unit]
        : Array.from(unit.querySelectorAll<SVGPathElement>("path"));
    if (paths.length === 0) continue;
    // The clipped copies are meant to be identical in length; optimization
    // rounds them apart. Averaging keeps the worst desync to half the spread,
    // so no copy is left short of its endpoint.
    const len =
      paths.reduce((sum, p) => sum + p.getTotalLength(), 0) / paths.length;
    strokes.push({ paths, len });
  }

  let cancelled = false;
  let running: Animation[] = [];
  /** the pace, as a multiple of the pen's own */
  let rate = 1;
  /** cuts the pen-lift pause short, while one is pending */
  let wake: (() => void) | null = null;

  // Hide by parking the dash fully off the path. Offsets deliberately overshoot
  // by 1 unit on each side: a dash boundary sitting exactly on a path endpoint
  // paints a round-cap dot.
  const hidden = (len: number) => `${len + 3}`;

  function hideAll() {
    for (const stroke of strokes) {
      for (const path of stroke.paths) {
        path.style.strokeDasharray = `${stroke.len + 2} ${stroke.len + 2}`;
        path.style.strokeDashoffset = hidden(stroke.len);
      }
    }
  }

  function showAll() {
    for (const stroke of strokes) {
      for (const path of stroke.paths) path.style.strokeDashoffset = "1";
    }
  }

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        wake = null;
        resolve();
      };
      const timer = setTimeout(done, ms);
      wake = done;
    });

  async function play(onStroke?: (n: number) => void) {
    cancelled = false;
    hideAll();
    for (let i = 0; i < strokes.length; i++) {
      if (i > 0) await sleep(GAP_MS / rate);
      if (cancelled) return;
      const stroke = strokes[i];
      onStroke?.(i + 1);
      const duration = Math.max(MIN_MS, (stroke.len / SPEED) * 1000);
      // one pen stroke: every copy runs on the same clock
      running = stroke.paths.map((path) => {
        const a = path.animate(
          [{ strokeDashoffset: hidden(stroke.len) }, { strokeDashoffset: "1" }],
          { duration, easing: "ease-in-out", fill: "none" },
        );
        a.playbackRate = rate;
        return a;
      });
      try {
        await Promise.all(running.map((a) => a.finished));
      } catch {
        return; // cancelled mid-stroke
      }
      for (const path of stroke.paths) path.style.strokeDashoffset = "1"; // commit
    }
  }

  function stop() {
    cancelled = true;
    wake?.();
    for (const a of running) a.cancel();
    running = [];
  }

  return {
    strokeCount: strokes.length,
    hide: hideAll,
    play,
    hurry(factor: number) {
      rate = factor;
      for (const a of running) a.playbackRate = rate;
      wake?.();
    },
    finish() {
      stop();
      showAll();
    },
    cancel: stop,
  };
}
