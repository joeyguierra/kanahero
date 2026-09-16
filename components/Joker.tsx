"use client";

// The dealer, on every screen. Flat panel, 1px seam, square tail, mono tag,
// one line. He never animates and he never says two things at once.
//
// The art is `public/joker-mascot.png` — the official mascot, one square PNG
// with an alpha channel, precached like everything else in public/. Swapping
// it later means replacing that file and nothing else.

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
  className = "",
}: {
  line: string;
  size?: number;
  tail?: "left" | "top";
  className?: string;
}) {
  return (
    <div className={`joker joker-${tail} ${className}`.trim()}>
      <JokerMark size={size} />
      <div className="jokerPanel">
        <span className="jokerTail" aria-hidden />
        <div className="jokerTag">JOKER</div>
        <p className="jokerLine">{line}</p>
      </div>
    </div>
  );
}

export function JokerMark({ size = 78 }: { size?: number }) {
  const scale = size / ART.h; // rendered px per art px
  const box = ART.box * scale;
  return (
    // A vendored PNG in public/, served from this origin and precached; there
    // is nothing for a loader to optimize, and next/image is off in a static
    // export.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="jokerMark"
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
