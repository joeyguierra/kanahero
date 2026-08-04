"use client";

// The reveal layer: inlines the correct character's stroke SVG on top of the
// frozen canvas and animates it the way a pen writes. Bare version of
// StrokeChar — no chrome, parent owns Replay and the stroke count.

import { useEffect, useRef } from "react";
import { createStrokePlayer, type StrokePlayer } from "@/lib/strokeAnimator";
import { strokeSvgPath, type Kana } from "@/lib/kana";

export default function StrokeOverlay({
  kana,
  onReady,
  onStroke,
}: {
  kana: Kana;
  onReady?: (player: StrokePlayer) => void;
  /** 1-based stroke number as each begins drawing */
  onStroke?: (n: number) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const playerRef = useRef<StrokePlayer | null>(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const res = await fetch(strokeSvgPath(kana));
        if (!res.ok) throw new Error(String(res.status));
        const text = await res.text();
        if (dead || !holder.current) return;
        holder.current.innerHTML = text;
        const svg = holder.current.querySelector("svg");
        if (!svg) return;
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        const player = createStrokePlayer(svg as SVGSVGElement);
        playerRef.current = player;
        onReady?.(player);
        player.play(onStroke);
      } catch {
        // stroke file missing — reveal still shows the kana on the card
      }
    })();
    return () => {
      dead = true;
      playerRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kana.hex]);

  return <div ref={holder} className="canvasOverlay" />;
}
