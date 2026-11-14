"use client";

// S1 — Today. The set, what it owes, one button (SPEC-v7 §7):
//   deal        N due · M new, the spread, DEAL
//   writeAnyway today's deal is finished and unseen items remain
//   done        nothing due and nothing unseen: the next line, no button
// It never comments on absence. A long gap is a bigger number.

import { dayLabel } from "@/lib/days";
import { addDays } from "@/lib/schedule";
import { tagOf, type WordSet } from "@/lib/sets";
import type { TodayView } from "@/lib/store";

const CARD_W = 60;

/** "next: Sun 15 Nov · 10 due" */
function nextLine(next: NonNullable<TodayView["next"]>): string {
  return `next: ${dayLabel(next.day)} · ${next.count} due`;
}

/** One card per item, due first: 1–7 in one row, 8+ in two, the top row takes
    the odd card. Rows tighten into an overlap when they run out of width. */
function Spread({ due, fresh }: { due: number; fresh: number }) {
  const n = due + fresh;
  const rows = n <= 7 ? [n] : [Math.ceil(n / 2), Math.floor(n / 2)];
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
  set,
  view,
  onSets,
  onDeal,
}: {
  set: WordSet;
  view: TodayView;
  onSets: () => void;
  onDeal: (writeAnyway: boolean) => void;
}) {
  return (
    <main className="frame v7Today">
      <button type="button" className="v7Head v7HeadLink" onClick={onSets}>
        <span>{set.name}</span>
        <span>{tagOf(set)}</span>
      </button>

      {view.kind === "done" ? (
        <div className="v7Counts v7CountsNext">{view.next ? nextLine(view.next) : "nothing scheduled"}</div>
      ) : (
        <div className="v7Counts">
          {view.due} due · {view.fresh} new
        </div>
      )}
      {/* reserved: one line, blank in v7 */}
      <div className="v7Slot" />
      {view.kind === "writeAnyway" && view.next && <div className="v7Next">{nextLine(view.next)}</div>}

      <div className="grow" />
      {view.kind === "deal" && <Spread due={view.due} fresh={view.fresh} />}
      <div className="grow" />

      {view.kind === "deal" && (
        <button type="button" className="btnStrike actionBar" onClick={() => onDeal(false)}>
          DEAL
        </button>
      )}
      {view.kind === "writeAnyway" && (
        <button type="button" className="btnSeam actionBar v7Outline" onClick={() => onDeal(true)}>
          WRITE ANYWAY
        </button>
      )}
    </main>
  );
}

/** "next: 9 due tomorrow" / "next: 9 due Tue 17 Nov" — S5's line */
export function nextDueLine(next: TodayView["next"], today: string): string | null {
  if (!next) return null;
  const when = next.day === addDays(today, 1) ? "tomorrow" : dayLabel(next.day);
  return `next: ${next.count} due ${when}`;
}
