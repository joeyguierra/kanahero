"use client";

// S1a — asked once per set, the first time it opens (SPEC-v7 §7). "Known"
// deals the whole set blind and lands a got-it on rung 2 (§5 rule 6).

import { tagOf, type WordSet } from "@/lib/sets";
import type { Placement as Choice } from "@/lib/store";

export default function Placement({
  set,
  onChoose,
}: {
  set: WordSet;
  onChoose: (choice: Choice) => void;
}) {
  return (
    <main className="frame v7Placement">
      <div className="v7Head">
        <span>{set.name}</span>
        <span>{tagOf(set)}</span>
      </div>
      <div className="grow" />
      <h1 className="v7Question">Have you written these before?</h1>
      <div className="v7Choices">
        <button type="button" className="btnSeam v7Choice" onClick={() => onChoose("new")}>
          New to these
        </button>
        <button type="button" className="btnSeam v7Choice" onClick={() => onChoose("known")}>
          I can already write some
        </button>
      </div>
      <div className="grow v7GrowLow" />
    </main>
  );
}
