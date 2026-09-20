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
// He talks with his mouth: two frames, open and closed. Open is his resting
// face. While the line is streaming the mark alternates the two; the moment
// the line is done — typed out, tapped through, or skipped for reduced motion
// — it snaps back to open and holds. Both frames are 1080² PNGs in
// public/assets/ with the same alpha bounds, so one crop fits both and the
// swap is a `src` change on one element: nothing moves but the mouth.

import { useEffect, useRef, useState, type Ref } from "react";

/** ms per character — one steady rate, start to finish, no breath anywhere */
const TICK = 22;
/** a beat before he starts, so the line reads as an answer to the screen */
const LEAD_IN = 120;
/** ms per mouth frame while he talks — about five flaps a second reads as
    speech; faster is chatter, slower is chewing */
const FLAP = 110;

/** the resting face; the source of truth for the mascot art, and the frame
    every screen without a line shows */
export const JOKER_ART = "/assets/joker-mascot-open.png";
/** the other frame, only ever shown mid-line */
export const JOKER_ART_TALK = "/assets/joker-mascot-close.png";

// Where he actually is inside that 1080² PNG, measured off its alpha channel:
// x 61–1018, y 158–921, so 958 × 764 of art in a square with transparent
// margins — both frames, to the pixel. `size` means the height of the art, the
// way the canvas measures him (78px, 110px on S1) — so the element is sized to
// the whole square and the margin is pulled back out, leaving his slot the
// size it is drawn.
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
      {/* the mouth moves with the characters, not the lead-in: he starts
          talking on the first one and stops on the last */}
      <JokerMark size={size} ref={markRef} talking={typed.n > 0 && !done} />
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

/**
 * The mouth. True while the closed frame is up; only ever true mid-line, and
 * false again the same render `talking` drops, so the snap back to open never
 * waits on a timer.
 */
function useMouthFlap(talking: boolean): boolean {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!talking) return;
    const id = setInterval(() => setClosed((c) => !c), FLAP);
    return () => {
      clearInterval(id);
      setClosed(false);
    };
  }, [talking]);
  return talking && closed;
}

export function JokerMark({
  size = 78,
  ref,
  /** streams the mouth; off (the default) is the resting face, held */
  talking = false,
}: {
  size?: number;
  ref?: Ref<HTMLImageElement>;
  talking?: boolean;
}) {
  const closed = useMouthFlap(talking);
  // the first swap must not wait on a fetch: warm the second frame as soon as
  // he is on screen, so the flap is a cache hit from the first tick
  useEffect(() => {
    new Image().src = JOKER_ART_TALK;
  }, []);

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
      src={closed ? JOKER_ART_TALK : JOKER_ART}
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
