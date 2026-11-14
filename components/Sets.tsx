"use client";

// S0 — the set list. One plain list: name · tag · due · new. A row opens its
// set; nothing here is selected, started or scored (SPEC-v7 §7).

import type { WordSet } from "@/lib/sets";
import { tagOf } from "@/lib/sets";
import { todayView, type V7State } from "@/lib/store";

export default function Sets({
  sets,
  state,
  today,
  onOpen,
  onExport,
  onCredits,
}: {
  sets: WordSet[];
  state: V7State;
  today: string;
  onOpen: (set: WordSet) => void;
  onExport: () => void;
  onCredits: () => void;
}) {
  return (
    <main className="frame v7Sets">
      <div className="v7Head">
        <span>SETS</span>
      </div>
      <ul className="v7SetList">
        {sets.map((set) => {
          const view = todayView(state, set, today);
          return (
            <li key={set.id}>
              <button type="button" className="v7SetRow" onClick={() => onOpen(set)}>
                <span className="v7SetName">
                  {set.name} <span className="v7SetTag">{tagOf(set)}</span>
                </span>
                <span className="v7SetCounts">
                  {view.due} due · {view.fresh} new
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="grow" />
      <div className="v7Foot">
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
