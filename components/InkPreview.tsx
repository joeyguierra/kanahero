"use client";

// The whole word's ink on one screen, read-only (SPEC-v7 v7.0.1).
//
// Each box's ink is drawn again, smaller, through the same routine the board
// uses (lib/ink.ts), so the shape is the shape that was written: only the
// size changes. The boxes sit side by side, scaled to fit the layer and
// centred in it. One box at full size lands exactly where it was written.

import { useEffect, useRef } from "react";
import { drawInk, type InkSnapshot } from "@/lib/ink";

export default function InkPreview({ boxes }: { boxes: (InkSnapshot | null)[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const ctx = canvas.getContext("2d");
      const size = boxes.find((b) => b)?.box;
      if (!ctx || !size) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const scale = Math.min(rect.width / (boxes.length * size.w), rect.height / size.h);
      const x0 = (rect.width - boxes.length * size.w * scale) / 2;
      const y0 = (rect.height - size.h * scale) / 2;
      boxes.forEach((box, i) => {
        if (!box) return;
        ctx.setTransform(dpr, 0, 0, dpr, (x0 + i * size.w * scale) * dpr, y0 * dpr);
        drawInk(ctx, box.strokes, scale);
      });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [boxes]);

  return <canvas ref={canvasRef} className="v7InkPreview" data-boxes={boxes.length} aria-hidden />;
}
