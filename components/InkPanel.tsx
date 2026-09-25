"use client";

// The receipt's body: the ink that earned a copy, drawn as the board drew it,
// with the model word laid over it where it lay on the day (SPEC-v6 §5.2).
//
// The board it was written on is `ink.box`, in CSS px; this panel is the card's
// body, roughly half as wide and not the same shape. So the box is scaled by
// the smaller of the two ratios and centred — letterboxed, never cropped —
// and the model's cells and the board's own centre guides are laid out inside
// the *drawn* box, not the panel, or a receipt letterboxed by height would
// put the model where the ink is not.
//
// The ink is the subject here, so it is full and the model sits over it
// faint — the flip's opacities the other way round (§5.2).

import { useEffect, useRef, useState } from "react";
import { drawInk, inkDuration, type InkSnapshot } from "@/lib/ink";
import WordReveal from "./WordReveal";

/** a held receipt writes itself in its own time, but no longer than this */
const PLAY_CAP_MS = 2000;

function reduced(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export default function InkPanel({
  ink,
  word,
  play,
}: {
  ink: InkSnapshot;
  word: string;
  /** true: the strokes draw from the first point; false: all of it at once */
  play: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; scale: number } | null>(null);

  // fit the board to the panel, and again if the panel ever changes size
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const scale = Math.min(w / ink.box.w, h / ink.box.h);
      setBox({ w: ink.box.w * scale, h: ink.box.h * scale, scale });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ink.box.w, ink.box.h]);

  // the ink: all at once, or written out in its own (capped) time
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx || !box) return;
    const dpr = window.devicePixelRatio || 1;
    el.width = Math.round(box.w * dpr);
    el.height = Math.round(box.h * dpr);
    const paint = (until: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      drawInk(ctx, ink.strokes, box.scale, until);
    };
    const total = inkDuration(ink.strokes);
    if (!play || total === 0 || reduced()) {
      paint(Infinity);
      return;
    }
    // sped up so the whole attempt fits the cap; held past the end it rests
    const rate = Math.max(1, total / PLAY_CAP_MS);
    const t0 = performance.now();
    let frame = 0;
    const tick = () => {
      const until = (performance.now() - t0) * rate;
      paint(until);
      if (until < total) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ink, box, play]);

  return (
    <div className="receiptBody" ref={panel}>
      {box && (
        <div className="receiptBox" style={{ width: box.w, height: box.h }}>
          <canvas ref={canvas} className="receiptInk" style={{ width: box.w, height: box.h }} />
          <WordReveal word={word} animate={false} />
        </div>
      )}
    </div>
  );
}
