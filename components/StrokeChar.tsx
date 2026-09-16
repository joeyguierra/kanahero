"use client";

// Inlines a vendored stroke SVG and animates it with createStrokePlayer.
// Character-keyed, not kana-keyed: /verify plays kanji through the same tile,
// which is the whole point of the acceptance check — one hand, two sources.

import { useEffect, useRef, useState } from "react";
import { createStrokePlayer, type StrokePlayer } from "@/lib/strokeAnimator";
import { strokeSvgPath } from "@/lib/strokes";

export default function StrokeChar({
  char,
  label,
  size,
  autoplay = true,
  onReady,
}: {
  char: string;
  /** what to print under the tile — romaji for kana, the word for a kanji */
  label: string;
  /** tile width; the default fills its grid cell */
  size?: number;
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
        const res = await fetch(strokeSvgPath(char));
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
  }, [char]);

  return (
    <button
      type="button"
      className="strokeChar"
      style={size ? { width: size } : undefined}
      onClick={() => playerRef.current?.play()}
      title={`${char} ${label} — tap to replay`}
    >
      <div ref={holder} className="strokeCharSvg" />
      <div className="strokeCharLabel">
        {error ? (
          <span className="strokeCharError">failed to load</span>
        ) : (
          <>
            <span>{label}</span>
            <span className="strokeCharCount">
              {strokeCount === null ? "…" : `${strokeCount} stroke${strokeCount === 1 ? "" : "s"}`}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
