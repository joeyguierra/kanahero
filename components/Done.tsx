"use client";

// S5 — Done. Today's items in the order written, minutes, the next line,
// CLOSE. No score, streak, share or praise (SPEC-v7 §7).

import { dayLabel } from "@/lib/days";
import type { LoopResult } from "./Loop";

export default function Done({
  day,
  results,
  minutes,
  next,
  onClose,
}: {
  day: string;
  results: LoopResult[];
  minutes: number;
  /** "next: 9 due tomorrow", or null when nothing is scheduled */
  next: string | null;
  onClose: () => void;
}) {
  return (
    <main className="frame v7Done">
      <div className="v7Head">
        <span>DONE</span>
        <span>{dayLabel(day)}</span>
      </div>
      <ol className="v7DoneList">
        {results.map((r, i) => (
          <li key={i} className="v7DoneRow">
            <span className="v7DoneWord">{r.word}</span>
            <span className="v7DoneReading">{r.reading !== r.word ? r.reading : ""}</span>
            <span className="v7DoneMark" aria-label={r.ok ? "got it" : "missed"}>
              {r.ok ? "✓" : "✗"}
            </span>
          </li>
        ))}
      </ol>
      <div className="v7DoneFoot">
        <div className="v7Counts">{minutes} min</div>
        {next && <div className="v7Next">{next}</div>}
        <button type="button" className="btnStrike actionBar" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </main>
  );
}
