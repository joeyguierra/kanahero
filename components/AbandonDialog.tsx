"use client";

// The confirm on ✕ (SPEC-v5a §3, S7). A run is all-or-nothing, so leaving is a
// real loss and the Joker says so himself rather than a system alert doing it.
//
// The round stays mounted behind the dialog — ink, queue and hand untouched —
// so cancelling costs nothing at all.

import { useEffect, useRef } from "react";
import { jokerLine } from "@/lib/joker-lines";
import Joker from "./Joker";

export default function AbandonDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const keep = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    keep.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      // a modal keeps its own focus: tab cycles inside the dialog or nothing
      if (e.key !== "Tab") return;
      const stops = panel.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!stops?.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const at = document.activeElement;
      if (e.shiftKey && (at === first || !panel.current?.contains(at))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && at === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="dialogScrim" onClick={onCancel}>
      <div
        ref={panel}
        className="dialogPanel"
        role="dialog"
        aria-modal="true"
        aria-label="Leave this run?"
        onClick={(e) => e.stopPropagation()}
      >
        <Joker line={jokerLine("abandon")} tail="top" />
        <div className="dialogActions">
          <button ref={keep} type="button" className="btnBone dialogBtn" onClick={onCancel}>
            KEEP WRITING
          </button>
          <button type="button" className="btnGrade btnCaution dialogBtn" onClick={onConfirm}>
            LEAVE RUN
          </button>
        </div>
      </div>
    </div>
  );
}
