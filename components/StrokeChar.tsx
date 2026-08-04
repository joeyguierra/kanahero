"use client";

// Inlines a vendored stroke SVG and animates it with createStrokePlayer.
// Used by /verify (grid of all 71) and later by the reveal screen.

import { useEffect, useRef, useState } from "react";
import { createStrokePlayer, type StrokePlayer } from "@/lib/strokeAnimator";
import { strokeSvgPath, type Kana } from "@/lib/kana";

export default function StrokeChar({
  kana,
  autoplay = true,
  onReady,
}: {
  kana: Kana;
  autoplay?: boolean;
  onReady?: (player: StrokePlayer) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const playerRef = useRef<StrokePlayer | null>(null);
  const [strokeCount, setStrokeCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

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
        if (!svg) throw new Error("no svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        const player = createStrokePlayer(svg as SVGSVGElement);
        playerRef.current = player;
        setStrokeCount(player.strokeCount);
        onReady?.(player);
        if (autoplay) player.play();
        else player.finish();
      } catch {
        if (!dead) setError(true);
      }
    })();
    return () => {
      dead = true;
      playerRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kana.hex]);

  return (
    <button
      type="button"
      className="strokeChar"
      onClick={() => playerRef.current?.play()}
      title={`${kana.romaji} — tap to replay`}
    >
      <div ref={holder} className="strokeCharSvg" />
      <div className="strokeCharLabel">
        {error ? (
          <span className="strokeCharError">failed to load</span>
        ) : (
          <>
            <span>{kana.romaji}</span>
            <span className="strokeCharCount">
              {strokeCount === null ? "…" : `${strokeCount} stroke${strokeCount === 1 ? "" : "s"}`}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
