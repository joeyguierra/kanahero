"use client";

// Freehand ink canvas. Pointer events (finger/stylus/mouse), stroke width
// varies with pointer speed for a pen-like line, backing store scaled to
// devicePixelRatio. Strokes are kept as point arrays so Undo can pop one
// and redraw. Coordinates are stored in CSS pixels.

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface WritingCanvasHandle {
  clear(): void;
  undo(): void;
}

interface Point {
  x: number;
  y: number;
  t: number;
}

const INK = "#0a0a0b"; // dark ink on the bone paper canvas
const W_MAX = 9; // slow pen
const W_MIN = 3.5; // fast pen
const SPEED_FULL_THIN = 2.2; // px/ms at which the line is thinnest
const SMOOTH = 0.6; // width smoothing (0..1, higher = steadier)

function segmentWidth(prev: Point, next: Point, lastWidth: number): number {
  const dt = Math.max(1, next.t - prev.t);
  const dist = Math.hypot(next.x - prev.x, next.y - prev.y);
  const speed = dist / dt;
  const target = Math.max(W_MIN, W_MAX - (speed / SPEED_FULL_THIN) * (W_MAX - W_MIN));
  return SMOOTH * lastWidth + (1 - SMOOTH) * target;
}

const WritingCanvas = forwardRef<
  WritingCanvasHandle,
  {
    frozen: boolean;
    onInkChange?: (hasInk: boolean) => void;
  }
>(function WritingCanvas({ frozen, onInkChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const drawing = useRef(false);
  const lastWidth = useRef(W_MAX);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  const notify = useCallback(() => onInkChange?.(strokes.current.length > 0), [onInkChange]);

  const drawSegment = useCallback((ctx: CanvasRenderingContext2D, a: Point, b: Point, w: number) => {
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = INK;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokes.current) {
      if (stroke.length === 1) {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, W_MAX / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      let w = W_MAX;
      for (let i = 1; i < stroke.length; i++) {
        w = segmentWidth(stroke[i - 1], stroke[i], w);
        drawSegment(ctx, stroke[i - 1], stroke[i], w);
      }
    }
  }, [drawSegment]);

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
  }));

  const toPoint = (e: PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: e.timeStamp };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const down = (e: PointerEvent) => {
      if (frozenRef.current || !e.isPrimary) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing.current = true;
      lastWidth.current = W_MAX;
      strokes.current.push([toPoint(e)]);
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
        const pt = toPoint(ev);
        const prev = stroke[stroke.length - 1];
        if (Math.hypot(pt.x - prev.x, pt.y - prev.y) < 1) continue;
        lastWidth.current = segmentWidth(prev, pt, lastWidth.current);
        drawSegment(ctx, prev, pt, lastWidth.current);
        stroke.push(pt);
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
  }, [drawSegment, notify, redraw]);

  return <canvas ref={canvasRef} className={`ink${frozen ? " inkFrozen" : ""}`} />;
});

export default WritingCanvas;
