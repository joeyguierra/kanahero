"use client";

// S7 — the prompt card is not dealt, it is made (v5a anims, S7).
//
// One SVG filter does the whole thing: fractal noise → displacement → blur.
// The card is fully present from the first frame, but pushed around by the
// noise — its edges run and the kana smears — and over the melt the
// displacement drains to zero and the blur sharpens, so the stock hardens into
// a card. Opacity is full by 40%; it settles the last 8px down from a 0.92
// scale. The Joker tips toward it as it starts and recovers as it hardens.
//
// Nothing else on the screen moves: the card is a fixed 150 × 210 box, so
// neither the filter nor the transform can reflow the canvas below it, and the
// melt never blocks input — the player can draw through it.
//
// The optional pink smoke behind the card (sheet, THE SMOKE) is off by default
// there and is not built here; the melt is the whole effect.

/** the filter's id, shared by the markup below and the animator */
const MELT_ID = "s7-melt";

/** ms, start to hard card */
const MELT_MS = 900;
/** px the noise pushes the stock around at the start */
const STRENGTH = 70;
/** px of blur under the displacement at the start */
const BLUR = 9;
/** the card is at full opacity this far into the melt */
const FADE_BY = 0.4;
/** px above its slot the card settles from */
const DROP = 8;
const START_SCALE = 0.92;
/** degrees he tips toward the card while it forms */
const TIP_DEG = -6;
/** reduced motion: no filter, no drop — the card just arrives */
const FADE_MS = 160;

/** the melt's filter chain. One per screen; the animator finds it by id. */
export function MeltFilter() {
  return (
    <svg className="meltFilter" width="0" height="0" aria-hidden>
      <filter
        id={MELT_ID}
        x="-30%"
        y="-30%"
        width="160%"
        height="160%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.03 0.07"
          numOctaves={2}
          seed={7}
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={0}
          xChannelSelector="R"
          yChannelSelector="G"
          result="warp"
        />
        <feGaussianBlur in="warp" stdDeviation={0} />
      </filter>
    </svg>
  );
}

/**
 * Melts `card` in, tipping `joker` toward it. Returns a cancel: it stops the
 * melt and leaves the card hard, which is the state every path has to end in —
 * `.roundCard` is transparent in CSS so there is no hard frame before the melt
 * starts, and nothing else ever turns it back on.
 */
export function meltIn(card: HTMLElement, joker: HTMLElement | null): () => void {
  const filter = document.getElementById(MELT_ID);
  const turb = filter?.querySelector("feTurbulence");
  const disp = filter?.querySelector("feDisplacementMap");
  const blur = filter?.querySelector("feGaussianBlur");

  const hard = () => {
    card.style.filter = "";
    card.style.transform = "";
    card.style.opacity = "1";
  };

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !turb || !disp || !blur || typeof card.animate !== "function") {
    hard();
    if (!reduced) return () => {};
    card.style.opacity = "0";
    const fade = card.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: FADE_MS,
      fill: "both",
    });
    fade.onfinish = hard;
    return () => {
      fade.cancel();
      hard();
    };
  }

  // a fresh noise field each time, so two prompts never melt the same way
  turb.setAttribute("seed", String(Math.floor(Math.random() * 100)));
  card.style.filter = `url(#${MELT_ID})`;
  card.style.opacity = "0";

  const tip =
    joker?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: `rotate(${TIP_DEG}deg) translateX(4px)`, offset: 0.25 },
        { transform: "rotate(0deg)" },
      ],
      { duration: MELT_MS, easing: "ease-in-out" },
    ) ?? null;

  let raf = 0;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / MELT_MS);
    const e = 1 - Math.pow(1 - p, 3);
    const left = 1 - e;
    // the displacement shivers on its way out, so the edges run rather than
    // simply shrinking back into place
    const wobble = 1 + Math.sin(p * 18) * 0.18 * left;
    disp.setAttribute("scale", (STRENGTH * left * wobble).toFixed(2));
    blur.setAttribute("stdDeviation", (BLUR * left).toFixed(2));
    // the noise coarsens as it drains: big soft shapes first, fine grain last
    turb.setAttribute(
      "baseFrequency",
      `${(0.012 + 0.03 * left).toFixed(4)} ${(0.03 + 0.05 * left).toFixed(4)}`,
    );
    card.style.opacity = Math.min(1, p / FADE_BY).toFixed(3);
    card.style.transform = `translateY(${(-DROP * left).toFixed(2)}px) scale(${(START_SCALE + (1 - START_SCALE) * e).toFixed(4)})`;
    if (p < 1) raf = requestAnimationFrame(step);
    else hard();
  };
  raf = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(raf);
    tip?.cancel();
    hard();
  };
}
