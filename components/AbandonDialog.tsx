"use client";

// The confirm on ✕ (SPEC-v5a §3, S7). A run is all-or-nothing, so leaving is a
// real loss and the Joker says so himself rather than a system alert doing it.
//
// The round stays mounted behind the dialog — ink, queue and hand untouched —
// so cancelling costs nothing at all.

import { useRef } from "react";
import { useJokerLine } from "@/lib/joker-lines";
import { useDialogKeys } from "./dialogKeys";
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
  const line = useJokerLine("abandon");
  useDialogKeys(panel, keep, onCancel);

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
        <Joker line={line.text} lineId={line.id} tail="top" />
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
