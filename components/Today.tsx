"use client";

// S1 — Today, the only home. What the queue owes, one button (SPEC-v7 §7):
//   deal  N due · M new, the spread, DEAL
//   more  the deal is written, the pile has room and unseen words remain
//   done  the pile is full or nothing is left: the next line, no button
// It never comments on absence. A long gap is a bigger number.

import { dayLabel } from "@/lib/days";
import { addDays } from "@/lib/schedule";
import type { TodayView } from "@/lib/store";

const CARD_W = 60;

/** "next: Sun 15 Nov · 10 due" */
function nextLine(next: NonNullable<TodayView["next"]>): string {
  return `next: ${dayLabel(next.day)} · ${next.count} due`;
}

/** One card per word, due first: 1–7 in one row, 8–20 in two, 21–30 in
    three; upper rows take the odd cards. Rows tighten into an overlap when
    they run out of width. */
function Spread({ due, fresh }: { due: number; fresh: number }) {
  const n = due + fresh;
  const rowCount = n <= 7 ? 1 : n <= 20 ? 2 : 3;
  const rows = Array.from(
    { length: rowCount },
    (_, r) => Math.floor(n / rowCount) + (r < n % rowCount ? 1 : 0),
  );
  const cols = rows[0];
  const gap = cols > 1 ? `min(8px, calc((100% - ${cols * CARD_W}px) / ${cols - 1}))` : "0px";
  let i = 0;
  return (
    <div className="v7Spread" aria-hidden>
      {rows.map((count, r) => (
        <div className="v7SpreadRow" key={r}>
          {Array.from({ length: count }, (_, j) => {
            const isDue = i++ < due;
            return (
              <i
                key={j}
                className={`v7SpreadCard${isDue ? " v7SpreadDue" : ""}`}
                style={j === 0 ? undefined : { marginLeft: gap }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Today({
  day,
  view,
  onDeal,
  onExport,
  onCredits,
}: {
  day: string;
  view: TodayView;
  onDeal: (more: boolean) => void;
  onExport: () => void;
  onCredits: () => void;
}) {
  return (
    <main className="frame v7Today">
      <div className="v7Head">
        <span>TODAY</span>
        <span>{dayLabel(day)}</span>
      </div>

      {view.kind === "done" ? (
        <div className="v7Counts v7CountsNext">{view.next ? nextLine(view.next) : "nothing scheduled"}</div>
      ) : (
        <div className="v7Counts">
          {view.due} due · {view.fresh} new
        </div>
      )}
      {/* reserved: one line, blank in v7 */}
      <div className="v7Slot" />
      {view.kind === "more" && view.next && <div className="v7Next">{nextLine(view.next)}</div>}

      <div className="grow" />
      {view.kind === "deal" && <Spread due={view.due} fresh={view.fresh} />}
      <div className="grow" />

      {view.kind === "deal" && (
        <button type="button" className="btnStrike actionBar" onClick={() => onDeal(false)}>
          DEAL
        </button>
      )}
      {view.kind === "more" && (
        <button type="button" className="btnSeam actionBar v7Outline" onClick={() => onDeal(true)}>
          MORE
        </button>
      )}
      <div className="v7Foot v7TodayFoot">
        <button type="button" onClick={onExport}>
          export ledger
        </button>
        <button type="button" onClick={onCredits}>
          credits
        </button>
      </div>
    </main>
  );
}

/** "next: 9 due tomorrow" / "next: 9 due Tue 17 Nov" — S5's line */
export function nextDueLine(next: TodayView["next"], today: string): string | null {
  if (!next) return null;
  const when = next.day === addDays(today, 1) ? "tomorrow" : dayLabel(next.day);
  return `next: ${next.count} due ${when}`;
}
