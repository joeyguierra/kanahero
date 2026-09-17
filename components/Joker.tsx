"use client";

// The dealer, on every screen. Flat panel, 1px seam, square tail, mono tag,
// one line, and he never says two things at once.
//
// The line types itself out, RPG-style (creator call, v5 — it overrides
// SPEC-v5 §6 "never animates"). The tail of the line is laid out but hidden
// rather than absent, so the panel is its full height from the first frame and
// nothing below it — the board especially — moves while he talks. Tapping the
// panel finishes the line, and `prefers-reduced-motion` skips the typing
// altogether.
//
// The art is `public/joker-mascot.png` — the official mascot, one square PNG
// with an alpha channel, precached like everything else in public/. Swapping
// it later means replacing that file and nothing else.

import { useEffect, useRef, useState, type Ref } from "react";

/** ms per character — one steady rate, start to finish, no breath anywhere */
const TICK = 22;
/** a beat before he starts, so the line reads as an answer to the screen */
const LEAD_IN = 120;

/** the source of truth for the mascot art; nothing else references the file */
export const JOKER_ART = "/joker-mascot.png";

// Where he actually is inside that 1080² PNG, measured off its alpha channel:
// x 61–1018, y 158–921, so 958 × 764 of art in a square with transparent
// margins. `size` means the height of the art, the way the canvas measures him
// (78px, 110px on S1) — so the element is sized to the whole square and the
// margin is pulled back out, leaving his slot the size it is drawn.
const ART = { box: 1080, x: 61, y: 158, w: 958, h: 764 };
/** the canvas pulls his shoulder this far into the screen gutter */
const SHOULDER = 8;

export default function Joker({
  line,
  size = 78,
  /** the round screens put him beside the card, so his tail points up */
  tail = "left",
  /** S6b measures his hand off the art and flicks it once per card */
  markRef,
  /** the corpus id of the line, published for the e2e — a pool makes the text
      a coin flip, so nothing outside the corpus asserts on his wording */
  lineId,
  className = "",
}: {
  line: string;
  size?: number;
  tail?: "left" | "top";
  markRef?: Ref<HTMLImageElement>;
  lineId?: string;
  className?: string;
}) {
  const [typed, setTyped] = useState({ line, n: 0 });
  // a new line starts over from nothing: adjusting state during render rather
  // than in an effect keeps it to one pass, with no frame of the old line
  if (typed.line !== line) setTyped({ line, n: 0 });
  const shown = [...line];
  const done = typed.n >= shown.length;

  // the pending work, so finishing the line early can stop the rest of it
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    if (ticker.current) clearInterval(ticker.current);
    timer.current = null;
    ticker.current = null;
  };

  useEffect(() => {
    const chars = [...line];
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    const start = () => {
      ticker.current = setInterval(() => {
        i++;
        setTyped({ line, n: i });
        if (i >= chars.length) stop();
      }, TICK);
    };
    timer.current = reduced
      ? setTimeout(() => setTyped({ line, n: chars.length }), 0)
      : setTimeout(start, LEAD_IN);
    return stop;
  }, [line]);

  return (
    <div className={`joker joker-${tail} ${className}`.trim()}>
      <JokerMark size={size} ref={markRef} />
      <div
        className="jokerPanel"
        data-line={lineId || undefined}
        onClick={(e) => {
          if (done) return;
          // the RPG contract: a tap on the box finishes the line, and does not
          // reach whatever the screen does with a tap
          e.stopPropagation();
          stop();
          setTyped({ line, n: shown.length });
        }}
      >
        <span className="jokerTail" aria-hidden />
        <div className="jokerTag">JOKER</div>
        <p className="jokerLine">
          <span className={done ? "jokerSaid" : "jokerSaid jokerSaying"}>
            {shown.slice(0, typed.n).join("")}
          </span>
          <span className="jokerRest">{shown.slice(typed.n).join("")}</span>
        </p>
      </div>
    </div>
  );
}

export function JokerMark({ size = 78, ref }: { size?: number; ref?: Ref<HTMLImageElement> }) {
  const scale = size / ART.h; // rendered px per art px
  const box = ART.box * scale;
  return (
    // A vendored PNG in public/, served from this origin and precached; there
    // is nothing for a loader to optimize, and next/image is off in a static
    // export.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="jokerMark"
      ref={ref}
      src={JOKER_ART}
      alt=""
      width={Math.round(box)}
      height={Math.round(box)}
      style={{
        width: box,
        height: box,
        marginLeft: -ART.x * scale - SHOULDER,
        marginRight: -(ART.box - ART.x - ART.w) * scale,
        marginTop: -ART.y * scale,
        marginBottom: -(ART.box - ART.y - ART.h) * scale,
      }}
      aria-hidden
    />
  );
}
