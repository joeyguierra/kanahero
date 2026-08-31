"use client";

// Screen 5b — one capture, full size. The photo is the subject, so no ghost
// glyph competes with it.

import { useEffect, useMemo, useRef, useState } from "react";
import { deleteCapture, updateNote, type Capture } from "@/lib/bank";

/** `#023 · 2026-09-14 21:47` — local time, because "where I was" is a local
    memory. */
function timestamp(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** The writing canvas owns every touch gesture app-wide, so the viewport is
    locked at scale 1 — except here, where pinch-zooming the photo is the
    whole point of the screen. Restoring the old value on the way out also
    snaps an iOS zoom back to 1. */
function usePinchZoom(): void {
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const locked = meta.getAttribute("content") ?? "";
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover",
    );
    return () => meta.setAttribute("content", locked);
  }, []);
}

export default function CaptureDetail({
  capture,
  ordinal,
  total,
  onBack,
}: {
  capture: Capture;
  /** chronological rank, oldest is 1 — an id a human can say out loud */
  ordinal: number;
  total: number;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(capture.note);
  const [armed, setArmed] = useState(false);
  const deleteRef = useRef<HTMLButtonElement>(null);

  usePinchZoom();

  const url = useMemo(() => URL.createObjectURL(capture.blob), [capture.blob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  function commit() {
    setEditing(false);
    void updateNote(capture.id, draft.trim());
  }

  return (
    <main
      className="frame detailFrame"
      // any other touch disarms delete — one confirm, in place, and nothing
      // that a stray thumb can carry through
      onPointerDown={(e) => {
        if (armed && !deleteRef.current?.contains(e.target as Node)) setArmed(false);
      }}
    >
      <header className="appHead">
        <button type="button" className="quit" onClick={onBack}>
          ← Bank
        </button>
        <span className="detailPosition">
          {ordinal} / {total}
        </span>
      </header>

      <div className="detailPhoto">
        {/* eslint-disable-next-line @next/next/no-img-element -- a blob URL from IndexedDB; there is no loader to optimize it */}
        <img src={url} alt={capture.note || `Capture ${ordinal}`} />
      </div>

      <div className="detailMeta">
        <div className="detailStamp">
          #{String(ordinal).padStart(3, "0")} · {timestamp(capture.takenAt)}
        </div>

        {editing ? (
          <input
            className="noteInput"
            autoFocus
            value={draft}
            maxLength={120}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(capture.note);
                setEditing(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className={capture.note ? "noteText" : "noteAdd"}
            onClick={() => {
              setDraft(capture.note);
              setEditing(true);
            }}
          >
            {capture.note || "+ Add note"}
          </button>
        )}
      </div>

      <button
        ref={deleteRef}
        type="button"
        className={`btnDelete${armed ? " btnDeleteArmed" : ""}`}
        // dimmed while the keyboard is up, so a stray thumb can't arm it
        disabled={editing}
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          void deleteCapture(capture.id);
          onBack();
        }}
      >
        {armed ? "Delete — tap again" : "Delete"}
      </button>
    </main>
  );
}
