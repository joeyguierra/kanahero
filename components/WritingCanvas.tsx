"use client";

// Freehand ink canvas. Pointer events (finger/stylus/mouse), stroke width
// varies with pointer speed for a pen-like line, backing store scaled to
// devicePixelRatio. Strokes are kept as flat point arrays so Undo can pop one
// and redraw — and so a receipt can take them (SPEC-v6 §4). Coordinates are
// stored in CSS pixels. The drawing itself lives in lib/ink.ts: one routine,
// shared with the card that shows the ink back.

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { drawInk, INK, quantise, segmentWidth, W_MAX, type InkSnapshot, type InkStroke } from "@/lib/ink";

export interface WritingCanvasHandle {
  clear(): void;
  undo(): void;
  /** the ink as it stands, with the box it was drawn in — null with no ink */
  snapshot(): InkSnapshot | null;
}

const WritingCanvas = forwardRef<
  WritingCanvasHandle,
  {
    frozen: boolean;
    onInkChange?: (hasInk: boolean) => void;
  }
>(function WritingCanvas({ frozen, onInkChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<InkStroke[]>([]);
  const drawing = useRef(false);
  const lastWidth = useRef(W_MAX);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  const notify = useCallback(() => onInkChange?.(strokes.current.length > 0), [onInkChange]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawInk(ctx, strokes.current);
  }, []);

  // size backing store to element * dpr; redraw on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  useImperativeHandle(ref, () => ({
    clear() {
      strokes.current = [];
      redraw();
      notify();
    },
    undo() {
      strokes.current.pop();
      redraw();
      notify();
    },
    snapshot() {
      const canvas = canvasRef.current;
      if (!canvas || strokes.current.length === 0) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        box: { w: Math.round(rect.width), h: Math.round(rect.height) },
        strokes: quantise(strokes.current),
      };
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const at = (e: PointerEvent): [number, number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top, e.timeStamp];
    };

    const down = (e: PointerEvent) => {
      if (frozenRef.current || !e.isPrimary) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing.current = true;
      lastWidth.current = W_MAX;
      strokes.current.push([...at(e)]);
      notify();
    };

    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const stroke = strokes.current[strokes.current.length - 1];
      const events = e.getCoalescedEvents?.() ?? [e];
      ctx.strokeStyle = INK;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const ev of events) {
        const [x, y, t] = at(ev);
        const n = stroke.length;
        const px = stroke[n - 3];
        const py = stroke[n - 2];
        const pt = stroke[n - 1];
        if (Math.hypot(x - px, y - py) < 1) continue;
        lastWidth.current = segmentWidth(px, py, pt, x, y, t, lastWidth.current);
        ctx.lineWidth = lastWidth.current;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
        stroke.push(x, y, t);
      }
    };

    const up = () => {
      if (!drawing.current) return;
      drawing.current = false;
      redraw(); // normalize (dot for taps, clean joins)
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [notify, redraw]);

  return <canvas ref={canvasRef} className={`ink${frozen ? " inkFrozen" : ""}`} />;
});

export default WritingCanvas;
